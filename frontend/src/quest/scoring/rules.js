/**
 * Scoring Rules Registry
 * Heuristic checks for LFA quality.
 * Rules are grouped by Quest Level ID.
 */

export const SCORING_RULES = {
  // Level 1: Context
  context: [
    {
      id: 'prob_len',
      // Check: Problem statement should be a string and reasonably descriptive (> 20 chars)
      check: (ctx) => typeof ctx.problemStatement === 'string' && ctx.problemStatement.trim().length > 20,
      weight: 1,
      message: "Problem statement is descriptive (>20 characters)."
    },
    {
      id: 'stake_exist',
      // Check: Stakeholders must be a non-empty array
      check: (ctx) => Array.isArray(ctx.stakeholders) && ctx.stakeholders.length > 0,
      weight: 1,
      message: "At least one stakeholder identified."
    }
  ],

  // Level 2: Strategy
  strategy: [
    {
      id: 'impact_len',
      check: (ctx) => typeof ctx.impact === 'string' && ctx.impact.trim().length > 10,
      weight: 1,
      message: "Overall Goal (Impact) is defined."
    },
    {
      id: 'outcome_len',
      check: (ctx) => typeof ctx.outcome === 'string' && ctx.outcome.trim().length > 10,
      weight: 1,
      message: "Project Purpose (Outcome) is defined."
    }
  ],

  // Level 3: Operation
  operation: [
    {
      id: 'activities_exist',
      check: (ctx) => typeof ctx.activities === 'string' && ctx.activities.trim().length > 10,
      weight: 1,
      message: "Key Activities are defined."
    }
  ],

  // Level 4: Measure
  measure: [
    {
      id: 'kpi_exist',
      check: (ctx) => typeof ctx.indicators === 'string' && ctx.indicators.trim().length > 5,
      weight: 1,
      message: "Indicators (KPIs) are defined."
    }
  ],

  // Level 5: Logic Check
  logic: [
    {
      id: 'assump_exist',
      check: (ctx) => typeof ctx.assumptions === 'string' && ctx.assumptions.trim().length > 10,
      weight: 1,
      message: "Critical Assumptions are identified."
    }
  ]
};
