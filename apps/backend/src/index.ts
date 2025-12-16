import { Hono } from 'hono';
import router from './routes';
import { mqttService } from './services';

const app = new Hono();

app.route('/api', router);

const start = async () => {
  try {
    // Démarrer le broker MQTT
    console.log('Démarrage du broker MQTT...');
    await mqttService.start();

    console.log('MQTT Broker listening on mqtt://localhost:1883');
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
