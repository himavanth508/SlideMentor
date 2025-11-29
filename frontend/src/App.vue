<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <div class="text-2xl font-bold text-blue-600">SlideMentor</div>
            <span class="text-sm text-gray-500">AI study assistant for your slides</span>
          </div>
          <nav class="flex items-center gap-4">
            <router-link to="/" class="text-gray-600 hover:text-blue-600">Home</router-link>
            <router-link :to="{ name: 'upload' }" class="text-gray-600 hover:text-blue-600">Upload</router-link>
          </nav>
        </div>
      </div>
    </header>

    <main :class="$route && $route.name === 'file' ? 'w-full px-4 py-8' : 'max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'">
      <router-view />
    </main>

    <footer class="mt-12 border-t">
      <div class="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-500">
        © {{ new Date().getFullYear() }} SlideMentor — Built with care for learning
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* small helper for iframe fullscreen behavior */
.pdf-iframe { border: 1px solid #e5e7eb; border-radius: 0.5rem; }
</style>
