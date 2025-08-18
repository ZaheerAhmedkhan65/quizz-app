// utils/intentClassifier.js
const stringSimilarity = require("string-similarity");

// Predefined examples of identity-related questions
const identityExamples = [
  "who are you",
  "what's your name",
  "what is your name",
  "tell me about yourself",
  "do you have a name",
  "are you an AI",
  "what are you",
  "who made you",
  "what do people call you",
  "what assistant is this",
  "which AI is this",
  "who created you",
  "who is the creator of you",
  "who is the creator of this AI",
  "who is the creator of this chatbot",
  "who is the creator of this assistant"
];

/**
 * Checks whether the prompt is about the AI's identity using fuzzy matching.
 * @param {string} prompt - User's question.
 * @param {number} threshold - Similarity threshold (0.5–1.0).
 * @returns {boolean} True if it’s likely an identity question.
 */
function isIdentityQuestion(prompt, threshold = 0.7) {
  const input = prompt.toLowerCase().trim();
  const matches = stringSimilarity.findBestMatch(input, identityExamples);
  return matches.bestMatch.rating >= threshold;
}

module.exports = {
  isIdentityQuestion
};
