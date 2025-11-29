(async () => {
  const { generateEmbedding } = require("./utils/embeddings.js");

  const vec = await generateEmbedding("I am Himavanth");
  console.log(vec);
})();
