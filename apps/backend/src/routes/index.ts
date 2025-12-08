import { Hono } from 'hono';

const app = new Hono();

// Register routes
import route0 from './videomanagement/listvideos';
app.route('/videomanagement/listvideos', route0);
import route1 from './videomanagement/filtervideos';
app.route('/videomanagement/filtervideos', route1);
import route2 from './videomanagement/getvideodetails';
app.route('/videomanagement/getvideodetails', route2);
import route3 from './aiprocessing/createaijob';
app.route('/aiprocessing/createaijob', route3);
import route4 from './aiprocessing/validatevideo';
app.route('/aiprocessing/validatevideo', route4);
import route5 from './aiprocessing/enqueuejob';
app.route('/aiprocessing/enqueuejob', route5);
import route6 from './aiprocessing/listaijobs';
app.route('/aiprocessing/listaijobs', route6);
import route7 from './aiprocessing/getaijob';
app.route('/aiprocessing/getaijob', route7);
import route8 from './aiprocessing/listaijobsbyvideo';
app.route('/aiprocessing/listaijobsbyvideo', route8);
import route9 from './statistics/getdashboardstats';
app.route('/statistics/getdashboardstats', route9);
import route10 from './statistics/aggregatestats';
app.route('/statistics/aggregatestats', route10);
import route11 from './statistics/createstatistic';
app.route('/statistics/createstatistic', route11);
import route12 from './statistics/exportstats';
app.route('/statistics/exportstats', route12);
import route13 from './statistics/getuserstorage';
app.route('/statistics/getuserstorage', route13);
import route14 from './iotmonitoring/listdevices';
app.route('/iotmonitoring/listdevices', route14);
import route15 from './iotmonitoring/refreshdevicestatus';
app.route('/iotmonitoring/refreshdevicestatus', route15);

export default app;
