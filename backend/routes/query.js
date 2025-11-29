const express = require("express");
const { connectDB } = require("../config/db.js");
const { generateEmbedding } = require("../utils/embeddings.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ObjectId } = require("mongodb");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

router.post("/", async (req, res) => {
  try {
    const { question, fileId } = req.body;
    const qEmbedding = await generateEmbedding(question);

    const db = await connectDB();
    const results = await db.collection("chunks").aggregate([
      {
        $vectorSearch: {
          queryVector: qEmbedding,
          path: "embedding",
          numCandidates: 100,
          limit: 5,
          index: "vector_index",
          filter: { fileId: new ObjectId(fileId) }
        }
      }
    ]).toArray();

    const context = results.map(r => r.text).join("\n");

    console.log("Context:", context);
    console.log("Question:", question);
    console.log("req.body", req.body);

    const prompt = `Answer based on the PDF content below:\n\n${context}\n\nQuestion: ${question}`;

    const completion = await model.generateContent(prompt);
    const answer = completion.response.candidates[0].content.parts[0].text;

    res.json({ answer });
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
