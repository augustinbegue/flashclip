import type { VideosController } from '../../../../controllers/videos.controller';
import {
  badRequestResponse,
  notFoundResponse,
  successResponse,
} from '../../../../utils/response.utils';
import {
  isValidDeviceId,
  isValidVideoId,
} from '../../../../utils/validation.utils';

let videosController: VideosController;

export function setVideosController(controller: VideosController) {
  videosController = controller;
}

export default {
  GET: async (
    request: Request,
    { deviceId, videoId }: { deviceId: string; videoId: string }
  ) => {
    try {
      if (!isValidDeviceId(deviceId) || !isValidVideoId(videoId)) {
        return new Response(
          JSON.stringify(
            badRequestResponse(
              `Invalid device ID ${deviceId} or video ID ${videoId}`
            )
          ),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const video = await videosController.getVideoDetails(deviceId, videoId);

      if (!video) {
        return new Response(JSON.stringify(notFoundResponse('Video')), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(successResponse(video)), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error getting video details:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to get video details',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },

  POST: async (
    request: Request,
    { deviceId, videoId }: { deviceId: string; videoId: string }
  ) => {
    try {
      if (!isValidDeviceId(deviceId) || !isValidVideoId(videoId)) {
        return new Response(
          JSON.stringify(
            badRequestResponse(
              `Invalid device ID ${deviceId} or video ID ${videoId}`
            )
          ),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const result = await videosController.initiateProcessing(
        deviceId,
        videoId
      );

      return new Response(JSON.stringify(successResponse(result)), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error initiating processing:', error);

      if (message.includes('not found')) {
        return new Response(JSON.stringify(notFoundResponse('Video')), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to initiate processing',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
