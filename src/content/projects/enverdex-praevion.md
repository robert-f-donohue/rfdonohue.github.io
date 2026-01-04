---
title: "Enverdex — Praevion Optimization Engine"
description: "Simulation-driven retrofit optimization for building decarbonization, returning tradeoff-ready recommendations."
category: startup
status: active
tags: ["Bayesian Optimization", "OpenStudio", "EnergyPlus", "Decarbonization", "Optimization"]
website: "https://enverdex.com"  # change if needed
highlights:
  - "Tree-based surrogate modeling for mixed categorical decision spaces"
  - "Batch selection for parallel simulation workflows"
  - "Hard feasibility via conditional configuration space design"
---

## What it is
A simulation-driven optimization engine that explores retrofit strategies and returns a diverse set of high-quality tradeoff solutions.

## Why it matters
Building owners and cities need decision-grade retrofit guidance without building bespoke energy models from scratch for every scenario.

## How it works (high level)
- Inputs: building info + retrofit options + constraints
- Loop: propose candidates → simulate → compute KPIs → update model
- Output: ranked options and tradeoffs (cost / operational carbon / embodied carbon)

## Current status
Active development; building an investor-ready product layer and polished UX.