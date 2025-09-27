import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../components/HomeView.vue'
import uploadPage from '../components/uploadPage.vue'
import FileView from '../components/FileView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/upload',
      name: 'upload',
      component: uploadPage,
    },
    {
      path: '/file/:id',
      name: 'file',
      component: FileView,
      props: true,
    },
  ],
})

export default router
