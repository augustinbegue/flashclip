import type { JobsController } from '../../../controllers/jobs.controller';
import {
  badRequestResponse,
  notFoundResponse,
  successResponse,
} from '../../../utils/response.utils';
import { isValidJobId } from '../../../utils/validation.utils';

let jobsController: JobsController;

export function setJobsController(controller: JobsController) {
  jobsController = controller;
}

export default {
  GET: async (request: Request, { jobId }: { jobId: string }) => {
    try {
      if (!isValidJobId(jobId)) {
        return new Response(
          JSON.stringify(badRequestResponse('Invalid jobId')),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const job = await jobsController.getJobStatus(jobId);

      if (!job) {
        return new Response(JSON.stringify(notFoundResponse('Job')), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(successResponse(job)), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error getting job status:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get job status' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
