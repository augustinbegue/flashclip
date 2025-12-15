import type { VideosController } from '../../../controllers/videos.controller';
import {
  badRequestResponse,
  successResponse,
} from '../../../utils/response.utils';
import { isValidDeviceId } from '../../../utils/validation.utils';

let videosController: VideosController;

export function setVideosController(controller: VideosController) {
  videosController = controller;
}

export default {
  GET: async (request: Request, { deviceId }: { deviceId: string }) => {
    try {
      if (!isValidDeviceId(deviceId)) {
        return new Response(
          JSON.stringify(badRequestResponse(`Invalid device ID ${deviceId}`)),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const videos = await videosController.listVideos(deviceId);
      return new Response(JSON.stringify(successResponse(videos)), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error listing videos:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to list videos' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
