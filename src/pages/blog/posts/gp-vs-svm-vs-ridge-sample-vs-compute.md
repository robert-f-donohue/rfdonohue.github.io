---
layout: /src/layouts/MarkdownPostLayout.astro
title: "When is a Gaussian Process worth it? Sample vs Compute Efficiency"
author: Robert Donohue
description: "A practical comparison of Gaussian Process (GP) regression, Support Vector Regression (SVR), and Ridge regression when data is expensive and runtime matters."
image:
  url: "/images/posts/20260105-gp-vs-svr-vs-ridge-regression/card.webp"
  alt: "GP vs SVR vs Ridge: sample efficiency vs compute."

heroImage:
  url: "/images/posts/20260105-gp-vs-svr-vs-ridge-regression/featured.webp"
  alt: "Featured hero image for GP vs SVR vs Ridge."

ogImage:
  url: "/images/posts/20260105-gp-vs-svr-vs-ridge-regression/og.webp"
  alt: "Social preview for GP vs SVR vs Ridge."
  
pubDate: 2026-01-04
tags: ["Gaussian Processes", "SVM", "Ridge Regression", "Bayesian Optimization", "Sample Efficiency"]
languages: ["python", "scikitlearn"]
---

## TL;DR

- If **each datapoint is expensive**, GPs can win by reaching strong accuracy with **far fewer samples**.
- If **runtime is the constraint** (or you have lots of data), Ridge/SVR are often the better deal.
- The practical question isn’t “which model is best?” — it’s **which cost dominates: data or compute?**

## Why this tradeoff matters

When you build a regression model, *or an ML model for that matter*, you're usually told to optimize loss. In
production, you're often optimizing something else entirely: **cost**. That includes the CPU/GPU time to train, *and*
the time/money to get the next data point.

That distinction matters because the world of ML training has flipped. Compute keeps getting cheaper and more available.
But in a lot of instances, like scientific simulations, robotics experiments, or lab experiments, **data is the
expensive part**.

If each new sample costs minutes, dollars, or real-world risk, then “just collect more data” just doesn't make practical
sense.

This is where probabilistic models like **Gaussian Processes (GPs)** come in handy. They don't just make predictions,
they quantify uncertainty, so you can decide **where to sample next** and **learn faster**.

But there's a catch...

## START HERE

This is where the No Free Lunch (NFL) Theorem pokes its nosy head into the situation.

Most machine learning problems involve optimizing an objective function. In regression problems, this typically involves 
minimizing a loss function that quantifies the discrepancies between the model’s predictions and observed data. However, 
practical model development must account not only for the computational cost of evaluating this loss but also the cost 
of acquiring new data, which is often overlooked in traditional learning settings. With rapid advancements in 
high-performance computing, models once deemed computationally infeasible for practical use, such as deep neural 
networks (DNNs), have become widely accessible. At the same time, data acquisition has grown increasingly expensive in 
domains like scientific simulations, robotics, and drug trials. This shift in priority has dramatically increased the 
importance of methods that can produce accurate models with fewer samples. Because of this, Bayesian methods, such as 
Gaussian Processes (GPs), have gained significant traction for their ability to model uncertainty and guide 
sample-efficient learning, especially in settings where each data point carries a high acquisition cost.

In this post, we investigate the performance trade-offs between two widely used regression techniques, Ridge Regression 
and Support Vector Regression (SVR), and a Bayesian approach, Gaussian Process Regression (GPR). After introducing the 
theoretical foundation of each model, we apply them to a controlled regression task involving a moderately complex 
nonlinear function. Our analysis emphasizes two key metrics: computational cost and sample efficiency. By evaluating 
their learning behavior across increasing training sample sizes, both under random and active sampling scenarios, we 
highlight the conditions under which Bayesian methods outperform or fall short of the more conventional techniques.

## Setup (the experiment)

To evaluate the computational efficiency and sample effectiveness of each regression method, we designed a synthetic 
experiment involving a moderately complex nonlinear function. This function serves as a benchmark to test each model’s 
ability to learn expressive patterns under limited data settings:

$$f(x) = 0.3x^6 - 2x^5 + 4x^4 - 1.3x^3 - 3.2x^2 + 2x + 1.$$

> Don't worry, this is just a fancy way to describe a wiggly line that easily fits on a plot :)


We compare two regimes:
- **Passive sampling:** train on progressively larger random subsets of noisy samples
- **Active sampling:** let a GP choose the next samples using an acquisition policy (exploration/exploitation)

For each sample size we track:
- **RMSE** on a fixed test set
- **Fit time** per model


### Repro snippet: synthetic function

```python
import numpy as np

def true_function(x):
    return 0.3 * x**6 - 2 * x**5 + 4 * x**4 - 1.3 * x**3 - 3.2 * x**2 + 2 * x + 1

def noisy_function(x, noise_std=0.1):
    return true_function(x) + np.random.normal(0, noise_std, size=x.shape)
```

## Models (just enough detail)

### Ridge as a strong baseline

Ridge is fast and stable, especially with polynomial features. It’s a great “first model” when you want a cheap baseline 
before reaching for heavier machinery.

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import Ridge

ridge_model = make_pipeline(
    PolynomialFeatures(degree=6),
    Ridge(alpha=0.01),
)
```

### SVR as the kernel middle-ground

Support vector machines (SVMs) are supervised learning models used in regression and classification tasks. The 
attractiveness of SVMs comes from the fact that they are a sparse technique, meaning that instead of relying on the 
entirety of the training set, they rely solely on support vectors to make predictions. SVMs create convex optimization 
problems, even on nonlinear data, by using what is commonly known as the “kernel trick”… Common kernels include linear, 
polynomial, sigmoid, and Gaussian radial basis functions (RBF).

```python
from sklearn.svm import SVR

svr_model = SVR(kernel="rbf", C=20, epsilon=0.005, gamma=1.0)
```

### GPs: uncertainty + active sampling

The two main components of a Bayesian optimization (BO) algorithm are the surrogate model and acquisition function. The 
former is the model’s current “best guess” at estimating the objective function, and the latter is the method by which 
we choose new locations to sample. The most common surrogate model for continuous feature spaces is the Gaussian process 
(GP). Similar to how a Gaussian distribution is a distribution over a random variable, the GP is a distribution over a 
function. Instead of returning a scalar at some point $x$, the GP returns the mean and variance of a normal distribution 
over all possible values of $f(x)$ at $x$.

<figure>
  <img
    src="/images/posts/20260105-gp-vs-svr-vs-ridge-regression/gp-posterior.webp"
    alt="Gaussian Process posterior mean and uncertainty band over the true function."
    loading="lazy"
  />
  <figcaption>
    A GP predicts a distribution: the mean estimate plus a calibrated uncertainty band that can guide active sampling.
  </figcaption>
</figure>

```python
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel

kernel = RBF(length_scale=1.5, length_scale_bounds=(0.3, 10.0)) + WhiteKernel(
noise_level=0.1, noise_level_bounds=(1e-4, 1.0)
)

gp_model = GaussianProcessRegressor(
kernel=kernel,
normalize_y=True,
alpha=0.0,
n_restarts_optimizer=10,
)
```


## Results

The compute story is blunt: Ridge and SVR remain extremely fast, while GP fit time grows dramatically as the kernel matrix scales.

<figure>
  <img
    src="/images/posts/20260105-gp-vs-svr-vs-ridge-regression/fit-time-vs-samples.webp"
    alt="Model fit time vs sample size for Ridge, SVR, and GP."
    loading="lazy"
  />
  <figcaption>
    Fit time grows sharply for the GP as sample size increases, while Ridge and SVR remain fast.
  </figcaption>
</figure>


The accuracy story is the opposite: the GP (especially with active sampling) reaches strong performance with far fewer 
samples.

<figure>
  <img
    src="/images/posts/20260105-gp-vs-svr-vs-ridge-regression/active-sampling-threshold.webp"
    alt="Active sampling locations over the true function; early points highlighted until RMSE threshold is reached."
    loading="lazy"
  />
  <figcaption>
    Active sampling concentrates evaluations where the model learns fastest. Red points are samples selected before reaching the RMSE threshold.
  </figcaption>
</figure>

In my runs, the GP’s active sampling hit the target threshold after 16 samples, emphasizing why GPs show up so
often in “expensive-to-evaluate” settings.

<figure>
  <img
    src="/images/posts/20260105-gp-vs-svr-vs-ridge-regression/rmse-vs-samples.webp"
    alt="RMSE vs sample size comparing Ridge, SVR, passive GP, and active GP."
    loading="lazy"
  />
  <figcaption>
    RMSE vs sample size: active GP reaches low error with far fewer samples; passive GP improves with more data.
  </figcaption>
</figure>

### What this means in practice

- If your data is expensive, the GP can be worth it even if training is slower.
- If your data is cheap (or you already have a lot), Ridge/SVR often win on total cost.
- Active sampling is where the GP becomes a different kind of tool: not just a regressor, but a data-collection strategy.


### So... when is a GP worth it

A simple decision rubric:

- Choose Ridge if:
  - you want the **fastest baseline**
  - your function is *“smooth enough”* in your feature space
  - you can **afford more samples**

- Choose SVR if:
  - you want nonlinear fit without GP-level compute
  - you expect sparse support vectors to work well
  - you can tune hyperparameters reasonably

- Choose GP (+ active sampling) if:
  - each sample is expensive (simulation, lab trials, robotics, etc.)
  - uncertainty estimates will drive decisions
  - you benefit from choosing where to sample next