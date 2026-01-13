import { templateMatcher } from '../matching/TemplateMatcher.js';

/**
 * MANUAL TEST: Template Matching Logic (Phase 5.2)
 * Run: node src/quest/__tests__/manual-matching-test.js
 */

// 1. Mock Templates (Based on Phase 5.1 Model)
// 1. Mock Templates (Based on Phase 5.1 Model)
const MOCK_TEMPLATES = [
  {
    id: 'tpl_fln_rural',
    name: 'FLN for Rural Districts',
    theme: 'EDUCATION_FLN',
    mapping: {
      primaryTheme: 'EDUCATION_FLN',
      geographyLevel: ['RURAL', 'DISTRICT'],
      targetGroups: ['STUDENTS', 'TEACHERS']
    }
  },
  {
    id: 'tpl_health_urban',
    name: 'Maternal Health in Slums',
    theme: 'HEALTH_MATERNAL',
    mapping: {
      primaryTheme: 'HEALTH_MATERNAL',
      geographyLevel: ['URBAN', 'BLOCK'],
      targetGroups: ['WOMEN', 'COMMUNITY']
    }
  },
  {
    id: 'tpl_vocational_state',
    name: 'State-wide Vocational Policy',
    theme: 'LIVELIHOOD_SKILLS',
    mapping: {
      primaryTheme: 'LIVELIHOOD_SKILLS',
      geographyLevel: ['STATE'],
      targetGroups: ['YOUTH', 'GOVT_OFFICIALS']
    }
  }
];

// 2. Test Cases

// Case A: Perfect FLN Logic
const ctxA = {
  theme: "EDUCATION_FLN",
  geography: ["RURAL", "DISTRICT"],
  targetGroups: ["STUDENTS", "TEACHERS"]
};

// Case B: Partial match (Health but rural/district mismatch)
// Theme Matches (40)
// Geo: 'RURAL' matches nothing in ['URBAN', 'BLOCK'] -> 0
// Target: 'WOMEN' matches ['WOMEN', 'COMMUNITY'] -> 50% score (15 pts)
// Total 55?
const ctxB = {
  theme: "HEALTH_MATERNAL",
  geography: ["RURAL"],
  targetGroups: ["WOMEN"]
};

// Case C: No match
const ctxC = {
  theme: "INFRASTRUCTURE_ROADS",
  geography: ["NATIONAL"],
  targetGroups: ["DRIVERS"]
};

function runTest(name, context) {
  console.log(`\n--- Test: ${name} ---`);
  console.log('Context:', JSON.stringify(context));
  
  const results = templateMatcher.match(context, MOCK_TEMPLATES);
  
  results.forEach(r => {
    console.log(`[${r.templateId}] Score: ${r.matchScore}%`);
    console.log('Breakdown:', r.breakdown);
    console.log('Expl:', r.explanation.join(' | '));
  });
}

// EXECUTE
console.log('Starting TemplateMatcher Tests...');
runTest('Perfect FLN Match', ctxA);
runTest('Partial Health Match', ctxB);
runTest('No Match', ctxC);
