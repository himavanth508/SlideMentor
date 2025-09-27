const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const uploadRoute = require("./routes/upload.js");
const filesRoute = require("./routes/files.js");
const queryRoute = require("./routes/query.js");

// console.log("Environment Variables:", process.env);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/upload", uploadRoute);
app.use("/files", filesRoute);
app.use("/query", queryRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
