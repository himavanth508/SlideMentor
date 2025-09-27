const express = require("express");
const { connectDB } = require("../config/db.js");
const { bucket } = require("../config/gcs.js");
const { ObjectId } = require("mongodb");

const router = express.Router();

// List files
router.get("/", async (req, res) => {
  const db = await connectDB();
  const filesFromDB  = await db.collection("files").find({}).toArray();
  const files = filesFromDB.map(file => {
      // Use object destructuring to separate _id from the rest of the properties
      const { _id, ...rest } = file;
      // Create a new object with an 'id' property (as a string) and spread the rest
      return { id: _id.toHexString(), ...rest };
    });
  res.json(files);
});

// Get file (signed URL)
router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const file = await db.collection("files").findOne({ _id: new ObjectId(req.params.id) });

    if (!file) return res.status(404).json({ error: "File not found" });

    const fileName = file.storageUrl.split("/").pop();
    const [signedUrl] = await bucket.file(fileName).getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    res.json({ ...file, signedUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
