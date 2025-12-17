import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import router from './routes';
import { mqttService } from './services';

const app = new Hono();

app.use(logger());
app.use(cors({
  origin: '*',
  allowMethods: ['*'],
  allowHeaders: ['*'],
}));

app.route('/api', router);

const start = async () => {
  try {
    // Démarrer le broker MQTT
    console.log('Démarrage du broker MQTT...');
    await mqttService.start();

    console.log('MQTT Broker listening on mqtt://0.0.0.0:1883');
  } catch (err) {
    // Arrêter le broker MQTT en cas d'erreur
    try {
      await mqttService.stop();
    } catch (mqttErr) {
      console.error("Erreur lors de l'arrêt du broker MQTT:", mqttErr);
    }

    process.exit(1);
  }
};

start();

export default app;
