library(data.table)
library(here)
library(tidyverse)
source(file.path(here::here(), "Src/000_functions.R"))


here::here()


initial_path <- here::here()
jmeter_results_path <- file.path(initial_path, "jmeter_results")
jmeter_all_results_path <- file.path(jmeter_results_path, "all_scenarios_dt.rds")

scenario_40_file_name <- "scenario_40_default.jtl"
scenario_80_file_name <- "scenario_80.jtl"
scenario_120_file_name <- "scenario_120.jtl"
scenario_200_file_name <- "scenario_200.jtl"
scenario_step_file_name <- "scenario_step.jtl"


jtl_files <- c(scenario_40_file_name, scenario_80_file_name, scenario_120_file_name, scenario_200_file_name, scenario_step_file_name)
jtl_files <- file.path(jmeter_results_path, jtl_files)
file_1 <- jtl_files[1]

scenario_40_dt <- data.table::fread(jtl_files[1]) |> as.data.table()
scenario_80_dt <- data.table::fread(jtl_files[2]) |> as.data.table()
scenario_120_dt <- data.table::fread(jtl_files[3]) |> as.data.table()
scenario_200_dt <- data.table::fread(jtl_files[4]) |> as.data.table()
scenario_step_dt <- data.table::fread(jtl_files[5]) |> as.data.table()

scenario_40_dt[,scenario_name := "scenario_40"]
scenario_80_dt[,scenario_name := "scenario_80"]
scenario_120_dt[,scenario_name := "scenario_120"]
scenario_200_dt[,scenario_name := "scenario_200"]
scenario_step_dt[,scenario_name := "scenario_step"]

all_scenarios_dt <- rbind(scenario_40_dt, scenario_80_dt, scenario_120_dt, scenario_200_dt, scenario_step_dt)
all_scenarios_dt[, label := gsub("TICKET", "ISSUE", label, fixed = TRUE)]
all_scenarios_dt[, label := gsub("Transaction Controller", "Transaction - CHANGE status", label, fixed = TRUE)]
all_scenarios_dt[, label := gsub("Transaction Change issue type", "Transaction - CHANGE issue type", label, fixed = TRUE)]
all_scenarios_dt[, label := gsub("Transaction add comment random issue", "Transaction - ADD comment", label, fixed = TRUE)]
all_scenarios_dt[, label := gsub("Transaction ADD comment", "Transaction - ADD comment", label, fixed = TRUE)]
all_scenarios_dt[, label := gsub("Transaction change priority", "Transaction - CHANGE priority", label, fixed = TRUE)]
all_scenarios_dt[, label := gsub("Transaction - Read ISSUE - /projects/DEMO/issues/ISSUE/NEWSUMMARY", "Transaction - READ issue", label, fixed = TRUE)]
all_scenarios_dt[, label := gsub("Transaction - Search ISSUE", "Transaction - SEARCH issue", label, fixed = TRUE)]
all_scenarios_dt[, label := gsub("Transaction - Create ISSUE", "Transaction - CREATE issue", label, fixed = TRUE)]
all_scenarios_dt <- all_scenarios_dt %>% clean_jmeter_log()
all_scenarios_dt <- all_scenarios_dt[!is.na(load_group) & as.character(load_group) != "<NA>"]
all_scenarios_dt[, load_group := as.character(load_group)]
all_scenarios_dt[, load_group := gsub("\\[|\\]|\\(|\\)", "", load_group)]
all_scenarios_dt[, load_group := gsub(",", "-", load_group, fixed = TRUE)]


saveRDS(all_scenarios_dt, jmeter_all_results_path)

all_scenarios_dt <- readRDS(jmeter_all_results_path) %>% as.data.table()

head(all_scenarios_dt)

all_scenarios_dt[label %like% "Transaction - Read ISSUE"]
label_list <- all_scenarios_dt[, unique(label)] %>%  sort()
label_list





list_of_words <-  c("Transaction")
list_of_apis <- c("http://192\\.168\\.0\\.165:8080/api/issues/DEMO-\\d+\\?fields=", "http://192\\.168\\.0\\.165:8080/api/sortedIssues", "http://192\\.168\\.0\\.165:8080/api/issuesGetter")
api_dt <- all_scenarios_dt[grepl(paste(list_of_apis, collapse = "|"), url)]
transaction_dt <- all_scenarios_dt[grepl(paste(list_of_words, collapse = "|"), label)]

api_dt[,api_name := "other"]
api_dt[url %like% "http://192\\.168\\.0\\.165:8080/api/issues/DEMO-\\d+\\?fields=", api_name := "GET id_fields"]
api_dt[url %like% "http://192\\.168\\.0\\.165:8080/api/sortedIssues", api_name := "GET sortedIssues"]
api_dt[url %like% "http://192\\.168\\.0\\.165:8080/api/issuesGetter", api_name := "POST issuesGetter"]

api_dt[,.N, by = api_name]
api_dt[, .N, by = label]
transaction_dt[, .N, by = label]
transaction_dt[,.N, by = .(load_group)]

api_p90_dt_default <- api_dt[scenario_name != "scenario_step",.(p90 = as.numeric(quantile(response_time, probs = 0.90, na.rm = TRUE))), by = .(api_name, scenario_name)]

api_p90_dt_step <- api_dt[scenario_name == "scenario_step",.(p90 = as.numeric(quantile(response_time, probs = 0.90, na.rm = TRUE))), by = .(api_name, load_group)]
setorder(api_p90_dt_step, api_name, load_group)
api_p90_dt_step


api_wide_dt_default <- dcast(
  api_p90_dt_default,
  api_name ~ scenario_name,
  value.var = "p90"
)
setcolorder(  api_wide_dt_default,
  c("api_name", "scenario_40", "scenario_80", "scenario_120", "scenario_200")
)

api_wide_dt_step <- dcast(
  api_p90_dt_step,
  api_name ~ load_group,
  value.var = "p90"
)





transaction_p90_dt_default <- transaction_dt[scenario_name != "scenario_step",.(p90 = as.numeric(quantile(response_time, probs = 0.90, na.rm = TRUE))), by = .(label, scenario_name)]

transaction_p90_dt_step <- transaction_dt[scenario_name == "scenario_step",.(p90 = as.numeric(quantile(response_time, probs = 0.90, na.rm = TRUE))), by = .(label, load_group)]

transaction_wide_dt_default <- dcast(
  transaction_p90_dt_default,
  label ~ scenario_name,
  value.var = "p90"
)
setcolorder(
  transaction_wide_dt_default,
  c("label", "scenario_40", "scenario_80", "scenario_120", "scenario_200")
)

transaction_wide_dt_step <- dcast(
  transaction_p90_dt_step,
  label ~ load_group,
  value.var = "p90"
)

library(htmltools)
if (!require("DT")) install.packages('DT')
library(DT)
datatable(transaction_wide_dt_step)
update.packages(ask = FALSE, checkBuilt = TRUE)

.libPaths()
packageVersion("htmltools")

detach("htmltools", unload=TRUE)
install.packages('htmltools')
Sys.which("gcc")

  pkgbuild::check_build_tools(debug = TRUE)

Sys.getenv("PATH")
file.exists("~/.R/Makevars")