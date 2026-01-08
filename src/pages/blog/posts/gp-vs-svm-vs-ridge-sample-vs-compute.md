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

## Why do we care?

When you build a regression model, *or any ML model for that matter*, you're usually told to optimize loss. In
production, you're often optimizing something else entirely: **cost**. That includes the CPU/GPU time to train, *and*
the time/money to get the next data point.

That distinction matters because the world of ML training has flipped. 

Compute keeps getting cheaper and more available. But in a lot of instances, like scientific simulations, robotics 
experiments, or lab experiments, 

**data is the expensive part**.

If each new sample costs minutes, dollars, or real-world risk, then “just collect more data” just doesn't make practical
sense.

This is where probabilistic models like **Gaussian Processes (GPs)** come in handy. 

They don't just make predictions, they quantify uncertainty, so you can decide **where to sample next** and **learn 
faster**.

### What's the catch?

This begs the question: *if Gaussian Processes are so sample-efficient, why wouldn't we use them for everything?*

> 🛑 **Reality Check: No Free Lunch**

For those unfamiliar, basically, the **No Free Lunch (NFL) Theorem** says that for any two optimization algorithms, **if their performance is
averaged over all possible problems**, they are all equally ***“meh”***.

This is where the NFL reminds us that efficiency isn't free.

The time complexity on a typical non-sparse GP is $\mathcal{O}(n^3)$ and $\mathcal{O}(n^2)$ space complexity, where $n$ 
is the number of samples. 

This means that for every new data point we evaluate, the computational load explodes exponentially in proportion to the
full dataset.

### What's the plan here?

In this post, we investigate the performance trade-offs between two widely used regression techniques, **Ridge 
Regression** and **Support Vector Regression (SVR)**, and a Bayesian approach, **Gaussian Process Regression (GPR)**.

> To those frequentist statisticians out there, I offer you this fine meme as an olive branch: **You're welcome**.

<figure>
  <img
    src="/images/posts/20260105-gp-vs-svr-vs-ridge-regression/freq-vs-bayes-meme.webp"
    alt="Frequentist vs Bayesian statistician arguing."
    loading="lazy"
  />
</figure>

Anyways...

After introducing the theoretical foundation of each model, we apply them to a controlled regression task involving a 
moderately complex nonlinear function.

Our analysis emphasizes two key metrics: ***computational cost and sample efficiency***. 

By evaluating their learning behavior across increasing training sample sizes, both under random and active sampling 
scenarios, we highlight the conditions under which Bayesian methods outperform or fall short of the more conventional 
techniques.

## Setup (the experiment)

Now that we're all on the same page, let's get into the experiment!

To evaluate the computational efficiency and sample effectiveness of each regression method, I designed a synthetic 
experiment involving a moderately complex nonlinear function.

This was done using a highly technical technique: *button-mashing the Desmos online graphic calculator until it looked 
nice.*

This function serves as a benchmark to test each model’s ability to learn expressive patterns under limited data 
settings:

$$f(x) = 0.3x^6 - 2x^5 + 4x^4 - 1.3x^3 - 3.2x^2 + 2x + 1.$$

> Don't worry, this is just a fancy way to describe a wiggly line that easily fits on a plot :)

<figure>
  <img
    src="/images/posts/20260105-gp-vs-svr-vs-ridge-regression/true-function.webp"
    alt="Gaussian Process posterior mean and uncertainty band over the true function."
    loading="lazy"
  />
</figure>

### Repro snippet: synthetic function

```python
import numpy as np

def true_function(x):
    return 0.3 * x**6 - 2 * x**5 + 4 * x**4 - 1.3 * x**3 - 3.2 * x**2 + 2 * x + 1

def noisy_function(x, noise_std=0.1):
    return true_function(x) + np.random.normal(0, noise_std, size=x.shape)
```

### Success Criteria

We compare two regimes:
- **Passive sampling:** train on progressively larger random subsets of noisy samples
- **Active sampling:** let a GP choose the next samples using an acquisition policy (exploration/exploitation)

For each sample size we track:
- **RMSE** on a fixed test set
- **Fit time** per model

## Models (just enough detail)

### Ridge as a strong baseline

**Ridge is fast and stable**, especially with polynomial features. It’s a great “first model” when you want a cheap baseline 
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

Support vector machines (SVMs) are supervised learning models used in regression and classification tasks.

**The attractiveness of SVMs comes from the fact that they are a sparse technique**, meaning that they rely solely on 
support vectors to make predictions rather than the entirety of the training set, t

SVMs create convex optimization problems, even on nonlinear data, by using what is commonly known as the *“kernel trick”*.

Common kernels include linear, polynomial, sigmoid, and Gaussian radial basis functions (RBF).

```python
from sklearn.svm import SVR

svr_model = SVR(kernel="rbf", C=20, epsilon=0.005, gamma=1.0)
```

### GPs: uncertainty + active sampling

Bayesian optimization techniques are **often extremely sample-efficient due to their incorporation of prior beliefs**, 
$p(w)$, about the problem that directs sampling in an active setting rather than randomly or sequentially.

Bayesian linear regression is grounded in the theoretical concepts of Bayes’ rule. It relies on the *posterior
distribution*, $p(w \mid y,X)$.

This distribution is defined as the product of the prior beliefs and likelihood, $p(y \mid X,w)$, which is the 
probability density of the observed points.

The two main components of a Bayesian optimization (BO) algorithm are the **surrogate model** and **acquisition
function**. 

The former is the model’s current *“best guess”* at estimating the objective function, and the latter is the method by 
which we choose new locations to sample. 

The most common surrogate model for continuous feature spaces is the **Gaussian process (GP)**. 

Similar to how a Gaussian distribution is a distribution over a random variable, **the GP is a distribution over a 
function.** 

Instead of returning a scalar at some point $x$, the GP returns the **mean** and **variance** of a normal distribution 
over all possible values of $f(x)$ at $x$.


```python
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel

kernel = RBF(
  length_scale=1.5, length_scale_bounds=(0.3, 10.0)) + \
  WhiteKernel(noise_level=0.1, noise_level_bounds=(1e-4, 1.0)
)

gp_model = GaussianProcessRegressor(
  kernel=kernel,
  normalize_y=True,
  alpha=0.0,
  n_restarts_optimizer=10,
)
```


## Results

The compute story is blunt and unsurprising: 

**Ridge and SVR remain extremely fast**, while GP fit time grows dramatically 
as the kernel matrix scales.

<figure>
  <img
    src="/images/posts/20260105-gp-vs-svr-vs-ridge-regression/fit-time-vs-samples.webp"
    alt="Model fit time vs sample size for Ridge, SVR, and GP."
    loading="lazy"
  />
</figure>


The accuracy story is the opposite:

The **GP reaches strong performance with far fewer 
samples**, especially with active sampling.

Although the Ridge regression is able to ultimately outperform both the SVR and GP, *it takes far more samples to
stabilize*.

<figure>
  <img
    src="/images/posts/20260105-gp-vs-svr-vs-ridge-regression/rmse-vs-samples.webp"
    alt="RMSE vs sample size comparing Ridge, SVR, passive GP, and active GP."
    loading="lazy"
  />
</figure>

The final figure aims to show how the acquisition-based sampling of the GP can reach high levels of performance with 
significantly fewer samples.

<figure>
  <img
    src="/images/posts/20260105-gp-vs-svr-vs-ridge-regression/active-sampling-threshold.webp"
    alt="Active sampling locations over the true function; early points highlighted until RMSE threshold is reached."
    loading="lazy"
  />
</figure>

The red points on the scatter plot show the points that were sampled until the GP reached within 5% of the lowest RMSE
of the SVM model after 100 samples.

This threshold was hit after just **16 samples**, *84% higher sample efficiency*, emphasizing the powerful aspects of
GPs in “expensive-to-evaluate” settings.

### What this means in practice

- If your data is expensive, the GP can be worth it even if training is slower.
- If your data is cheap (or you already have a lot), Ridge/SVR often win on total cost.
- Active sampling is where the GP becomes a different kind of tool: ***not just a regressor, but a data-collection strategy.***


### So... when is a GP worth it

A simple decision rubric:

- Choose Ridge if:
  - you want the **fastest baseline**
  - your function is *“smooth enough”* in your feature space
  - you can **afford more samples**

- Choose SVR if:
  - you want **nonlinear fit without GP-level compute**
  - you expect sparse support vectors to work well
  - you can tune hyperparameters reasonably

- Choose GP (+ active sampling) if:
  - **each sample is expensive** (simulation, lab trials, robotics, etc.)
  - uncertainty estimates will drive decisions
  - you benefit from choosing where to sample next

---

## Appendix: Regression Crash Course

### Linear (Ridge) Regression

In its simplest form, linear regression assumes a linear relationship between an input $x$ and a response, $y$.

In the case that the target function is nonlinear, meaning it is not of the form

$$y = \beta{0} + \beta{1}X_1 + \cdots + \beta_pX_p + \epsilon,$$

one can employ a *polynomial regression* technique that effectively transforms the input features into a polynomial
equation that best fits the function.

> Despite the target function being nonlinear, the solution is still classified as a linear model, as it has a
> **closed-form solution that remains a linear combination of the features**.

In a traditional setting, linear models are **optimized to reduce the residual sum of squares (RSS) across the
dataset**.

In theory, one could fit any nonlinear function using a flexible polynomial regressor, *but this can negatively affect
the model’s ability to generalize to unseen data* by overfitting to the training set.

To reduce model complexity when fitting complex linear models, regularization methods, such as Lasso (L1) and Ridge (L2)
regression, are used.

In this case, we will focus on Ridge regression.

Ridge regression works very similarly to the least squares regression, but a regularization penalty term is introduced
as follows:

$$\text{RSS} + \lambda \sum_{j=1}^p \beta_j^2$$

Where $\lambda \geq 0$ is the shrinkage tuning parameter.

This shrinkage penalty reduces the flexibility of the model fit, which introduces bias that in turn reduces the variance
of model predictions.

### Support Vector Machines (SVMs)

The SVM is traditionally used to solve binary classification problems by finding the **maximum margin** separating the 
hyperplane dividing up the feature space.

**Support vector regression (SVR) is a generalization of the SVM**, where an $\epsilon$-insensitive region is 
established around the function in an $\epsilon$-tube.

The optimization problem then becomes *finding the flattest tube that results in the lowest $\epsilon$-insensitive loss
using support vectors that influence the tube's shape*.

The attractiveness of SVMs comes from the fact that they are a **sparse technique**, meaning that instead of relying on
the entirety of the training set, **they rely solely on support vectors to make predictions**.

SVMs create convex optimization problems, even on nonlinear data, by using what is commonly known as the “kernel trick.”

This entails projecting the input space into a higher-dimensional feature space. This capability enables them to
separate datasets that may initially appear to be *linearly inseparable*, as is the case in many real-world datasets.

Common kernels include linear, polynomial, sigmoid, and Gaussian radial basis functions (RBF). 

> In this paper, any reference to kernels will specifically pertain to the **Radial Basis Function (RBF) kernel**.

The choice is based on the RBF kernel being *infinitely smooth*, making it ideal for approximating complex unknown 
target functions.

The RBF kernel, $k(x,x')$, is defined as

$$k(x,x') = \text{exp} \left(\frac{-||x-x'||^2}{\sigma^2}\right)$$

Looks super fun and easy to visualize, right? ... Right?!

### Bayesian Optimization & Gaussian Processes

In addition to traditional machine learning methods, various Bayesian optimization (BO) techniques can be employed to
deal with the **“expensive-to-evaluate” black-box functions**, where the need for sample-efficient techniques is 
essential.

> These have become increasingly popular in settings like hyperparameter tuning of DNNs and laboratory experiments where 
> generating new samples is time-consuming or costly.

Bayesian optimization techniques are sample-efficient due to their incorporation of prior beliefs, $p(w)$,
about the problem that directs sampling in an active setting rather than randomly or sequentially.

Bayesian linear regression is grounded in the theoretical concepts of Bayes’ rule. It relies on the *posterior
distribution*, $p(w \mid y,X)$.

This distribution is defined as the product of the prior beliefs and likelihood, $p(y \mid X,w)$,
which is the probability density of the observed points.

The two main components of a BO algorithm are the **surrogate model** and **acquisition function**. 

The former is the model’s current “best guess” at estimating the objective function, and the latter is the method by 
which we choose new locations to sample.

The most common surrogate model for continuous feature spaces is the Gaussian process (GP).

Similar to how a Gaussian distribution is a distribution over a random variable, **the GP is a distribution over a
function**.

Instead of returning a scalar at some point $x$, the GP returns the mean and variance of a normal distribution over all
possible values of $f(x)$.

The GP is defined by its mean function, $\mu(x)$, and covariance function, $k$, such that

$$\mu(x) = E[f(x)],$$

and the covariance function is often chosen to be the RBF kernel, $k(x,x')$ we discussed previously.

An example of a GP posterior can be found below. The solid black line is the predictive mean, the shaded region
represents the 95% confidence interval, and red dots indicate the training observations.

<figure>
  <img
    src="/images/posts/20260105-gp-vs-svr-vs-ridge-regression/gp-posterior.webp"
    alt="Gaussian Process posterior mean and uncertainty band over the true function."
    loading="lazy"
  />
</figure>

This representation of the GP posterior gives way to the second portion of the BO algorithm, **acquisition functions**.

The role of the acquisition function is to determine the method by which new points are sampled. Various methods exist,
such as Expected Improvement (EI), Probability of Improvement (PI), and Upper-Confidence Bound (UCB).

> Acquisition functions must balance the exploration-exploitation trade-off by the use of regularization 
> hyperparameters.

This is especially relevant in a regression scenario where global exploration of the target function is desired, as many
acquisition functions are quite greedy if not adequately regularized.

**When implemented correctly, the use of GPs can significantly enhance sample efficiency and reduce error in continuous
objective functions**.