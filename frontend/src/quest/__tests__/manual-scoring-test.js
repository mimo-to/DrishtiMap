// Manual Test for Scoring Engine
// Run via node or check console if imported

import { scoringEngine } from '../scoring/ScoringEngine.js';

console.log("--- Starting Scoring Engine Test ---");

// TEST 1: Empty Context
console.log("\n[Test 1] Empty Context");
const res1 = scoringEngine.evaluate({});
if (res1.overallScore === 0) {
    console.log("PASS: Overall Score is 0.");
    // Check breakdown depth
    if (res1.breakdown.context && res1.breakdown.context.details[0].passed === false) {
        console.log("PASS: Rule reported as failed.");
    } else {
        console.error("FAIL: Rule reporting incorrect for empty context.");
    }
} else {
    console.error(`FAIL: Expected 0, got ${res1.overallScore}`);
}

// TEST 2: Partial Context (Level 1 Complete-ish)
console.log("\n[Test 2] Partial Context");
const partialCtx = {
    problemStatement: "This is a very serious problem that needs a descriptive answer longer than 20 chars.",
    stakeholders: [] // Empty array -> Should fail check
};
const res2 = scoringEngine.evaluate(partialCtx);
// Level 1 has 2 rules. 1 passed (problem), 1 failed (stakeholders empty). Score should be 50%.
if (res2.breakdown.context.score === 50) {
    console.log("PASS: Context Level Score is 50%.");
    const details = res2.breakdown.context.details;
    if (details.find(d => d.ruleId === 'prob_len').passed === true &&
        details.find(d => d.ruleId === 'stake_exist').passed === false) {
        console.log("PASS: Detailed breakdown is correct.");
    } else {
        console.error("FAIL: Breakdown details mismatch.");
    }
} else {
    console.error(`FAIL: Expected 50 for context, got ${res2.breakdown.context.score}`);
}

// TEST 3: Full Context (Mock)
console.log("\n[Test 3] Full Context");
const fullCtx = {
    problemStatement: "Long problem statement that satisfies the length requirement.",
    stakeholders: ["NGO", "Local Gov"],
    impact: "To improve the quality of life for all citizens.",
    outcome: "Increased access to clean water in 5 villages.",
    activities: "Drill wells, Train mechanics, Form committees.",
    indicators: "% of households with access to water.",
    assumptions: "Groundwater levels remain stable."
};
const res3 = scoringEngine.evaluate(fullCtx);
if (res3.overallScore === 100) {
    console.log("PASS: Overall Score is 100%.");
} else {
    console.error(`FAIL: Expected 100, got ${res3.overallScore}`);
    console.log(JSON.stringify(res3.breakdown, null, 2));
}

console.log("\n--- Test Complete ---");
