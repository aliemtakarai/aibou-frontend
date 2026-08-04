import { createRouter, createWebHistory } from 'vue-router'
import AgentList from '../views/AgentList.vue'
import AgentDashboardLayout from '../views/AgentDashboardLayout.vue'
import AgentPersona from '../views/tabs/AgentPersona.vue'
import AgentKnowledge from '../views/tabs/AgentKnowledge.vue'
import AgentSkills from '../views/tabs/AgentSkills.vue'
import AgentSchedule from '../views/tabs/AgentSchedule.vue'
import AgentChatConsole from '../views/tabs/AgentChatConsole.vue'

const routes = [
  {
    path: '/',
    redirect: '/agents'
  },
  {
    path: '/agents',
    name: 'AgentList',
    component: AgentList
  },
  {
    path: '/agent/:id',
    component: AgentDashboardLayout,
    props: true,
    children: [
      {
        path: '',
        redirect: (to: any) => `/agent/${to.params.id}/persona`
      },
      {
        path: 'persona',
        name: 'AgentPersona',
        component: AgentPersona
      },
      {
        path: 'knowledge',
        name: 'AgentKnowledge',
        component: AgentKnowledge
      },
      {
        path: 'skills',
        name: 'AgentSkills',
        component: AgentSkills
      },
      {
        path: 'schedule',
        name: 'AgentSchedule',
        component: AgentSchedule
      },
      {
        path: 'chat',
        name: 'AgentChatConsole',
        component: AgentChatConsole
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active'
})

export default router
