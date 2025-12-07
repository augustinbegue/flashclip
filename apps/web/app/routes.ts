import type { RouteConfig } from '@react-router/dev/routes';

import Route0 from './routes/home';import Route1 from './VideoManagement.page';import Route2 from './AIProcessing.page';import Route3 from './AIProcessingCreate.page';import Route4 from './Statistics.page';import Route5 from './StatisticsCreate.page';import Route6 from './IoTMonitoring.page';
export default [
  {
    path: '/',
    async lazy() {
      const { Layout } = await import('./layout');
      return { Component: Layout };
    },
    children: [
            {
                index: true,        Component: Route0,
      },
            {
                path: '/videomanagement',        Component: Route1,
      },
            {
                path: '/aiprocessing',        Component: Route2,
      },
            {
                path: '/aiprocessing/create',        Component: Route3,
      },
            {
                path: '/statistics',        Component: Route4,
      },
            {
                path: '/statistics/create',        Component: Route5,
      },
            {
                path: '/iotmonitoring',        Component: Route6,
      },
          ],
  },
] satisfies RouteConfig;
