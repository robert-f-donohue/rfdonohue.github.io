---
title: "GP vs SVM vs Ridge — Sample Efficiency vs Compute"
description: "A comparative study of accuracy and learning behavior under varying sample budgets and runtime constraints."
status: completed
tags: ["Gaussian Processes", "SVM", "Ridge Regression", "Sample Efficiency", "Compute"]
highlights:
  - "Clear separation between model classes when n is small"
  - "Compute scaling and training-time tradeoffs made explicit"
  - "Takeaways framed for real-world modeling workflows"
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