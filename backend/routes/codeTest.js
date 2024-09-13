const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/test', async (req, res) => {
  const { code, language, algorithmName } = req.body;

  try {
    const evaluation = await evaluateCodeWithGemini(code, language, algorithmName);
    res.json(evaluation);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while evaluating the code.' });
  }
});

async function evaluateCodeWithGemini(code, language, algorithmName) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    As an expert programming tutor and algorithm specialist, critically evaluate the following ${language} code for a ${algorithmName} implementation:

    ${code}

    Provide a thorough evaluation based on these strict criteria:
    1. Correctness (Weight: 60%):
       - Does the code correctly implement the ${algorithmName}?
       - Does it handle all possible input cases, including edge cases?
       - Are there any logical errors or bugs?

    2. Efficiency (Weight: 25%):
       - What is the time complexity of the implementation?
       - Is it the optimal solution for ${algorithmName}?
       - Are there any unnecessary operations or redundant code?

    3. Code style and best practices (Weight: 15%):
       - Is the code well-formatted and easy to read?
       - Are variable names descriptive and following ${language} conventions?
       - Is there appropriate commenting and documentation?

    Based on your evaluation, categorize the result as one of the following:
    - GREEN: The code is correct, efficient, and follows best practices. Only minor style improvements, if any, are needed.
    - YELLOW: The code has minor issues in correctness, efficiency, or style that can be easily fixed. The core algorithm is implemented but needs some improvements.
    - RED: The code has significant errors, is inefficient, or does not correctly implement the ${algorithmName}. Major changes are required.

    Strict Categorization Rules:
    - If there are ANY errors in correctness, even if minor, the category MUST be RED.
    - If the time complexity is not optimal for ${algorithmName}, the category MUST be YELLOW or RED, depending on the severity.
    - Only categorize as GREEN if the implementation is correct, efficient, and follows good coding practices.

    Format your response as follows:
    CATEGORY: [GREEN/YELLOW/RED]
    EVALUATION:
    [Your detailed evaluation here, addressing each of the criteria above]
    SUGGESTIONS:
    [Specific, actionable suggestions for improvement or correction]
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse the response to extract category, evaluation, and suggestions
  const category = text.match(/CATEGORY:\s*(GREEN|YELLOW|RED)/i)?.[1].toUpperCase();
  const evaluation = text.match(/EVALUATION:([\s\S]*?)SUGGESTIONS:/i)?.[1].trim();
  const suggestions = text.match(/SUGGESTIONS:([\s\S]*)/i)?.[1].trim();

  return {
    category,
    evaluation,
    suggestions
  };
}

module.exports = router;