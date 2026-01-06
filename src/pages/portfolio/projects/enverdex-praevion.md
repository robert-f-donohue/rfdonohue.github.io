--- 
layout:  /src/layouts/ProjectLayout.astro
title: 'Enverdex — Praevion Optimization Engine'
pubDate: 2026-01-04
description: 'Simulation-driven retrofit optimization for building decarbonization, returning tradeoff-ready recommendations.'
languages: ["python"]
image:
  url: "/images/projects/enverdex_sandbox.webp"
  alt: "Thumbnail of Astro arches."
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

## Where it’s going
Near-term: a smooth UX that makes tradeoffs obvious and action-oriented (shortlists, comparisons, and export-ready outputs).
Long-term: expand across cities/typologies with robust priors, improved surrogate modeling, and decision support layers.