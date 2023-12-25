import { Injectable, Logger } from '@nestjs/common';
import { JobRepo } from '../repos/job.repo';
import { Job } from '../models/job.model';
import { TaskService } from './task.service';
import { Provider } from '../../provider/enum/provider.enum';
import { TaskType } from '../enum/task-type.enum';
import { UploadJobCreatedEvent } from '../events/upload-job-created.event';
import { EventService } from './event.service';

@Injectable()
export class JobService {
    constructor(
        private eventService: EventService,
        private logger: Logger,
        private jobRepo: JobRepo,
        private taskService: TaskService,
    ) {}

    async createJob(job: Job): Promise<Job> {
        const jobEntity = await this.jobRepo.create(job);

        await Promise.all(Object.values(Provider).map(async provider => {
            const uploadChunkTask = await this.taskService.createTask(jobEntity, TaskType.Upload, { provider });

            jobEntity.tasks.push(uploadChunkTask);
        }));

        await this.eventService.sendEvent(UploadJobCreatedEvent, { jobId: jobEntity.id, siteId: jobEntity.siteId });

        return jobEntity;
    }

    async getJob(jobId: string): Promise<Job> {
        const job = await this.jobRepo.findOne(jobId);

        job.tasks = await this.taskService.getTasks({ jobId });

        return job;
    }

    async updateJob(jobId: string, job: Partial<Job>): Promise<Job> {
        return this.jobRepo.update(jobId, job);
    }
}
