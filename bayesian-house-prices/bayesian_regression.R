# =============================================================================
# Bayesian Linear Regression for California house prices (JAGS / MCMC)
#
# Run from this folder:   Rscript bayesian_regression.R
# Outputs: printed posterior summary + figures in images/
# =============================================================================
suppressPackageStartupMessages({
  library(dplyr)
  library(ggplot2)
  library(rjags)
  library(coda)
})
set.seed(42)
dir.create("images", showWarnings = FALSE)

# -----------------------------------------------------------------------------
# 1. Data & cleaning
# -----------------------------------------------------------------------------
raw <- read.csv("data/california_housing.csv")

housing <- raw %>%
  na.omit() %>%
  filter(median_house_value < 500001) %>%          # remove the $500k price cap
  mutate(
    rooms_per_household      = total_rooms / households,
    bedrooms_per_room        = total_bedrooms / total_rooms,
    population_per_household = population / households
  )
cat(sprintf("Rows: %d raw -> %d after cleaning\n", nrow(raw), nrow(housing)))

predictors <- c("housing_median_age", "total_rooms", "population",
                "households", "median_income", "population_per_household")

# Standardise predictors (mean 0, sd 1) and express price in $100k.
# On the raw scale, N(0, 100) priors are far too tight for coefficients that
# live in the tens of thousands, and they would shrink every effect to ~0.
X_raw  <- as.matrix(housing[, predictors])
x_mean <- colMeans(X_raw)
x_sd   <- apply(X_raw, 2, sd)
X      <- scale(X_raw, center = x_mean, scale = x_sd)
y      <- housing$median_house_value / 1e5

# -----------------------------------------------------------------------------
# 2. EDA figures
# -----------------------------------------------------------------------------
p1 <- ggplot(housing, aes(median_house_value / 1e3)) +
  geom_histogram(bins = 50, fill = "steelblue") +
  labs(title = "Distribution of median house value", x = "Median house value ($k)", y = "Count") +
  theme_minimal()
ggsave("images/price_distribution.png", p1, width = 7, height = 4, dpi = 150)

p2 <- ggplot(housing, aes(median_income, median_house_value / 1e3)) +
  geom_point(alpha = 0.15, size = 0.6) +
  geom_smooth(method = "lm", color = "red", formula = y ~ x) +
  labs(title = "Median income vs house value", x = "Median income ($10k)", y = "Median house value ($k)") +
  theme_minimal()
ggsave("images/income_vs_price.png", p2, width = 7, height = 4, dpi = 150)

# -----------------------------------------------------------------------------
# 3. Model
# -----------------------------------------------------------------------------
model_string <- "
model {
  for (i in 1:n) {
    y[i]  ~ dnorm(mu[i], tau)
    mu[i] <- beta0 + inprod(beta[], X[i, ])
  }

  # posterior predictive draw for a new district
  mu_new <- beta0 + inprod(beta[], x_new[])
  y_new  ~ dnorm(mu_new, tau)

  # weakly-informative priors (predictors standardised, price in $100k)
  beta0 ~ dnorm(0, 0.01)
  for (k in 1:p) { beta[k] ~ dnorm(0, 0.1) }
  tau   ~ dgamma(0.01, 0.01)
  sigma <- 1 / sqrt(tau)
}"

# Hypothetical district used for the prediction
new_district <- c(housing_median_age = 30, total_rooms = 2000, population = 800,
                  households = 300, median_income = 4.5, population_per_household = 800 / 300)
x_new <- (new_district[predictors] - x_mean) / x_sd

jags_data <- list(y = y, X = X, n = length(y), p = ncol(X), x_new = as.numeric(x_new))
inits <- function() list(beta0 = rnorm(1), beta = rnorm(ncol(X)), tau = 1,
                         .RNG.name = "base::Mersenne-Twister", .RNG.seed = sample.int(1e6, 1))

model <- jags.model(textConnection(model_string), data = jags_data, inits = inits,
                    n.chains = 3, quiet = TRUE)
update(model, 2000)                                   # burn-in
samples <- coda.samples(model, c("beta0", "beta", "sigma", "mu_new", "y_new"), n.iter = 5000)

# -----------------------------------------------------------------------------
# 4. Convergence diagnostics
# -----------------------------------------------------------------------------
params <- c("beta0", paste0("beta[", seq_along(predictors), "]"), "sigma")
cat("\nGelman-Rubin R-hat (values close to 1.00 indicate convergence):\n")
print(round(gelman.diag(samples[, params])$psrf[, 1], 3))
cat("\nEffective sample sizes:\n")
print(round(effectiveSize(samples[, params])))

png("images/traceplots.png", width = 1400, height = 900, res = 120)
par(mfrow = c(3, 3), mar = c(3, 3, 2, 1))
titles <- c("Intercept", predictors, "sigma")
for (k in seq_along(params)) {
  traceplot(samples[, params[k]], main = titles[k], col = c("#1f77b4", "#ff7f0e", "#2ca02c"))
}
dev.off()

# -----------------------------------------------------------------------------
# 5. Posterior summary (coefficients = change in price, $k, per +1 SD of predictor)
# -----------------------------------------------------------------------------
draws <- as.matrix(samples)
coef_draws <- draws[, paste0("beta[", seq_along(predictors), "]")] * 100   # -> $k
colnames(coef_draws) <- predictors
posterior <- data.frame(
  predictor = predictors,
  mean  = colMeans(coef_draws),
  sd    = apply(coef_draws, 2, sd),
  lower = apply(coef_draws, 2, quantile, 0.025),
  upper = apply(coef_draws, 2, quantile, 0.975)
) %>% mutate(credible_nonzero = sign(lower) == sign(upper))
cat("\nPosterior coefficients ($k per +1 SD of the predictor):\n")
print(posterior %>% mutate(across(where(is.numeric), ~ round(.x, 2))), row.names = FALSE)
cat(sprintf("\nResidual sigma: $%.1fk\n", mean(draws[, "sigma"]) * 100))

# Frequentist sanity check: with weak priors the posterior means should match OLS
ols <- lm(y ~ X)
cat("\nOLS coefficients for comparison ($k per SD):\n")
print(round(coef(ols)[-1] * 100, 2))

p3 <- ggplot(posterior, aes(x = mean, y = reorder(predictor, mean))) +
  geom_vline(xintercept = 0, linetype = "dashed", color = "grey50") +
  geom_errorbarh(aes(xmin = lower, xmax = upper), height = 0.2, color = "steelblue") +
  geom_point(size = 2.5, color = "steelblue") +
  labs(title = "Posterior coefficients with 95% credible intervals",
       x = "Effect on median house value ($k per +1 SD)", y = NULL) +
  theme_minimal()
ggsave("images/posterior_coefficients.png", p3, width = 7, height = 4, dpi = 150)

# -----------------------------------------------------------------------------
# 6. Posterior predictive for the hypothetical district
# -----------------------------------------------------------------------------
y_new  <- draws[, "y_new"] * 100
mu_new <- draws[, "mu_new"] * 100
cat("\nHypothetical district (age 30, 2000 rooms, 800 people, 300 households, income 4.5):\n")
cat(sprintf("  Expected median value : $%.0fk  (95%% CrI for the mean: $%.0fk - $%.0fk)\n",
            mean(mu_new), quantile(mu_new, 0.025), quantile(mu_new, 0.975)))
cat(sprintf("  Predictive interval   : $%.0fk - $%.0fk (95%%)\n",
            quantile(y_new, 0.025), quantile(y_new, 0.975)))

p4 <- ggplot(data.frame(y_new = y_new), aes(y_new)) +
  geom_histogram(aes(y = after_stat(density)), bins = 60, fill = "grey75") +
  geom_density(color = "black") +
  geom_vline(xintercept = mean(y_new), color = "red") +
  geom_vline(xintercept = quantile(y_new, c(0.025, 0.975)), color = "red", linetype = "dashed") +
  labs(title = "Posterior predictive distribution for a new district",
       x = "Median house value ($k)", y = "Density") +
  theme_minimal()
ggsave("images/posterior_predictive.png", p4, width = 7, height = 4, dpi = 150)

# -----------------------------------------------------------------------------
# 7. Model fit
# -----------------------------------------------------------------------------
mu_hat <- as.numeric(cbind(1, X) %*% c(mean(draws[, "beta0"]), colMeans(draws[, paste0("beta[", seq_along(predictors), "]")])))
cat(sprintf("\nBayesian R^2 (posterior-mean fit): %.3f\n", cor(mu_hat, y)^2))
dic <- dic.samples(model, n.iter = 1000, type = "pD")
print(dic)
