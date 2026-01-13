import { SCORING_RULES } from './rules.js';

/**
 * ScoringEngine
 * Stateless logic to evaluate Quest Context against Heuristic Rules.
 */
class ScoringEngine {
  
  /**
   * Evaluate the full context.
   * @param {Object} context - The accumulated Quest Context (e.g. { problemStatement: '...' })
   * @returns {Object} - { overallScore, breakdown: { [levelId]: { score, details: [] } } }
   */
  evaluate(context) {
    const breakdown = {};
    let totalScoreSum = 0;
    let levelCount = 0;

    // Iterate over all defined levels in Rules
    Object.keys(SCORING_RULES).forEach((levelId) => {
      const rules = SCORING_RULES[levelId];
      if (!rules || rules.length === 0) return;

      let passedWeights = 0;
      let totalWeights = 0;
      const details = [];

      rules.forEach((rule) => {
        const passed = rule.check(context);
        const weight = rule.weight || 1;

        if (passed) {
          passedWeights += weight;
        }
        totalWeights += weight;

        details.push({
          ruleId: rule.id,
          passed: passed,
          message: rule.message
        });
      });

      // Calculate Level Score
      // If totalWeights is 0, score is 0 (avoid NaN)
      const levelScore = totalWeights > 0 ? (passedWeights / totalWeights) * 100 : 0;

      breakdown[levelId] = {
        score: Math.round(levelScore),
        details: details
      };

      totalScoreSum += levelScore;
      levelCount++;
    });

    // Calculate Overall Score
    const overallScore = levelCount > 0 ? totalScoreSum / levelCount : 0;

    return {
      overallScore: Math.round(overallScore),
      breakdown
    };
  }
}

export const scoringEngine = new ScoringEngine();
