import { Hono } from 'hono';

const app = new Hono();

// Register routes
import route0 from './videomanagement/listvideos';
app.route('/videomanagement/listvideos', route0);
import route1 from './videomanagement/filtervideos';
app.route('/videomanagement/filtervideos', route1);
import route2 from './videomanagement/getvideodetails';
app.route('/videomanagement/getvideodetails', route2);
import route3 from './videomanagement/listvideos-filtervideos';
app.route('/videomanagement/listvideos-filtervideos', route3);
import route4 from './videomanagement/getvideodetails-getairesults';
app.route('/videomanagement/getvideodetails-getairesults', route4);
import route5 from './aiprocessing/createaijob';
app.route('/aiprocessing/createaijob', route5);
import route6 from './aiprocessing/listaijobs';
app.route('/aiprocessing/listaijobs', route6);
import route7 from './aiprocessing/getaijob';
app.route('/aiprocessing/getaijob', route7);
import route8 from './aiprocessing/listaijobsbyvideo';
app.route('/aiprocessing/listaijobsbyvideo', route8);
import route9 from './aiprocessing/listaijobs-getaijob-listaijobsbyvideo';
app.route('/aiprocessing/listaijobs-getaijob-listaijobsbyvideo', route9);
import route10 from './aiprocessing/createaijob-validatevideo-enqueuejob';
app.route('/aiprocessing/createaijob-validatevideo-enqueuejob', route10);
import route11 from './statistics/getdashboardstats';
app.route('/statistics/getdashboardstats', route11);
import route12 from './statistics/aggregatestats';
app.route('/statistics/aggregatestats', route12);
import route13 from './statistics/createstatistic';
app.route('/statistics/createstatistic', route13);
import route14 from './statistics/exportstats';
app.route('/statistics/exportstats', route14);
import route15 from './statistics/getuserstorage';
app.route('/statistics/getuserstorage', route15);
import route16 from './statistics/getdashboardstats-aggregatestats';
app.route('/statistics/getdashboardstats-aggregatestats', route16);
import route17 from './iotmonitoring/listdevices';
app.route('/iotmonitoring/listdevices', route17);
import route18 from './iotmonitoring/refreshdevicestatus';
app.route('/iotmonitoring/refreshdevicestatus', route18);
import route19 from './iotmonitoring/listdevices-refreshdevicestatus';
app.route('/iotmonitoring/listdevices-refreshdevicestatus', route19);

export default app;
