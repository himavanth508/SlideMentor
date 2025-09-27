const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { bucket } = require("../config/gcs.js");
const { connectDB } = require("../config/db.js");
const { extractTextFromPDF } = require("../utils/pdf.js");
const { generateEmbedding } = require("../utils/embeddings.js");
const { ObjectId } = require("mongodb");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const localPath = req.file.path;
    const destFileName = `${Date.now()}-${req.file.originalname}`;

    // Upload to GCS
    await bucket.upload(localPath, { destination: destFileName });
    const gcsUrl = `gs://${process.env.BUCKET_NAME}/${destFileName}`;

    // Extract text
    let extractedText = "";
    if (req.file.mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(localPath);
    }

    // Store file metadata
    const db = await connectDB();
    const fileDoc = {
      filename: req.file.originalname,
      storageUrl: gcsUrl,
      uploadedAt: new Date(),
    };
    const { insertedId } = await db.collection("files").insertOne(fileDoc);

    // Split text into chunks (~500 chars for simplicity)
    const chunks = extractedText.match(/(.|[\r\n]){1,500}/g) || [];
    const chunkDocs = [];
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      chunkDocs.push({
        fileId: insertedId,
        text: chunk,
        embedding,
      });
    }

    if (chunkDocs.length > 0) {
      await db.collection("chunks").insertMany(chunkDocs);
    }

    fs.unlinkSync(localPath);

    res.json({ message: "Uploaded successfully", fileId: insertedId });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
