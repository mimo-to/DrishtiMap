// Basic manual test for Quest Engine & Store integration
// Run this file (if environment permits) or use it as a reference for behavior

import { useQuestStore } from '../engine/useQuestStore.js';
import { engine } from '../engine/QuestEngine.js';

console.log("--- Starting Manual Quest Engine Test ---");

// 1. Mock Question
const q1 = {
    id: 'q1',
    key: 'problemStatement',
    type: 'text',
    prompt: 'What is the problem?',
    validation: { required: true, minLength: 5 }
};

// 2. Initialize Store (Zustand vanilla usage for testing outside React)
const store = useQuestStore; 

// Helper to inspect state
const logState = () => {
    const s = store.getState();
    console.log("Context:", s.context);
    console.log("Answers:", s.answers);
    console.log("Errors:", s.errors);
};

// TEST 1: Submit Invalid Answer (Too short)
console.log("\n[Test 1] Submit Invalid (Too short)");
store.getState().submitAnswer(q1, 'Bad');
const err1 = store.getState().errors['q1'];
if (err1 && Object.keys(store.getState().context).length === 0) {
    console.log("PASS: Error set, Context empty.");
} else {
    console.error("FAIL: State incorrect after invalid input.");
}

// TEST 2: Submit Valid Answer
console.log("\n[Test 2] Submit Valid");
store.getState().submitAnswer(q1, 'This is a valid problem statement.');
const ctx2 = store.getState().context;
if (ctx2.problemStatement === 'This is a valid problem statement.') {
    console.log("PASS: Context updated.");
} else {
    console.error("FAIL: Context not updated.");
}

// TEST 3: Hook Registration
console.log("\n[Test 3] Hooks");
let hookCalled = false;
engine.registerHooks({
    onAnswer: [
        (payload, ctx) => {
            console.log("Hook triggered:", payload);
            hookCalled = true;
        }
    ]
});
// Trigger again
store.getState().submitAnswer(q1, 'Updated statement');
if (hookCalled) {
    console.log("PASS: Hook executed.");
} else {
    console.error("FAIL: Hook not executed.");
}

console.log("\n--- Test Complete ---");
