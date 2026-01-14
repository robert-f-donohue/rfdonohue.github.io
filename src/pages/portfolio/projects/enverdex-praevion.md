--- 
layout:  /src/layouts/ProjectLayout.astro
title: 'Enverdex & Praevion Optimization Engine'
pubDate: 2026-01-04
description: 'Simulation-driven retrofit optimization for building decarbonization, returning tradeoff-ready recommendations.'
languages: ["python", "deephyper", "openstudio", "energyplus"]
image:
  url: "/images/projects/enverdex_sandbox.webp"
  alt: "Thumbnail of Astro arches."
---

## What it is

A **high-fidelity, simulation-driven optimization engine** designed to navigate the complex financial and technical 
requirements of building retrofits. 

Praevion leverages automated energy modeling to explore thousands of potential retrofit combinations, identifying the 
specific strategies that **maximize performance while minimizing investment.**

## Why it matters

With regulations like BERDO 2.0 introducing steep financial penalties for non-compliance, **asset owners can no longer 
rely on "one size fits all" solutions.** 

Praevion reduces the need for bespoke, manual energy models for every scenario, providing decision-grade guidance that 
balances capital expenditure against long-term utility savings and regulatory risk.

## How it works (high level)

- **Intelligent Inputs:** Processes basic building characteristics, available retrofit options, and specific budget contraints.
- **Automated Simulation Loop:** Uses advanced search algorithms (via `DeepHyper`) to propose candidates, simulating performance in `OpenStudio` and `EnergyPlus` to compute KPIs.
- **Decision Support:** Instead of a single "best" answer, it returns a **Pareto front** of optimized tradeoffs that compare upfront costs against operational savings and carbon emissions.

## Current status

The core optimization engine is fully functional. We are currently in a development phase, building an investor-ready 
product layer and a polished user experience that translates complex simulation data into actionable investment 
roadmaps.

## Where it’s going

- **Near-term:** Launching a **streamlined UX that makes financial and technical tradeoffs obvious and action-oriented** through curated shortlists and export-ready reporting.
- **Long-term:** Expanding our library of building prototypes across major US cities, incorporating robust priors and surrogate modeling to provide near-instant decision support for any building typology.