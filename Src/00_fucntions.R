
# r
ensure_packages_progress <- function(pkgs,
                                     repos = getOption("repos"),
                                     dependencies = TRUE,
                                     verbose = TRUE,
                                     prefer_binary = TRUE,
                                     retry_on_fail = TRUE) {
  if (length(pkgs) == 0) return(invisible(list(installed = character(), failed = character())))

  still_missing <- pkgs[!vapply(pkgs, requireNamespace, logical(1), quietly = TRUE)]
  total_to_install <- length(still_missing)
  installed <- character()
  failed <- character()

  # decide preferred type: on Windows/macOS prefer binary; on Linux leave NULL (use default)
  sysname <- Sys.info()[["sysname"]]
  preferred_type <- if (prefer_binary && sysname %in% c("Windows", "Darwin")) "binary" else NULL
  alt_type <- if (is.null(preferred_type)) "binary" else "source"

  for (i in seq_along(still_missing)) {
    pkg <- still_missing[[i]]

    if (requireNamespace(pkg, quietly = TRUE)) {
      if (verbose) message(sprintf("[%d/%d] %s already available; skipping.", i, total_to_install, pkg))
      installed <- c(installed, pkg)
    } else {
      if (verbose) message(sprintf("[%d/%d] Installing %s ...", i, total_to_install, pkg))

      try_install <- function(type_arg) {
        args <- list(pkgs = pkg, repos = repos, dependencies = dependencies)
        if (!is.null(type_arg)) args$type <- type_arg
        ok <- tryCatch({
          do.call(utils::install.packages, args)
          TRUE
        }, error = function(e) {
          if (verbose) message("  Error installing ", pkg, " (type=", type_arg, "): ", conditionMessage(e))
          FALSE
        }, warning = function(w) {
          # warnings don't stop execution; still return TRUE so we check availability after
          if (verbose) message("  Warning installing ", pkg, ": ", conditionMessage(w))
          TRUE
        })
        ok
      }

      # attempt preferred install first (if set), otherwise normal attempt
      success <- if (is.null(preferred_type)) {
        try_install(NULL)
      } else {
        try_install(preferred_type)
      }

      # if failed and retry requested, try the alternate type once
      if ((!success || !requireNamespace(pkg, quietly = TRUE)) && retry_on_fail) {
        if (verbose) message("  Retry with alternative install type (if available).")
        try_install(alt_type)
      }

      # check availability after attempts
      if (requireNamespace(pkg, quietly = TRUE)) {
        installed <- c(installed, pkg)
      } else {
        failed <- c(failed, pkg)
      }
    }

    remaining_pkgs <- pkgs[!vapply(pkgs, requireNamespace, logical(1), quietly = TRUE)]
    remaining_count <- length(remaining_pkgs)
    if (verbose) {
      if (remaining_count == 0L) {
        message("  Installed: all requested packages are now available.")
      } else {
        message(sprintf("  %d remaining: %s", remaining_count, paste(head(remaining_pkgs, 20), collapse = ", ")))
      }
    }
  }

  available_pkgs <- pkgs[vapply(pkgs, requireNamespace, logical(1), quietly = TRUE)]
  invisible(lapply(available_pkgs, function(p) library(p, character.only = TRUE)))
  invisible(list(requested = pkgs, installed = unique(installed), failed = unique(failed)))
}



# Example usage:
pkgs <- c("jsonlite", "data.table", "ggplot2", "ggthemes", "magick", "cowplot", "tidyverse", "remotes", "devtools", "htmltools")
ensure_packages_progress(pkgs)



