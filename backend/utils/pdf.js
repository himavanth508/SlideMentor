const fs = require("fs");
const pdfParse = require("pdf-parse");

async function extractTextFromPDF(localPath) {
  const dataBuffer = fs.readFileSync(localPath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

module.exports = { extractTextFromPDF };
