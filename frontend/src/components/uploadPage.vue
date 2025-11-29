<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-semibold mb-4">Upload Slides</h2>

      <div
        class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition cursor-pointer"
        @drop.prevent="handleDrop"
        @dragover.prevent
        @click="triggerFileInput"
      >
        <input ref="fileInput" type="file" class="hidden" @change="onFileChange" accept=".pdf,.ppt,.pptx" />
        <div class="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h8a1 1 0 011 1v4h-2V4H5v12h5v2H4a1 1 0 01-1-1V3z" clip-rule="evenodd" />
            <path d="M9 7h2v5h3l-4 4-4-4h3V7z" />
          </svg>
          <div class="text-gray-700">Click or drag a file here to upload</div>
          <div class="text-xs text-gray-500 mt-2">Accepted: .pdf, .ppt, .pptx</div>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <button @click="uploadFile" :disabled="!file || uploading" class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60">Upload</button>
        <div v-if="file" class="text-sm text-gray-600">Selected: {{ file.name }} ({{ prettySize(file.size) }})</div>
      </div>

      <div v-if="message" class="mt-3 text-sm text-green-600">{{ message }}</div>
      <div v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">Uploaded Files</h3>
      <div v-if="files.length === 0" class="text-gray-500">No files yet.</div>
      <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <li v-for="file in files" :key="file.id" class="p-4 border rounded flex justify-between items-start">
          <div>
            <div class="font-medium">{{ file.filename }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(file.uploadedAt) }}</div>
          </div>
          <div class="flex flex-col gap-2">
            <button @click="openFile(file.id)" class="px-3 py-1 bg-blue-600 text-white rounded text-sm">Open</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'uploadPage',
  data() {
    return {
      file: null,
      files: [],
      message: '',
      error: '',
      uploading: false
    };
  },
  created() {
    this.fetchFiles();
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleDrop(e) {
      const f = e.dataTransfer.files[0];
      if (f) this.setFile(f);
    },
    onFileChange(e) {
      const f = e.target.files[0];
      if (f) this.setFile(f);
    },
    setFile(f) {
      this.file = f;
      this.message = '';
      this.error = '';
    },
    prettySize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },
    async uploadFile() {
      if (!this.file) { this.error = 'Please select a file.'; return; }
      this.uploading = true;
      this.message = '';
      this.error = '';
      try {
        const formData = new FormData();
        formData.append('file', this.file);
        await axios.post('http://localhost:5000/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        this.message = 'Upload successful!';
        this.file = null;
        this.fetchFiles();
      } catch (err) {
        console.error(err);
        this.error = 'Upload failed. See console for details.';
      } finally {
        this.uploading = false;
      }
    },
    async fetchFiles() {
      try {
        const res = await axios.get('http://localhost:5000/files');
        this.files = (res.data || []).slice().reverse().map(f => ({ id: f._id || f.id || f.docId || f.id, filename: f.filename, uploadedAt: f.uploadedAt || f.createdAt }));
      } catch (err) {
        console.error('Error fetching files:', err);
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
}
</script>
