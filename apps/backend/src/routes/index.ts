import { Hono } from 'hono';

const app = new Hono();

// Root route
app.get('/', (c) => {
  return c.json({
    message: 'FlashClip API',
    version: '1.0.0',
    endpoints: {
      videoManagement: [
        '/videomanagement/listvideos',
        '/videomanagement/filtervideos',
        '/videomanagement/getvideodetails',
        '/videomanagement/getairesults',
        '/videomanagement/getaivideo'
      ],
      aiProcessing: [
        '/aiprocessing/createaijob',
        '/aiprocessing/listaijobs',
        '/aiprocessing/getaijob',
        '/aiprocessing/listaijobsbyvideo'
      ],
      statistics: [
        '/statistics/getdashboardstats',
        '/statistics/aggregatestats',
        '/statistics/createstatistic',
        '/statistics/exportstats',
        '/statistics/getuserstorage'
      ],
      iotMonitoring: [
        '/iotmonitoring/listdevices',
        '/iotmonitoring/refreshdevicestatus'
      ]
    }
  });
});

// Register routes
import route0 from './videomanagement/listvideos';
app.route('/videomanagement/listvideos', route0);
import route1 from './videomanagement/filtervideos';
app.route('/videomanagement/filtervideos', route1);
import route2 from './videomanagement/getvideodetails';
app.route('/videomanagement/getvideodetails', route2);
import route2a from './videomanagement/getairesults';
app.route('/videomanagement/getairesults', route2a);
import route2b from './videomanagement/getaivideo';
app.route('/videomanagement/getaivideo', route2b);
import route3 from './aiprocessing/createaijob';
app.route('/aiprocessing/createaijob', route3);
import route4 from './aiprocessing/listaijobs';
app.route('/aiprocessing/listaijobs', route4);
import route5 from './aiprocessing/getaijob';
app.route('/aiprocessing/getaijob', route5);
import route6 from './aiprocessing/listaijobsbyvideo';
app.route('/aiprocessing/listaijobsbyvideo', route6);
import route7 from './statistics/getdashboardstats';
app.route('/statistics/getdashboardstats', route7);
import route8 from './statistics/aggregatestats';
app.route('/statistics/aggregatestats', route8);
import route9 from './statistics/createstatistic';
app.route('/statistics/createstatistic', route9);
import route10 from './statistics/exportstats';
app.route('/statistics/exportstats', route10);
import route11 from './statistics/getuserstorage';
app.route('/statistics/getuserstorage', route11);
import route12 from './iotmonitoring/listdevices';
app.route('/iotmonitoring/listdevices', route12);
import route13 from './iotmonitoring/refreshdevicestatus';
app.route('/iotmonitoring/refreshdevicestatus', route13);

export default app;
