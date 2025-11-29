<template>
  <div class="flex h-screen relative">
    <!-- Main PDF View -->
    <div class="flex-1 p-6 overflow-hidden">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Viewing: {{ filename }}</h2>
        <button
          @click="isChatOpen = !isChatOpen"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span v-if="isChatOpen">Close</span>
          <span v-else>
            <span class="text-xl leading-none">⚡</span>
            <span class="font-medium">AI</span>
          </span>
        </button>

      </div>
      <iframe
        v-if="pdfUrl"
        :src="pdfUrl"
        class="w-full h-[calc(100vh-6rem)] border rounded-lg"
      ></iframe>
      <p v-else class="text-gray-600">Loading PDF...</p>
    </div>

    <!-- Chat Interface -->
    <div
      v-if="isChatOpen"
      class="w-96 h-full border-l bg-white shadow-lg flex-shrink-0 flex flex-col transition-all duration-300"
    >
      <!-- Chat Header -->
      <div class="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 class="text-lg font-semibold">Ask about this PDF</h3>
          <button
            @click="isChatOpen = false"
            class="text-gray-500 hover:text-gray-700 rounded-md p-1"
            aria-label="Close chat"
          >
            &times;
          </button>
      </div>

      <!-- Chat Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="chatMessages">
        <div v-for="(message, index) in messages" :key="index" class="flex flex-col">
          <!-- User Message -->
          <div v-if="message.type === 'user'" class="flex justify-end mb-2">
            <div class="bg-blue-600 text-white rounded-lg py-2 px-4 max-w-[80%]">
              {{ message.text }}
            </div>
          </div>
          <!-- Assistant Message -->
          <div v-else class="flex justify-start mb-2">
            <div class="bg-gray-100 rounded-lg py-2 px-4 max-w-[80%]">
              {{ message.text }}
            </div>
          </div>
        </div>
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-gray-100 rounded-lg py-2 px-4">
            Thinking...
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t bg-white">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="userInput"
            type="text"
            placeholder="Ask a question about the PDF..."
            class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isLoading"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            :disabled="!userInput.trim() || isLoading"
          >
            Send
          </button>
        </form>
      </div>
    </div>
    <!-- Floating open-chat button (visible when chat is closed) -->
    <button
      v-if="!isChatOpen"
      @click="isChatOpen = true"
      class="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none z-50"
      aria-label="Open chat"
      >
        <span class="text-xl leading-none">⚡</span>
        <span class="font-medium">AI</span>
    </button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "FileView",
  data() {
    return {
      pdfUrl: null,
      filename: "",
      isChatOpen: false,
      userInput: "",
      messages: [],
      isLoading: false
    };
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          if (this.$refs.chatMessages) {
            this.$refs.chatMessages.scrollTop = this.$refs.chatMessages.scrollHeight;
          }
        });
      },
      deep: true
    }
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;

      const question = this.userInput.trim();
      this.messages.push({ type: 'user', text: question });
      this.userInput = "";
      this.isLoading = true;

      try {
        const response = await axios.post('http://localhost:5000/query', {
          question,
          fileId: this.$route.params.id
        });

        this.messages.push({ type: 'assistant', text: response.data.answer });
      } catch (error) {
        console.error('Error sending message:', error);
        this.messages.push({ 
          type: 'assistant', 
          text: 'Sorry, I encountered an error while processing your question. Please try again.' 
        });
      } finally {
        this.isLoading = false;
      }
    }
  },
  async created() {
    const id = this.$route.params.id;
    try {
      const res = await axios.get(`http://localhost:5000/files/${id}`);
      this.pdfUrl = res.data.signedUrl;
      this.filename = res.data.filename;
    } catch (err) {
      console.error("Error loading file:", err);
    }
  },
};
</script>
