<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Upload Slides</h2>
    <form @submit.prevent="uploadFile">
      <input type="file" @change="onFileChange" accept=".pdf,.ppt,.pptx" />
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        Upload
      </button>
    </form>
    <p v-if="message" class="mt-2">{{ message }}</p>

    <h3 class="text-lg font-semibold mt-6 mb-2">Uploaded Files</h3>
    <ul>
      <li
        v-for="file in files"
        :key="file.id"
        class="cursor-pointer text-blue-600 hover:underline"
        @click="openFile(file.id)"
      >
        {{ file.filename }} ({{ new Date(file.uploadedAt.seconds * 1000).toLocaleString() }})
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "uploadPage",
  data() {
    return {
      file: null,
      message: "",
      files: [],
    };
  },
  created() {
    this.fetchFiles();
  },
  methods: {
    onFileChange(e) {
      this.file = e.target.files[0];
    },
    async uploadFile() {
      if (!this.file) {
        this.message = "Please select a file first.";
        return;
      }
      const formData = new FormData();
      formData.append("file", this.file);

      try {
        await axios.post("http://localhost:5000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.message = "File uploaded successfully!";
        this.fetchFiles(); // refresh list
      } catch (err) {
        this.message = "Upload failed.";
        console.error(err);
      }
    },
    async fetchFiles() {
      try {
        const res = await axios.get("http://localhost:5000/files");
        this.files = res.data;
        console.log(this.files);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    },
    openFile(id) {
      this.$router.push(`/file/${id}`);
    },
  },
};
</script>
