
import { RouteObject } from 'react-router-dom';
import HomePage from '../pages/home/page';
import AdminPanel from '../pages/admin/page';
import NotFound from '../pages/NotFound';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/admin',
    element: <AdminPanel />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
