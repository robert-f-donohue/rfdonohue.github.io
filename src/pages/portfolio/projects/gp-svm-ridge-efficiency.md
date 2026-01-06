--- 
layout:  /src/layouts/ProjectLayout.astro
title: 'GP vs SVM vs Ridge — Sample Efficiency vs Compute'
pubDate: 2026-01-04
description: 'A comparative study of accuracy and learning behavior under varying sample budgets and runtime constraints.'
languages: ["python"]
image:
  url: "/images/projects/gp-regression.webp"
  alt: "Thumbnail of Astro arches."
---

## Summary
This project compares Gaussian Processes, SVMs, and Ridge Regression along two axes:
1) performance as data is scarce (sample efficiency)  
2) cost to train and tune (compute efficiency)

## Approach
- consistent preprocessing and evaluation protocol
- sweep over sample sizes
- track both metrics (e.g., error) and runtime

## Key takeaways
Write the punchline(s) you want an investor/technical reviewer to remember.