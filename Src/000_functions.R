clean_jmeter_log <- function(input_dt,
                             delete_ending_digets=TRUE,
                             delete_words_from_labels = c("variables"),
                             labels_to_delete_list=c("init","JDBC","auth - with password","Debug", "JSR223", "config") ){
  require(data.table)
  options(scipen = 9999)
  # input_dt <- report.preprocessing::jdt_dirty

  input_dt <- as.data.table(input_dt)
  # input_dt$timeStamp <- as.numeric(formatC(input_dt$timeStamp, format = "f", digits = 0),lenght=20)
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

  # numb <- 20172334534654667
  # numb
  #
  # formatC(numb, format = "f", digits = 0)

  input_dt <- delete_specific_words(input_dt,delete_words_from_labels)
  # input_dt <- trim_spaces_start_end(input_dt)
  # input_dt <- delete_label(input_dt,input_list_to_delete=labels_to_delete_list)

  input_dt <- input_dt %>%
    trim_spaces_start_end() %>%
    add_load_group() %>%
    add_rps_and_group() %>%
    delete_label(.,input_list_to_delete=labels_to_delete_list)

  if(delete_ending_digets){
    input_dt <- delete_digets_in_the_end(input_dt)
  }

  # input_dt <- input_dt[timeStamp > 1]
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
  input_dt[,":="("rps"=.N),by=dateTime]
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


#' A calculate agregated data
#'
#' This function get aggregated information about performance report.
#' @param input_dt input cleaned jmeter log.
#' @param personal_gpoup_with_load_gpoup provide aggregated table by grouping with request name and rps group Defaults to FALSE
#' @keywords statistics
#' @keywords aggregating
#' @export
#' @examples
#' get_aggregate_table(jdt)
#' @import data.table
#' @import scales

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