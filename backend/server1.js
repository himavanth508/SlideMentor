const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {Storage} = require("@google-cloud/storage");
const {Firestore} = require("@google-cloud/firestore");
const cors = require("cors");
const pdfParse = require("pdf-parse");

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

// Load environment vars
const PROJECT_ID = "ai-slides-helper";
const BUCKET_NAME = "ai-slides-slides-bucket";
const EMBEDDING_MODEL = "text-embedding-005";

console.log("Initializing server with configuration:", {
  PROJECT_ID,
  BUCKET_NAME,
  EMBEDDING_MODEL
});

// textembedding-gecko@003
const storage = new Storage({ projectId: PROJECT_ID });
const firestore = new Firestore({ projectId: PROJECT_ID });

const axios = require("axios");

async function getEmbedding(text) {
  try {
    const response = await axios.post("http://localhost:8000/embed", { text });
    return response.data.embedding;
  } catch (err) {
    console.error("Error calling embedding service:", err.message);
    return [];
  }
}


app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("Received upload request:", {
      originalname: req?.file?.originalname,
      mimetype: req?.file?.mimetype,
      size: req?.file?.size
    });

    if (!req.file) {
      console.warn("Upload request rejected: No file provided");
      return res.status(400).json({ error: "No file uploaded." });
    }
    const localPath = req.file.path;
    const destFileName = `${Date.now()}-${req.file.originalname}`;
    console.log("Uploading file to Cloud Storage:", {
      bucket: BUCKET_NAME,
      destFileName,
      localPath
    });
    await storage.bucket(BUCKET_NAME).upload(localPath, { destination: destFileName });
    const fileUrl = `gs://${BUCKET_NAME}/${destFileName}`;
    console.log("File successfully uploaded to Cloud Storage:", { fileUrl });

    let extractedText = "";
    if (req.file.mimetype === "application/pdf") {
      console.log("Processing PDF file for text extraction");
      const dataBuffer = fs.readFileSync(localPath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
      console.log("PDF text extraction complete", {
        extractedTextLength: extractedText.length
      });
    }

    let embeddingVector = [];
    if (extractedText && extractedText.trim().length > 0) {
      console.log("Generating embedding for extracted text");
      embeddingVector = await getEmbedding(extractedText.slice(0, 15000));
      console.log("Embedding generation complete", {
        embeddingLength: embeddingVector.length
      });
    }

    console.log("Creating Firestore document");
    const docRef = firestore.collection("slides").doc();
    await docRef.set({
      filename: req.file.originalname,
      storageUrl: fileUrl,
      uploadedAt: new Date(),
      embedding: embeddingVector,
      textSnippet: extractedText.slice(0, 200),
    });
    console.log("Firestore document created successfully");

    fs.unlinkSync(localPath);

    res.json({ message: "Uploaded and embedded", docId: docRef.id, fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET list of all uploaded files
app.get("/files", async (req, res) => {
  try {
    const snapshot = await firestore
      .collection("slides")
      .orderBy("uploadedAt", "desc")
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const files = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        filename: data.filename,
        textSnippet: data.textSnippet || "",
        uploadedAt: data.uploadedAt,
        storageUrl: data.storageUrl,
      };
    });

    res.json(files);
  } catch (err) {
    console.error("Error fetching files:", err.message);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// GET file details + signed URL
app.get("/file/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get metadata from Firestore
    const doc = await firestore.collection("slides").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "File not found" });
    }

    const data = doc.data();
    const filePath = data.storageUrl.replace(`gs://${BUCKET_NAME}/`, "");

    // Create signed URL for viewing
    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    const [signedUrl] = await storage.bucket(BUCKET_NAME).file(filePath).getSignedUrl(options);

    res.json({
      filename: data.filename,
      signedUrl,
    });
  } catch (err) {
    console.error("Error fetching file:", err);
    res.status(500).json({ error: err.message });
  }
});




app.listen(5000, () => {
  console.log("=================================");
  console.log("Server started and listening on port 5000");
  console.log("=================================");
});