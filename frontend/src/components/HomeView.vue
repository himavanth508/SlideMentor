<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
    <h1 class="text-4xl font-bold mb-6">Welcome to EduSlides AI</h1>
    <p class="text-lg text-gray-700 mb-8">Upload and study your slides with AI-powered assistance</p>

    <router-link
      to="/upload"
      class="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
    >
      Go to Upload Slides
    </router-link>
  </div>
</template>

<script>
export default {
  name: "HomeView",
};
</script>
