library(jsonlite)
library(data.table)
library(ggplot2)
library(ggthemes)

here::here()


initial_path <- here::here()
jmeter_results_path <- file.path(initial_path, "jmeter_results")
jmeter_all_results_path <- file.path(jmeter_results_path, "all_scenarios_dt.rds")
jmeter_reports_path <- file.path(initial_path, "jmeter_reports")
ggplots_folder <- file.path(jmeter_reports_path, "ggplots")
all_scenarios_dt <- readRDS(jmeter_all_results_path) %>% as.data.table()

FILE_LOGO <- "Perfonik_logo.png"
FILE_LOGO_path <- file.path(initial_path,"src", FILE_LOGO)


scenarios_colors <- unique(all_scenarios_dt$scenario_name)
print(scenarios_colors)

# set colors for each model
scenarios_colors <- c(
  setNames(c("#1a6be4ff", "#984EA3", "#41d5dfff", "#4DAF4A", "#f71616ff"), scenarios_colors)
)

list_of_words <-  c("Transaction")
list_of_apis <- c("http://192\\.168\\.0\\.165:8080/api/issues/DEMO-\\d+\\?fields=", "http://192\\.168\\.0\\.165:8080/api/sortedIssues", "http://192\\.168\\.0\\.165:8080/api/issuesGetter")
api_dt <- all_scenarios_dt[grepl(paste(list_of_apis, collapse = "|"), url)]

scenario_order <- c("scenario_40", "scenario_80", "scenario_120", "scenario_200", "scenario_step")
api_dt$scenario_name <- factor(api_dt$scenario_name, levels = scenario_order)

transaction_dt <- all_scenarios_dt[grepl(paste(list_of_words, collapse = "|"), label)]
only_api_dt <- all_scenarios_dt[!grepl(paste(list_of_words, collapse = "|"), label)]

api_dt[,api_name := "other"]
api_dt[url %like% "http://192\\.168\\.0\\.165:8080/api/issues/DEMO-\\d+\\?fields=", api_name := "GET id_fields"]
api_dt[url %like% "http://192\\.168\\.0\\.165:8080/api/sortedIssues", api_name := "GET sortedIssues"]
api_dt[url %like% "http://192\\.168\\.0\\.165:8080/api/issuesGetter", api_name := "POST issuesGetter"]

only_api_dt[,api_name := "other"]
only_api_dt[url %like% "http://192\\.168\\.0\\.165:8080/api/issues/DEMO-\\d+\\?fields=", api_name := "GET id_fields"]
only_api_dt[url %like% "http://192\\.168\\.0\\.165:8080/api/sortedIssues", api_name := "GET sortedIssues"]
only_api_dt[url %like% "http://192\\.168\\.0\\.165:8080/api/issuesGetter", api_name := "POST issuesGetter"]



api_dt[,.N, by = api_name]
api_dt[, .N, by = label]
transaction_dt[, .N, by = label]
transaction_dt[,.N, by = .(load_group)]



### Create visualisation ofr RPS per scenarios.

all_scenarios_dt
all_scenarios_dt[, time_stamp := as.POSIXct(time_stamp, tz = "UTC")]
noralizedtime <- all_scenarios_dt[
  order(scenario_name, time_stamp),
  t_sec := as.numeric(difftime(time_stamp, min(time_stamp), units = "secs")),
  by = scenario_name
]

TITLE <- "Load (RPS) during performance scenarios execution"
SUBTITLE <- "Comparison RPS over time for different scenarios"
CAPTION <- "NOTE: Despite for scenario_step target load was 100 active thread could not handle more than around 60 RPS"
TAG <- "Figure 6.2.1."
Y_LABEL <- "RPS (requests per second)"
X_LABEL <- "Scenario execution time (sec)"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)

figure_621 <- ggplot(noralizedtime, aes(x = t_sec, y = rps, color = scenario_name)) +
  geom_line() +
  scale_color_manual(name = "Scenarios:", values = scenarios_colors, breaks = scenario_order) +
  scale_x_continuous("Time since scenario start (sec)", breaks = seq(0, 3600, by = 600)) +
  theme_linedraw()+ facet_wrap(~scenario_name, ncol = 2, scales = "free_y") +
  labs(title=TITLE,
subtitle = SUBTITLE,
caption = CAPTION,
    tag = TAG,
x=X_LABEL,
y=Y_LABEL)
add_logo(figure_621, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)






############################################################
### Point plot response times for all apis
############################################################
api_colors <- c(
  "other" = "grey35",
  "GET sortedIssues" = "#1f77b4",
  "POST issuesGetter" = "#ff7f0e",
  "GET id_fields" = "#2ca02c"
)

TITLE <- "Response times for targeted API endpoints"
SUBTITLE <- "Scenario_40 - with expected number of user transaction per hour (40)"
CAPTION <- "NOTE: other include all other requests and were during scenario_40 (e.g. resources, css, js etc.)"
TAG <- "Figure 7.1.1."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "Scenario execution time"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)


figure_711 <- ggplot(only_api_dt[scenario_name == "scenario_40"], aes(x = time_stamp, y = response_time, color = api_name)) +
  geom_point(
    data = only_api_dt[scenario_name == "scenario_40"][api_name == "other"],
    aes(color = api_name),
    size = 0.35,
    alpha = 0.35
  ) +
  geom_point(
    data = only_api_dt[scenario_name == "scenario_40"][api_name != "other"],
    aes(color = api_name),
    size = 0.9,
    alpha = 0.9
  ) +
  scale_color_manual(name = "API", values = api_colors, breaks = names(api_colors)) +
  theme_minimal()+
  scale_y_sqrt(breaks = c(1, 10,20,30,40, 50,75, 100,200,300,400, 500, 1000,1200,1400,1600,1800, 2000))+
  labs(title    = TITLE,
      subtitle  = SUBTITLE,
      caption   = CAPTION,
          tag   = TAG,
          x     = X_LABEL,
          y     = Y_LABEL)

add_logo(figure_711, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)


############################################################
### box plot for api response times for scenario_40
############################################################

TITLE <- "Response times for targeted API endpoints"
SUBTITLE <- "Scenario_40 - with expected number of user transaction per hour (40)"
CAPTION <- "NOTE: other include all other requests and were during scenario_40 (e.g. resources, css, js etc.)"
TAG <- "Figure 7.1.2."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "User Transactions"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)

figure_712 <- ggplot(only_api_dt[scenario_name == "scenario_40"], aes(x = reorder(api_name, response_time, FUN = median), y = response_time, color = api_name)) +
  geom_boxplot() +
  scale_color_manual(name = "API:", values = api_colors, breaks = names(api_colors))  +
  scale_y_sqrt(breaks = c(1, 10,20,30 ,40, 50,75, 100,200,300,400, 500, 1000,1200,1400,1600,1800, 2000)) +
  theme(axis.text.x = element_text(angle = 45, vjust = 1, hjust=1))+
  theme_minimal() +
  labs(title    = TITLE,
      subtitle  = SUBTITLE,
      caption   = CAPTION,
          tag   = TAG,
          x     = X_LABEL,
          y     = Y_LABEL)

add_logo(figure_712, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)


############################################################
# Transacrion points for scenario_40
############################################################
t40_dt <- transaction_dt[scenario_name == "scenario_40"]
t40_dt[,request_name := gsub("Transaction - ","",request_name)]

t40_dt[,.N, by = .(scenario_name, request_name)]
head(t40_dt)

TITLE <- "Response times for user transactions"
SUBTITLE <- "Scenario_40 - with expected number of user transaction per hour (40)"
CAPTION <- "NOTE: Transacrtion is a sum of all requests inside (posts, gets, resources, css, js etc.)"
TAG <- "Figure 7.1.3."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "Scenario execution time"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)


figure_713 <- ggplot(t40_dt, aes(x = time_stamp, y = response_time, color = request_name)) +
  geom_point(size = 0.7, alpha = 0.9) +
  scale_y_sqrt(breaks = c(1, 10,20,30,40, 50,75, 100,200,300,400, 500, 1000,1200,1400,1600,1800, 2000))+
  theme_minimal() +


add_logo(figure_713, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)

############################################################
### transaction boxplot for scenario_40
############################################################

TITLE <- "Response times for user transactions"
SUBTITLE <- "Scenario_40 - with expected number of user transaction per hour (40)"
CAPTION <- "NOTE: Transacrtion is a sum of all requests inside (posts, gets, resources, css, js etc.)"
TAG <- "Figure 7.1.4."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "User Transactions"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)

figure_714 <- ggplot(data= t40_dt, aes(x=reorder(request_name, response_time, FUN = median), y=response_time, color=request_name)) +
  geom_boxplot() +
  scale_y_sqrt(breaks = c(1, 10,20,30,40, 50,75, 100,200,300,400, 500, 1000,1200,1400,1600,1800, 2000)) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, vjust = 1, hjust=1)) +

  labs(title    = TITLE,
      subtitle  = SUBTITLE,
      caption   = CAPTION,
          tag   = TAG,
          x     = X_LABEL,
          y     = Y_LABEL,
          color = "User Transactions:")

add_logo(figure_714, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)


############################################################
### quantile distribution for scenario_40 API
############################################################

input_dt <- only_api_dt[scenario_name == "scenario_40"]

csrt <- input_dt[,.(api_name,response_time)]
csrtshort <- csrt[, .("quantile_50" = as.double(median(response_time)),
                      "quantile_75" = quantile(response_time,0.75),
                      "quantile_90" = quantile(response_time,0.9),
                      "quantile_95" = quantile(response_time,0.95),
                      "quantile_99" = quantile(response_time,0.99)), by=api_name]
csrtshort[,"q50":=quantile_50]
csrtshort[,"q75":=quantile_75-quantile_50]
csrtshort[,"q90":=quantile_90-quantile_75]
csrtshort[,"q95":=quantile_95-quantile_90]
csrtshort[,"q99":=quantile_99-quantile_95]

gather_csrtshort<- gather(csrtshort, key = "quantile",value = "value", q50,q75,q90,q95,q99) %>% as.data.table()
setorder(gather_csrtshort, api_name)

gather_csrtshort <- gather_csrtshort[,.(api_name,quantile_99,quantile, value)]


gather_csrtshort_cum <- plyr::ddply(gather_csrtshort, "api_name",
                              transform,
                              label_ypos=round(cumsum(value),0)) %>% as.data.table()
#maxbp <- 3000
scenario_name <- "scenario_40"
plot_title <- paste("Barplot response time for different quantiles for", scenario_name)

maxbp <- plyr::round_any((max(csrtshort$quantile_99)+100), 100, f = ceiling)
if(maxbp < 1000) {maxbp <- 1500}
# listOfThreads <- paste0(sort("inputThread"), collapse = ", ")
plot_title <- paste()

TITLE <- "Barplot response time witnin for different quantiles for targeted API"
SUBTITLE <- "Scenario_40 - with expected number of user transaction per hour (40)"
CAPTION <- "NOTE: color shows upper and lower bound of quantiles"
TAG <- "Figure 7.1.5."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "Target API"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)

figure_715 <- ggplot(data=gather_csrtshort, aes(x=reorder(api_name, quantile_99), y=value, fill=quantile)) +
  geom_bar(stat="identity", position = position_stack(reverse = TRUE)) +
  theme_minimal() +
  scale_fill_manual(values=c("#33FFFF", "#33FF33","#FFFF33","#FF9933","#FF3333")) +
  coord_flip() +
  labs(title    = TITLE,
      subtitle  = SUBTITLE,
      caption   = CAPTION,
          tag   = TAG,
          x     = X_LABEL,
          y     = Y_LABEL,
          fill  = "Quantile") +
  scale_y_continuous(breaks = seq(0, maxbp, by = 50)) +
  theme(axis.text.x = element_text(angle = 45, vjust = 1, hjust=1),
        plot.subtitle = element_text(face = "bold",size =15))

add_logo(figure_715, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)



############################################################
### quantile distribution for scenario_40 TRANSACTION
############################################################

input_dt <- transaction_dt[scenario_name == "scenario_40"]

csrt <- input_dt[,.(request_name,response_time)]
csrtshort <- csrt[, .("quantile_50" = as.double(median(response_time)),
                      "quantile_75" = quantile(response_time,0.75),
                      "quantile_90" = quantile(response_time,0.9),
                      "quantile_95" = quantile(response_time,0.95),
                      "quantile_99" = quantile(response_time,0.99)), by=request_name]
csrtshort[,"q50":=quantile_50]
csrtshort[,"q75":=quantile_75-quantile_50]
csrtshort[,"q90":=quantile_90-quantile_75]
csrtshort[,"q95":=quantile_95-quantile_90]
csrtshort[,"q99":=quantile_99-quantile_95]

gather_csrtshort<- gather(csrtshort, key = "quantile",value = "value", q50,q75,q90,q95,q99) %>% as.data.table()
setorder(gather_csrtshort, request_name)

gather_csrtshort <- gather_csrtshort[,.(request_name,quantile_99,quantile, value)]


gather_csrtshort_cum <- plyr::ddply(gather_csrtshort, "request_name",
                              transform,
                              label_ypos=round(cumsum(value),0)) %>% as.data.table()
#maxbp <- 3000
scenario_name <- "scenario_40"
plot_title <- paste("Barplot response time for different quantiles for", scenario_name)

maxbp <- plyr::round_any((max(csrtshort$quantile_99)+100), 100, f = ceiling)
if(maxbp < 1000) {maxbp <- 1500}
# listOfThreads <- paste0(sort("inputThread"), collapse = ", ")

TITLE <- "Barplot response time witnin for different quantiles for User transactions"
SUBTITLE <- "Scenario_40 - with expected number of user transaction per hour (40)"
CAPTION <- "NOTE: color shows upper and lower bound of quantiles"
TAG <- "Figure 7.1.6."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "Target API"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)

figure_716 <- ggplot(data=gather_csrtshort, aes(x=reorder(request_name, quantile_99), y=value, fill=quantile)) +
  geom_bar(stat="identity", position = position_stack(reverse = TRUE)) +
  theme_minimal() +
  scale_fill_manual(values=c("#33FFFF", "#33FF33","#FFFF33","#FF9933","#FF3333")) +
  coord_flip() +
  labs(title    = TITLE,
      subtitle  = SUBTITLE,
      caption   = CAPTION,
          tag   = TAG,
          x     = X_LABEL,
          y     = Y_LABEL,
          fill  = "Quantile")  +
  scale_y_continuous(breaks = seq(0, maxbp, by = 100)) +
  theme(axis.text.x = element_text(angle = 45, vjust = 1, hjust=1),
        plot.subtitle = element_text(face = "bold",size =15))

add_logo(figure_716, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)


############################################################
### response times for scenarios and api endpoints for default scenarios (box plot)
############################################################

api_dt2 <- api_dt[scenario_name != "scenario_step"] %>%
  mutate(scenario_name = factor(scenario_name, levels = scenario_order)) %>%
  group_by(api_name, scenario_name) %>%
  filter(
    response_time >= quantile(response_time, 0.25, na.rm = TRUE) - 1.5 * IQR(response_time, na.rm = TRUE),
    response_time <= quantile(response_time, 0.75, na.rm = TRUE) + 1.5 * IQR(response_time, na.rm = TRUE)
  ) %>%
  ungroup()


TITLE <- "Resposne time distribution for target API endpoints"
SUBTITLE <- "only for scenarios with expected number of user transaction per hour (40, 80, 120, 200)"
CAPTION <- "NOTE: excluding outliers (points outside 1.5*IQR)"
TAG <- "Figure 8.1.1."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "API requests"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)

figure_811 <- ggplot(api_dt2, aes(x = as.factor(api_name), y = response_time, fill = scenario_name)) +
  geom_boxplot(outlier.shape = NA) +
  scale_fill_manual(name = "Scenarios:", values = scenarios_colors, breaks = scenario_order) +
  # coord_trans(y = "sqrt") +
  scale_y_continuous(breaks = c(1, 10,20,30,40, 50,75, 100,200,300,400, 500, 1000,1200,1400,1600,1800, 2000)) +
  theme_linedraw()+

  labs(title    = TITLE,
      subtitle  = SUBTITLE,
      caption   = CAPTION,
          tag   = TAG,
          x     = X_LABEL,
          y     = Y_LABEL)

add_logo(figure_811, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)

############################################################
### transaction response times for scenarios and api endpoints for default scenarios (box plot)
############################################################


### transaoction response time for for default scenarios

transaction_dt2 <- transaction_dt[scenario_name != "scenario_step"]
transaction_dt2 <- transaction_dt2[,request_name := gsub("Transaction - ","",request_name)]
transaction_dt2 <- transaction_dt2 %>%
  mutate(scenario_name = factor(scenario_name, levels = scenario_order)) %>%
  group_by(request_name, scenario_name) %>%
  filter(
    response_time >= quantile(response_time, 0.25, na.rm = TRUE) - 1.5 * IQR(response_time, na.rm = TRUE),
    response_time <= quantile(response_time, 0.75, na.rm = TRUE) + 1.5 * IQR(response_time, na.rm = TRUE)
  ) %>%
  ungroup()

TITLE <- "Resposne time distribution for user transactions"
SUBTITLE <- "only for scenarios with expected number of user transaction per hour (40, 80, 120, 200)"
CAPTION <- "NOTE: excluding outliers (points outside 1.5*IQR)"
TAG <- "Figure 8.1.2."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "User transactions"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)

figure_812 <- ggplot(transaction_dt2, aes(x = as.factor(request_name), y = response_time, color = scenario_name)) +
  geom_boxplot(outlier.shape = NA) +
  scale_color_manual(name = "Scenarios:", values = scenarios_colors, breaks = scenario_order) +
  # coord_trans(y = "sqrt") +
  scale_y_continuous(breaks = dynamic_breaks_10) +
  theme_linedraw()+
  theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
  labs(title    = TITLE,
      subtitle  = SUBTITLE,
      caption   = CAPTION,
          tag   = TAG,
          x     = X_LABEL,
          y     = Y_LABEL)


add_logo(figure_812, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)
############################################################
### response times for scenarios and api endpoints for scenario_step (box plot)
############################################################
### for step scenarios
api_dt3 <- api_dt[scenario_name == "scenario_step"] %>%
  mutate(scenario_name = factor(scenario_name, levels = scenario_order)) %>%
  group_by(api_name, scenario_name, load_group) %>%
  filter(
    response_time >= quantile(response_time, 0.25, na.rm = TRUE) - 1.5 * IQR(response_time, na.rm = TRUE),
    response_time <= quantile(response_time, 0.75, na.rm = TRUE) + 1.5 * IQR(response_time, na.rm = TRUE)
  ) %>%
  ungroup()


TITLE <- "Resposne time distribution for target API endpoints"
SUBTITLE <- "only for scenario with increased load (step scenario)"
CAPTION <- "NOTE: excluding outliers (points outside 1.5*IQR)"
TAG <- "Figure 8.1.3."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "API requests"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)

figure_813 <- ggplot(api_dt3, aes(x = as.factor(api_name), y = response_time, color = load_group)) +
  geom_boxplot(outlier.shape = NA) +
  # scale_color_manual(name = "Load (RPS):") +
  scale_color_discrete(name = "Load (RPS):") +
  # coord_trans(y = "sqrt") +
  # scale_y_continuous(breaks = dynamic_breaks_10) +
  scale_y_sqrt(breaks = c(1, 10,20,30,40, 50,75, 100,200,300,400, 500, 1000,1200,1400,1600,1800, 2000)) +
  theme_linedraw()+
  coord_cartesian(ylim = c(1, 2000)) +
  labs(title    = TITLE,
      subtitle  = SUBTITLE,
      caption   = CAPTION,
          tag   = TAG,
          x     = X_LABEL,
          y     = Y_LABEL)

add_logo(figure_813, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)
############################################################
### transaction response times for scenarios and api endpoints for scenario_step (box plot)
############################################################



### transaction response time for step scenario
transaction_dt3 <- transaction_dt[scenario_name == "scenario_step"]
transaction_dt3 <- transaction_dt3[,request_name := gsub("Transaction - ","",request_name)]


transaction_dt3 <- transaction_dt3 %>%
    mutate(scenario_name = factor(scenario_name, levels = scenario_order)) %>%
    group_by(request_name, scenario_name, load_group) %>%
    filter(
        response_time >= quantile(response_time, 0.25, na.rm = TRUE)
        - 1.5 * IQR(response_time, na.rm = TRUE),
        response_time <= quantile(response_time, 0.75, na.rm = TRUE)
        + 1.5 * IQR(response_time, na.rm = TRUE)
    ) %>%
    ungroup()

TITLE <- "Resposne time distribution for user transactions"
SUBTITLE <- "only for scenario with increased load (step scenario)"
CAPTION <- "NOTE: excluding outliers (points outside 1.5*IQR)"
TAG <- "Figure 8.1.4."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "User transactions"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)



figure_814 <- ggplot(transaction_dt3, aes(x = as.factor(request_name), y = response_time, color = load_group)) +
    geom_boxplot(outlier.shape = NA) +
    # scale_color_manual(name = "Load (RPS):") +
    scale_color_discrete(name = "Load (RPS):") +
    scale_y_sqrt(breaks = dynamic_breaks_10) +
    # coord_trans(y = "sqrt") +
    # scale_y_continuous(breaks = dynamic_breaks_10) +
    theme_linedraw() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
    labs(
        title    = TITLE,
        subtitle  = SUBTITLE,
        caption   = CAPTION,
        tag       = TAG,
        x         = X_LABEL,
        y         = Y_LABEL
    )

add_logo(figure_814, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)

############################################################
### mode detailed view on smaller values
############################################################

TITLE <- "Resposne time distribution for user transactions"
SUBTITLE <- "zoomed figure 8.1.3 for better visibility of smaller values"
CAPTION <- "NOTE: excluding outliers (points outside 1.5*IQR)"
TAG <- "Figure 8.1.5."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "User transactions"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)

figure_815 <- ggplot(transaction_dt3, aes(x = as.factor(request_name), y = response_time, color = load_group)) +
    geom_boxplot(outlier.shape = NA) +
    # scale_color_manual(name = "Load (RPS):") +
    scale_color_discrete(name = "Load (RPS):") +
    scale_y_sqrt(breaks = c(seq(0, 3000, by = 100))) +
    coord_cartesian(ylim = c(1, 3000)) +
    theme_linedraw() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
    labs(
        title    = TITLE,
        subtitle  = SUBTITLE,
        caption   = CAPTION,
        tag       = TAG,
        x         = X_LABEL,
        y         = Y_LABEL
    )

add_logo(figure_815, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)

############################################################
### mode detailed view on smaller values
############################################################
TITLE <- "Resposne time distribution for user transactions"
SUBTITLE <- "only for scenario with increased load (step scenario)"
CAPTION <- "NOTE: excluding outliers (points outside 1.5*IQR)"
TAG <- "Figure 8.1.6."
Y_LABEL <- "Response time (ms)"
X_LABEL <- "Load group (RPS)"
SAVE_PATH <- paste0(ggplots_folder,"/",TAG)

figure_816 <- ggplot(transaction_dt3, aes(x = as.factor(load_group), y = response_time, color =request_name )) +
    geom_boxplot(outlier.shape = NA) +
    # scale_color_manual(name = "Load (RPS):") +
    scale_color_discrete(name = "Load (RPS):") +
    scale_y_sqrt(breaks = c(seq(0, 3000, by = 100))) +
    coord_cartesian(ylim = c(1, 3000)) +
    theme_linedraw() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
    labs(
        title    = TITLE,
        subtitle  = SUBTITLE,
        caption   = CAPTION,
        tag       = TAG,
        x         = X_LABEL,
        y         = Y_LABEL
    )

add_logo(figure_816, FILE_LOGO_path) |> save_ggplot(file_path_name = SAVE_PATH)






























# all_scenarios_dt[,":="("rps"=.N),by=date_time]
# all_scenarios_dt[,.N, by = .(scenario_name, rps)]
# res <- all_scenarios_dt[,.N, by = .(time_stamp)] %>% setorder(-N)
#
# rps_dt <- all_scenarios_dt[
#   ,
#   .(rps = .N),
#   by = .(
#     scenario_name,                      # remove if you need total RPS only
#     ts_sec = as.POSIXct(trunc(date_time, "secs"), tz = "UTC")
#   )
# ][order(rps)]

### Create plots for comparison all models

# TITLE <- "Output Throughput comparison of NIM containers on DGX Spark"
# SUBTITLE <- "Comparison of Different Models"
# CAPTION <- "NIM containers: Qwen3 32B DGX Spark Variant, Llama 3.1 8B Instruct, Llama 3.3 Nemotron Super 49B, Nemotron Nano 9B"
# TAG <- "Figure 4.1.1."
# Y_LABEL <- "Token per second"
# X_LABEL <- "Concurrency (active prompt threads)"
# SAVE_PATH <- paste0(ggplots_folder,"/",TAG)
#
# figure_411 <- ggplot(api_dt, aes(x = as.factor(api_name), y = response_time, color = scenario_name)) +
#   # geom_point(size = 3) +
#   geom_boxplot() +
#   scale_color_manual(name="MODELS:",values = scenarios_colors, breaks = scenario_order)+
# # scale_y_continuous(breaks =y_trans_values ) +
# coord_trans(y = "sqrt") +
# theme_linedraw()+
#   labs(title=TITLE,
# subtitle = SUBTITLE,
# caption = CAPTION,
#     tag = TAG,
# x=X_LABEL,
# y=Y_LABEL)
#
# add_logo(figure_411, FILE_LOGO) |> save_ggplot(file_path_name = SAVE_PATH)








### ggplot ofver active therads for step scenario

ggplot(transaction_dt) +
      geom_boxplot(aes(x=load_group, y=response_time)) +
      theme_minimal() +
      labs(x="active threads",
           y="response time",
           title = "plot_title",
           subtitle = "plot_subtitle",
           caption = NULL,
           color="Request name")+
      theme(axis.text.x = element_text(angle = 45, vjust = 1, hjust=1),
            plot.subtitle = element_text(face = "bold",size =15)) +
  facet_grid(as.factor(request_name) ~ as.factor(scenario_name), scales = "free_y")

