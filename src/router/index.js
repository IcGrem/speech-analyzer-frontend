import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Импортируем middleware
import { authMiddleware } from '@/middleware/auth.js'
import { loggerMiddleware } from '@/middleware/logger.js'
import { loadingMiddleware } from '@/middleware/loading.js'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { 
          transition: 'slide-left',
          requiresAuth: true // Требует авторизации
        }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { 
          transition: 'slide-left',
          requiresAuth: true
        }
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: { 
          transition: 'slide-left',
          requiresAuth: true
        }
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { 
          transition: 'slide-left',
          requiresAuth: true
        }
      },
      {
        path: '/bar',
        name: 'Bar',
        component: () => import('@/views/BarChart.vue'),
        meta: { 
          transition: 'slide-left',
          requiresAuth: true
        }
      },
      {
        path: '/line',
        name: 'Line',
        component: () => import('@/views/LineChart.vue'),
        meta: { 
          transition: 'slide-left',
          requiresAuth: true
        }
      },
      {
        path: '/pie',
        name: 'Pie',
        component: () => import('@/views/PieChart.vue'),
        meta: { 
          transition: 'slide-left',
          requiresAuth: true
        }
      },
      {
        path: '/doughnut',
        name: 'Doughnut',
        component: () => import('@/views/DoughnutChart.vue'),
        meta: { 
          transition: 'slide-left',
          requiresAuth: true
        }
      },
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/Login.vue'),
        meta: { 
          transition: 'slide-right',
          guestOnly: true // Только для неавторизованных
        }
      }
    ]
  },
  // 404 страница
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { 
      transition: 'fade'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Подключаем middleware к роутеру
router.beforeEach(authMiddleware)
router.beforeEach(loggerMiddleware)
router.beforeEach(loadingMiddleware)

export default router