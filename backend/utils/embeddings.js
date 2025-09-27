const axios = require("axios");

async function generateEmbedding(text) {
  const response = await axios.post("http://localhost:8000/embed", { text });
  return response.data.embedding;
}

module.exports = { generateEmbedding };
