clean_jmeter_log <- function(input_dt,
                             delete_ending_digets=TRUE,
                             delete_words_from_labels = c("variables"),
                             labels_to_delete_list=c("init","JDBC","auth - with password","Debug", "JSR223", "config") ){
  require(data.table)
  options(scipen = 9999)

  input_dt <- as.data.table(input_dt)
  input_dt$timeStamp <- as.numeric(input_dt$timeStamp)
  input_dt$timeStamp <- as.POSIXct(input_dt$timeStamp/1000, origin="1970-01-01")
  input_dt$dateTime <- as.POSIXct(input_dt$timeStamp, origin="1970-01-01")
  input_dt$responseCode <- as.factor(input_dt$responseCode)
  input_dt$responseMessage <- as.factor(input_dt$responseMessage)
  input_dt$elapsed <- as.numeric(input_dt$elapsed)
  input_dt$date <- as.Date(input_dt$dateTime)
  input_dt$time <- format(input_dt$dateTime, "%H:%M:%OS3")
  input_dt$fulltime <- as.POSIXct(input_dt$timeStamp, origin="1970-01-01")
  input_dt$success <- as.logical(input_dt$success)
  input_dt$Latency <- as.numeric(input_dt$Latency)
  input_dt$response_time <- round(input_dt$elapsed)
  input_dt$request_name <- as.factor(input_dt$label)

  input_dt <- delete_specific_words(input_dt,delete_words_from_labels)

  input_dt <- input_dt %>%
    trim_spaces_start_end() %>%
    add_load_group() %>%
    add_rps_and_group() %>%
    delete_label(.,input_list_to_delete=labels_to_delete_list)

  if(delete_ending_digets){
    input_dt <- delete_digets_in_the_end(input_dt)
  }

  input_dt$request_name <- as.factor(input_dt$label)
  input_dt <- janitor::clean_names(input_dt, "snake")
  input_dt

}

delete_label <- function(input_dt, input_list_to_delete=c("init","JDBC","auth - with password","Debug"), na.rm.label=TRUE){
  require(data.table)
  input_dt <- as.data.table(input_dt)

  for (item in input_list_to_delete){
    input_dt <- input_dt[!grepl(tolower(item),tolower(label)),]
  }

  if(na.rm.label){
    input_dt <- input_dt[!is.na(label)][!(label %like% "NA")][!is.na(label)]
  }
  input_dt
}

add_load_group <- function(input_dt){
  require(data.table)
  input_dt <- as.data.table(input_dt)
  input_dt[,":="("load_group"=cut(allThreads, breaks = c(1,seq(10,10001,10)), include.lowest = TRUE)),]
  input_dt[allThreads == 1,load_group :="1"]
  input_dt
}

add_rps_and_group <- function(input_dt){
  require(data.table)
  input_dt <- as.data.table(input_dt)
  input_dt[,":="("rps"=.N),by=.(ts_sec = as.POSIXct(trunc(dateTime, "secs"), tz = "UTC"))]
  input_dt[,":="("load_rps_group"=cut(rps, breaks = c(1,seq(10,10001,10)), include.lowest = TRUE)),]
  input_dt[rps == 1,load_rps_group :="1"]
  input_dt
}

trim_spaces_start_end <- function(input_dt){
  input_dt$label <- input_dt$label %>% gsub(" $", "",.) %>% gsub("^ ", "",.)
  input_dt
}

delete_digets_in_the_end <- function(input_dt){
  input_dt$label <- input_dt$label %>% gsub("\\d+$", "",.) %>% gsub("\\W+$", "",.)  %>% gsub("^\\W+", "",.)
  input_dt
}

delete_specific_words <- function(input_dt, delete_words_list=NULL){
  if(!is.null(delete_words_list)){
    for (delete_word in delete_words_list){
      input_dt$label <- input_dt$label %>% sub(delete_word, "", ., ignore.case = TRUE)
    }
  }
  input_dt
}

get_uuid <- function(){
  if(.Platform$OS.type == "unix"){
    return(system("uuidgen", intern=T))
  }
  if(.Platform$OS.type == "linux"){
    return(system("uuid",intern=T))
  }
  if(.Platform$OS.type == "windows"){
    return(paste(
      substr(baseuuid,1,8),
      "-",
      substr(baseuuid,9,12),
      "-",
      "4",
      substr(baseuuid,13,15),
      "-",
      sample(c("8","9","a","b"),1),
      substr(baseuuid,16,18),
      "-",
      substr(baseuuid,19,30),
      sep="",
      collapse=""
    ))
  }
}


get_aggregate_table <- function(input_dt, personal_gpoup_with_load_gpoup=FALSE){
  options(scipen = 99999)
  temp_dt_1 <- input_dt
  temp_dt_1[,":="(start_time=min(date_time),end_time=max(date_time),amount=.N), by=request_name]
  temp_dt_1[,":="(duration=round(as.numeric(end_time-start_time,units="mins")))]
  temp_dt_1[,":="(troughput_per_min=round(amount/as.numeric(duration)))]
  temp_dt_1 <- unique(temp_dt_1[,.(request_name,troughput_per_min)]) %>% as.data.table()

  temp_dt_2 <- input_dt[,.("amount_of_samples"=.N,
                           "AVG"=round(mean(response_time, na.rm = TRUE)),
                           "minimum"=round(min(response_time,na.rm = TRUE)),
                           "median"=round(median(response_time, na.rm = TRUE)),
                           "q90"=round(quantile(response_time,.9, na.rm = TRUE)),
                           "q95"=round(quantile(response_time,.95, na.rm = TRUE)),
                           "q99"=round(quantile(response_time,.99, na.rm = TRUE)),
                           "maximum"=max(response_time, na.rm = TRUE),
                           "error_rate"=percent(-1*((sum(success)/.N)-1))
  ), by=request_name]

  if(personal_gpoup_with_load_gpoup){
    temp_dt_2 <- input_dt[,.("amount_of_samples"=.N,
                             "AVG"=round(mean(response_time, na.rm = TRUE)),
                             "minimum"=round(min(response_time, na.rm = TRUE)),
                             "median"=round(median(response_time, na.rm = TRUE)),
                             "q90"=round(quantile(response_time,.9, na.rm = TRUE)),
                             "q95"=round(quantile(response_time,.95, na.rm = TRUE)),
                             "q99"=round(quantile(response_time,.99, na.rm = TRUE)),
                             "maximum"=max(response_time, na.rm = TRUE),
                             "error_rate"=percent(-1*((sum(success)/.N)-1))
    ), by=.(request_name,load_rps_group)]
    setorder(temp_dt_2, request_name,load_rps_group)
    return(temp_dt_2)
  }


  result_dt <- left_join(temp_dt_2,temp_dt_1) %>% as.data.table()
  setorder(temp_dt_2, request_name)
  result_dt
}


save_ggplot <- function(plot_to_save,file_path_name=NULL, category_folder=""){
  if(!is.null(file_path_name)){
    fileName_to_save <- paste(file_path_name,".png",sep="")
    ggsave(fileName_to_save,plot_to_save,width = 16, height = 9, dpi = 350, units = "in", device='png')
    print(paste("plot successfully saved:",fileName_to_save))
  } else {
    plot_name <- deparse(substitute(plot_to_save))

    if(category_folder != ""){
      folder_to_save <- paste0(getwd(),"/",category_folder,sep="")
      if(!dir.exists(folder_to_save)){
        dir.create(folder_to_save)
      }
      fileName_to_save <- paste0(folder_to_save,"/",plot_name,".png",sep="")
    } else {
      fileName_to_save <- paste0(getwd(),"/",plot_name,".png",sep="")
    }

    ggsave(fileName_to_save, plot_to_save, width = 16, height = 9, dpi = 350, units = "in", device='png')
    print(paste("plot successfully saved:",fileName_to_save))
  }
}

add_logo <- function(input_gg_plot, logo_path){
  require(magick)
  require(cowplot)
  logo_img <- image_read(logo_path)
  input_gg_plot <- ggdraw() +
    draw_plot(input_gg_plot,x = 0, y = 0, width = 1, height = 1)+
    draw_image(logo_img,x = 0.85, y = 0.9, width = 0.1, height = 0.1)
  input_gg_plot
}

melt_function <- function(dt, measure_vars, variable_name, value_name) {
  # validate measure vars exist
  missing_cols <- setdiff(measure_vars, names(dt))
  if (length(missing_cols) > 0L) {
    stop("Missing measure.vars in input data.table: ", paste(missing_cols, collapse = ", "))
  }

  cols <- c("model_id", "max_concurrency", measure_vars)
  dt_copy <- dt[, ..cols]           # correct column selection using a character vector
  data.table::melt(
    dt_copy,
    id.vars = c("model_id", "max_concurrency"),
    measure.vars = measure_vars,
    variable.name = variable_name,
    value.name = value_name
  )
}


joined_melted_ttft_itl_tpot_dt <- function(dt){
  ttft_f_dt <- melt_function(dt, c("mean_ttft_ms", "median_ttft_ms", "p99_ttft_ms"), "stat", "value")
  ttft_f_dt[,measure:="ttft"]
  itl_f_dt <- melt_function(dt, c("mean_itl_ms", "median_itl_ms", "p99_itl_ms"), "stat", "value")
  itl_f_dt[,measure:="itl"]
  tpot_f_dt <- melt_function(dt, c("mean_tpot_ms", "median_tpot_ms", "p99_tpot_ms"), "stat", "value")
  tpot_f_dt[,measure:="tpot"]
  result_dt <- rbindlist(list(ttft_f_dt, itl_f_dt, tpot_f_dt))
  result_dt
}

dynamic_breaks_10 <- function(x) {
  rng <- range(x, na.rm = TRUE)
  span <- diff(rng)
  if (!is.finite(span) || span == 0) return(rng[1])

  raw_step <- span / 10
  step <- signif(raw_step, 1)  # nice rounded step (1, 2, 5, 10, ...)
  seq(floor(rng[1] / step) * step, ceiling(rng[2] / step) * step, by = step)
}