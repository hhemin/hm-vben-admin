import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: 10,
      title: '用户管理',
    },
    name: 'UserManagement',
    path: '/user-management',
    children: [
      {
        name: 'UserList',
        path: 'users',
        component: () => import('#/views/user/users/index.vue'),
        meta: {
          icon: 'lucide:user',
          title: '用户管理',
        },
      },
      {
        name: 'AdminList',
        path: 'admins',
        component: () => import('#/views/user/admins/index.vue'),
        meta: {
          icon: 'lucide:shield-check',
          title: '人员管理',
        },
      },
    ],
  },
];

export default routes;
