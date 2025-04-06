// routes/geminiRoute.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { v4: uuidv4 } = require("uuid");

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Configure multer for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Google Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// In-memory cache to store PDF content mapped by UUID
const pdfCache = new Map();

/**
 * Route: POST /upload
 * Description: Uploads a PDF file, extracts text, and returns a unique ID
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Extract PDF content
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);

    // Generate a unique ID for this session
    const id = uuidv4();
    pdfCache.set(id, pdfData.text);

    console.log("PDF uploaded. ID:", id);
    res.json({ id });
  } catch (err) {
    console.error("Error during upload:", err);
    res.status(500).json({ error: "Failed to upload and parse PDF" });
  }
});

router.post("/generate-response", async (req, res) => {
  const { prompt, id } = req.body;

  try {
    let userPrompt = prompt;

    // If ID is provided and exists in cache, append PDF text
    if (id && pdfCache.has(id)) {
      const pdfText = pdfCache.get(id);
      userPrompt = `${prompt}\n\n${pdfText}`;
      // Optional: Remove from cache after use to free memory
      pdfCache.delete(id);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent([userPrompt]);
    const response = result.response.text();

    res.json({ response });
  } catch (err) {
    console.error("Error generating response:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

module.exports = router;
