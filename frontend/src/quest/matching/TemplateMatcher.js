/**
 * TemplateMatcher
 * 
 * A deterministic, rule-based engine to match User Context (Quest Answers)
 * to LFA Templates.
 * 
 * DESIGN PRINCIPLES:
 * 1. Pure Functionality: No side effects, no database calls.
 * 2. Deterministic: Same input always = same score.
 * 3. Transparent: Returns detailed breakdown of *why* a match occurred.
 * 4. Resilient: Handles missing/partial data gracefully.
 */

export const MATCH_WEIGHTS = {
  THEME: 0.4,
  GEOGRAPHY: 0.3,
  TARGET: 0.3
};



export class TemplateMatcher {
  
  /**
   * Main matching function
   * @param {Object} userContext - Structured context { theme, geography: [], targetGroups: [] }
   * @param {Array} templates - List of LFATemplate objects
   * @returns {Array} - Sorted list of matches with scores and explanations
   */
  match(userContext, templates) {
    if (!templates || !Array.isArray(templates)) return [];
    if (!userContext) return [];

    // Evaluate each template
    const results = templates.map(template => {
      const evaluation = this._evaluateTemplate(userContext, template);
      return {
        templateId: template.id,
        ...evaluation
      };
    });

    // Sort by score (descending)
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Evaluate a single template against the structured context
   */
  _evaluateTemplate(context, template) {
    const breakdown = {
      theme: 0,
      geography: 0,
      targetGroup: 0
    };
    const explanations = [];

    // 1. Theme Scoring (40%)
    // Strict match on canonical theme. 
    // We assume context.theme is the enum value (e.g., "EDUCATION_FLN")
    const contextTheme = context.theme || "";
    // Allow match if primary theme is identical
    if (contextTheme === template.theme) {
      breakdown.theme = 100;
      explanations.push(`✅ Theme match: ${template.theme}`);
    } else {
      // Check secondary themes if they exist
      const secondaryMatch = template.mapping.secondaryThemes?.includes(contextTheme);
      if (secondaryMatch) {
         breakdown.theme = 50; // Partial credit for secondary
         explanations.push(`⚠️ Secondary theme match: ${contextTheme} (Primary: ${template.theme})`);
      } else {
         explanations.push(`❌ Theme mismatch: User context '${contextTheme}' != Template '${template.theme}'`);
      }
    }

    // 2. Geography Scoring (30%) - Proportional
    // How many of the template's required levels does the user cover?
    const templateGeos = template.mapping.geographyLevel || [];
    const userGeos = context.geography || []; // e.g. ["RURAL", "DISTRICT"]
    
    if (templateGeos.length > 0) {
        const intersection = templateGeos.filter(g => userGeos.includes(g));
        const geoScore = (intersection.length / templateGeos.length) * 100;
        breakdown.geography = Math.round(geoScore);
        
        if (intersection.length === templateGeos.length) {
            explanations.push(`✅ Geography match: Perfect overlap (${templateGeos.join(', ')})`);
        } else if (intersection.length > 0) {
            const missing = templateGeos.filter(g => !userGeos.includes(g));
            explanations.push(`⚠️ Partial Geography: Matched ${intersection.join(', ')}. Missing: ${missing.join(', ')}`);
        } else {
            explanations.push(`❌ Geography mismatch: Expected ${templateGeos.join(', ')}. Found ${userGeos.length ? userGeos.join(', ') : 'None'}.`);
        }
    } else {
        // If template has no constraints, is that a match? 
        // Assuming templates always have geography constraints. If not, neutral score or 100?
        // Let's assume neutral 0 unless specified, but for safety 100 if generic.
        // Rule: Templates specific to a geo should score. Generic templates? 
        // Sticking to 0 if no geo defined to force definition, or 100 if universally applicable?
        // Let's go with 0 and explanation for now to encourage data quality.
        explanations.push(`ℹ️ Template has no geography constraints.`);
    }

    // 3. Target Group Scoring (30%) - Proportional
    const templateTargets = template.mapping.targetGroups || [];
    const userTargets = context.targetGroups || [];
    
    if (templateTargets.length > 0) {
        const inputTargets = userTargets.map(t => t.split('/')[0]); // Handle simple mapping if needed
        const overlap = templateTargets.filter(t => inputTargets.includes(t));
        const targetScore = (overlap.length / templateTargets.length) * 100;
        breakdown.targetGroup = Math.round(targetScore);

        if (overlap.length === templateTargets.length) {
            explanations.push(`✅ Target match: Perfect overlap (${templateTargets.join(', ')})`);
        } else if (overlap.length > 0) {
            const missing = templateTargets.filter(t => !inputTargets.includes(t));
            explanations.push(`⚠️ Partial Target: Matched ${overlap.join(', ')}. Missing: ${missing.join(', ')}`);
        } else {
            explanations.push(`❌ Target mismatch: Expected ${templateTargets.join(', ')}. Found ${userTargets.length ? userTargets.join(', ') : 'None'}.`);
        }
    } else {
         explanations.push(`ℹ️ Template has no target constraints.`);
    }

    // Calculate Final Weighted Score
    const totalScore = (
      (breakdown.theme * MATCH_WEIGHTS.THEME) +
      (breakdown.geography * MATCH_WEIGHTS.GEOGRAPHY) +
      (breakdown.targetGroup * MATCH_WEIGHTS.TARGET)
    );

    return {
      matchScore: Math.round(totalScore),
      breakdown,
      explanation: explanations
    };
  }
}

export const templateMatcher = new TemplateMatcher();
