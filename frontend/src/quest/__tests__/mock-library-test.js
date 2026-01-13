import { templateMatcher } from '../matching/TemplateMatcher.js';
import { MOCK_TEMPLATES } from '../config/mock-templates.js';

/**
 * TEST: Mock Template Library Verification (Phase 5.3)
 * Run: node src/quest/__tests__/mock-library-test.js
 */

console.log('--- STARTING MOCK LIBRARY VERIFICATION ---\n');

// SCENARIO 1: Rural FLN (Goal: Match tpl_edu_fln_rural_dist)
const ctxRuralFLN = {
    theme: 'EDUCATION_FLN',
    geography: ['RURAL', 'DISTRICT'],
    targetGroups: ['STUDENTS', 'TEACHERS']
};

console.log('SCENARIO 1: Rural FLN Context');
const results1 = templateMatcher.match(ctxRuralFLN, MOCK_TEMPLATES);
printTopMatches(results1, 3);


// SCENARIO 2: Urban Health (Goal: Match tpl_health_nutrition_urban or tpl_health_maternal_rural partial)
const ctxUrbanHealth = {
    theme: 'HEALTH_MATERNAL',
    geography: ['URBAN', 'WARD'],
    targetGroups: ['WOMEN']
};

console.log('\nSCENARIO 2: Urban Maternal Health Context');
const results2 = templateMatcher.match(ctxUrbanHealth, MOCK_TEMPLATES);
printTopMatches(results2, 3);


// SCENARIO 3: Generic Youth Skills (Goal: Match tpl_live_youth_vocational)
const ctxYouthSkills = {
    theme: 'LIVELIHOOD_SKILLS',
    geography: ['DISTRICT'], // Generic geo
    targetGroups: ['YOUTH']
};

console.log('\nSCENARIO 3: Youth Skills Context');
const results3 = templateMatcher.match(ctxYouthSkills, MOCK_TEMPLATES);
printTopMatches(results3, 3);


// SCENARIO 4: Mismatch (Theme: Infrastructure)
const ctxInfrastructure = {
    theme: 'INFRASTRUCTURE',
    geography: ['STATE'],
    targetGroups: ['GOVT_OFFICIALS']
};

console.log('\nSCENARIO 4: Infrastructure Mismatch');
const results4 = templateMatcher.match(ctxInfrastructure, MOCK_TEMPLATES);
printTopMatches(results4, 3);


// --- HELPER ---
function printTopMatches(results, count) {
    if (results.length === 0) {
        console.log('  No matches found.');
        return;
    }
    
    results.slice(0, count).forEach((r, i) => {
        console.log(`  #${i+1} [${r.matchScore}%] ${r.templateId}`);
        r.explanation.forEach(ex => console.log(`      ${ex}`));
    });
}
