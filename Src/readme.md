# Source Folder

This folder contains R scripts for processing, analyzing, and visualizing JMeter performance test results.

## Files Overview

* `00_functions.R`: Contains helper functions for JMeter log data cleaning, formatting, and UUID generation.
* `01_clean_data.R`: Reads raw `.jtl` files from `jmeter_results/`, cleans them (using functions from `00_functions.R`), combines them, and saves the cleaned data as `jmeter_results/all_scenarios_dt.rds`.
* `02_analyze_data.R`: Loads `jmeter_results/all_scenarios_dt.rds`, computes statistical summaries (percentiles, mean, etc.) for APIs and transactions, and generates tables for reports. it saves results in `jmeter_results/tables/` directory.
* `03_visualize_data.R`: Loads `jmeter_results/all_scenarios_dt.rds` and generates visual plots (ggplot2) for performance analysis. Plots are saved in the `jmeter_reports/ggplot` directory. All plots are designed and has file names equal to `figure *.png` names its also equal to google docs report figure names for easy reference.

## Usage

1.  Run `01_clean_data.R` first to process the raw JMeter logs into a standardized RDS format. Carefull with defining path to the raw .jtl files in the script. initially it should automatically read all .jtl files in the `jmeter_results/` directory, but you can adjust it if needed.
2.  Execute `02_analyze_data.R` to perform statistical analysis and generate tables. Make sure to check path for *rds file and output tables in the script.
3.  Run `03_visualize_data.R` to generate visual performance reports. Make sure to check the path for the input RDS file and output directory for plots in the script.

## Results
*   Processed data is saved in `jmeter_results/all_scenarios_dt.rds`.
*   Generated plots and reports can be found in the `jmeter_reports/ggplot` directory.
*  Statistical tables are saved in `jmeter_results/tables/` for further reference.
