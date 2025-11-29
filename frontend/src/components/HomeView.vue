<template>
  <div class="space-y-8">
    <section class="bg-white rounded-lg shadow p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 class="text-4xl font-extrabold text-gray-900 mb-4">SlideMentor — Study Smarter with AI</h1>
          <p class="text-lg text-gray-600 mb-6">Upload your lecture slides and ask questions in natural language. Get concise, context-aware answers and study faster.</p>

          <div class="flex gap-3">
            <router-link :to="{ name: 'upload' }" class="inline-flex items-center bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 transition">
              Upload Slides
            </router-link>
            <router-link :to="{ name: 'file' , params: { id: recentFiles[0]?.id || '' } }" v-if="recentFiles.length" class="inline-flex items-center border border-gray-200 px-5 py-3 rounded-lg hover:bg-gray-50 transition">
              Open Recent
            </router-link>
          </div>
        </div>

        <div>
          <img src="/favicon.ico" alt="SlideMentor" class="w-48 h-48 mx-auto" />
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Recent Uploads</h2>
        <div v-if="recentFiles.length === 0" class="text-gray-500">No uploads yet — upload a PDF to get started.</div>
        <ul class="space-y-3">
          <li v-for="file in recentFiles" :key="file.id" class="flex items-center justify-between p-3 border rounded hover:shadow-sm">
            <div>
              <div class="font-medium text-gray-800">{{ file.filename }}</div>
              <div class="text-xs text-gray-500">Uploaded: {{ formatDate(file.uploadedAt) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="openFile(file.id)" class="text-sm bg-blue-600 text-white px-3 py-1 rounded">Open</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">How it works</h2>
        <ol class="list-decimal list-inside text-gray-700 space-y-2">
          <li>Upload lecture slides (PDF/PPT)</li>
          <li>System extracts text and builds embeddings</li>
          <li>Open a file and ask the chatbot questions about the content</li>
        </ol>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HomeView",
  data() {
    return {
      recentFiles: []
    };
  },
  created() {
    this.fetchRecent();
  },
  methods: {
    async fetchRecent() {
      try {
        const res = await axios.get('http://localhost:5000/files');
        // Expecting array of files; normalize id field
        this.recentFiles = (res.data || []).slice().reverse().map(f => ({ id: f._id || f.id || f.docId || f.id, filename: f.filename, uploadedAt: f.uploadedAt || f.createdAt }));
      } catch (err) {
        console.error('Failed to fetch files', err);
      }
    },
    formatDate(ts) {
      try { return new Date(ts.seconds ? ts.seconds * 1000 : ts).toLocaleString(); } catch (e) { return ts; }
    },
    openFile(id) {
      if (!id) return;
      this.$router.push({ name: 'file', params: { id } });
    }
  }
};
</script>
