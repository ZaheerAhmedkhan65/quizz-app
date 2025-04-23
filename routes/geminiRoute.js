// routes/geminiRoute.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { v4: uuidv4 } = require("uuid");
const ChatHistory = require("../model/ChatHistory");
const chatHistoryController = require("../controllers/chatController");
const authenticate = require("../middleware/authenticate");

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Configure multer for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});


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

    const MAX_SIZE = 2 * 1024 * 1024;
    if (req.file.size > MAX_SIZE) {
      return res.status(400).json({ message: "File size exceeds 2MB limit" });
    }

    // Extract PDF content
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);

    // Generate a unique ID for this session
    const id = uuidv4();
    pdfCache.set(id, pdfData.text);
    res.json({ id });
  } catch (err) {
    console.error("Error during upload:", err);
    res.status(500).json({ error: "Failed to upload and parse PDF" });
  }
});

router.post("/generate-response", async (req, res) => {
  const { prompt, userId,currentPdfId, sessionId } = req.body;

  try {
    let userPrompt = prompt;
    let isPdfBased = false;


    if (currentPdfId && pdfCache.has(currentPdfId)) {
      const pdfText = pdfCache.get(currentPdfId);
      userPrompt = `${prompt}\n\n${pdfText}`;
      isPdfBased = true;
      pdfCache.delete(currentPdfId);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent([userPrompt]);
    const response = result.response.text();
    
    // Save chat history
    const chatHistory = await ChatHistory.saveChatHistory({ userId, sessionId, prompt, response, isPdfBased, pdfId: isPdfBased ? currentPdfId : null });

    res.json({ response, chatHistory });
  } catch (err) {
    console.error("Error generating response:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
});


// URL: /api/gemini/get-chat?id=123
router.get("/get-chat", async (req, res) => {
  try {
    const chat = await ChatHistory.findById(req.query.id); // not req.params
    res.json({ chat });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/delete-chat", async (req, res) => {
  try {
    await ChatHistory.deleteChatById(req.query.id); // not req.params
    res.json({ message:"chat deleted successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/save-feedback", async (req, res) => {
  try {
    await ChatHistory.saveFeedback(req.body);
    res.json({ message:"Feedback saved successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/get-chat-history",authenticate,chatHistoryController.getUserChatHistory);


module.exports = router;
