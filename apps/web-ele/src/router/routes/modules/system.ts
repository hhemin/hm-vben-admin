import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      order: 20,
      title: '系统管理',
    },
    name: 'SystemManagement',
    path: '/system',
    children: [
      {
        name: 'OperationLogList',
        path: 'operation-logs',
        component: () => import('#/views/system/operation-logs/index.vue'),
        meta: {
          icon: 'lucide:scroll-text',
          title: '操作日志',
        },
      },
    ],
  },
];

export default routes;
