library(data.table)
library(here)
library(tidyverse)
source(file.path(here::here(),"Src", "00_functions.R"))

###################################################
### Initialize paths for reading and saving data
###################################################
initial_path <- here::here()
jmeter_results_path <- file.path(initial_path, "jmeter_results")
jmeter_reports_path <- file.path(initial_path, "jmeter_reports")
jmeter_all_results_path <- file.path(jmeter_results_path, "all_scenarios_dt.rds")

scenario_40_file_name <- "scenario_40_default.jtl"
scenario_80_file_name <- "scenario_80.jtl"
scenario_120_file_name <- "scenario_120.jtl"
scenario_200_file_name <- "scenario_200.jtl"
scenario_step_file_name <- "scenario_step.jtl"


###################################################
### Read JTL files and create data.tables
###################################################
jtl_files <- c(scenario_40_file_name, scenario_80_file_name, scenario_120_file_name, scenario_200_file_name, scenario_step_file_name)
jtl_files <- file.path(jmeter_results_path, jtl_files)

###################################################
### Read JTL files and create data.tables
###################################################

scenario_40_dt <- data.table::fread(jtl_files[1]) |> as.data.table()
scenario_80_dt <- data.table::fread(jtl_files[2]) |> as.data.table()
scenario_120_dt <- data.table::fread(jtl_files[3]) |> as.data.table()
scenario_200_dt <- data.table::fread(jtl_files[4]) |> as.data.table()
scenario_step_dt <- data.table::fread(jtl_files[5]) |> as.data.table()

###################################################
### Add scenario_name column to each data.table
###################################################

scenario_40_dt[,scenario_name := "scenario_40"]
scenario_80_dt[,scenario_name := "scenario_80"]
scenario_120_dt[,scenario_name := "scenario_120"]
scenario_200_dt[,scenario_name := "scenario_200"]
scenario_step_dt[,scenario_name := "scenario_step"]


###################################################
### Combine all scenarios into a single data.table and clean up labels
###################################################
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

###################################################
### Save the combined data.table to an RDS file
###################################################
saveRDS(all_scenarios_dt, jmeter_all_results_path)