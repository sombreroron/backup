import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ChecksumService } from '@util/checksum';
import { Subscribe } from '@util/event-handler';
import { StorageClientService } from '@util/storage-handler';
import config from 'config';
import { chunk, groupBy } from 'lodash';
import { UploadJobCreatedEvent } from '../events/upload-job-created.event';
import { Task } from '../models/task.model';
import { Status } from '../enum/status.enum';
import { EventService } from './event.service';
import { Provider } from '../../provider/providers/provider';
import { Job } from '../models/job.model';
import { TaskService } from './task.service';
import { TaskType } from '../enum/task-type.enum';
import { JobService } from './job.service';
import { UploadPartTaskFinishedEvent } from '../events/upload-part-task-finished.event';
import { UploadTaskFinishedEvent } from '../events/upload-task-finished.event';

const { uploadPartLimit } = config.get('options');

@Injectable()
export class DataService {
    constructor(
        private logger: Logger,
        private moduleRef: ModuleRef,
        private checksumService: ChecksumService,
        private eventService: EventService,
        private jobService: JobService,
        private taskService: TaskService,
        private storageClientService: StorageClientService,
    ) {
    }

    @Subscribe(UploadJobCreatedEvent)
    async handleCreatedJob(event: UploadJobCreatedEvent) {
        try {
            this.logger.log(`Handling created job id: ${event.jobId}`);

            const job = await this.jobService.getJob(event.jobId);
            const tasks = job.tasks.filter(task => task.type === TaskType.Upload && task.status === Status.PENDING);

            tasks.forEach(task => this.uploadFile(job, task));
        } catch (e) {
            this.logger.error(`Failed handling created job with error: ${e.message}`, { event });
        }
    }

    @Subscribe(UploadTaskFinishedEvent)
    async handleFinishedUploadTask(task: UploadPartTaskFinishedEvent) {
        try {
            this.logger.log(`Handling finished upload task id: ${task.id}`);

            const tasks = await this.taskService.getTasks({ jobId: task.jobId, type: TaskType.Upload });
            const tasksByStatus = groupBy(tasks, 'status');

            if (tasksByStatus[Status.FAILED]) {
                throw new Error(tasksByStatus[Status.FAILED].map(task => task.error).join('\n'));
            }

            if (tasksByStatus[Status.PENDING]) {
                return;
            }

            this.logger.log(`Job ${task.jobId} finished successfully`);

            await this.jobService.updateJob(task.jobId, { status: Status.DONE });
        } catch (e) {
            this.logger.error(`Failed handling finished part task with error: ${e.message}`, { task });

            await this.jobService.updateJob(task.jobId, { status: Status.FAILED });
        }
    }

    @Subscribe(UploadPartTaskFinishedEvent)
    async handleFinishedUploadPartTask(task: UploadPartTaskFinishedEvent) {
        try {
            this.logger.log(`Handling finished upload part task id: ${task.id}`);

            const tasks = await this.taskService.getTasks({ jobId: task.jobId, type: TaskType.UploadPart, parentId: task.parentId });
            const tasksByStatus = groupBy(tasks, 'status');

            if (tasksByStatus[Status.FAILED]) {
                throw new Error(tasksByStatus[Status.FAILED].map(task => task.error).join('\n'));
            }

            if (tasksByStatus[Status.PENDING]) {
                return;
            }

            await this.taskService.updateTask(task.id, { status: Status.DONE });

            await this.eventService.sendEvent(UploadTaskFinishedEvent, { id: task.id, jobId: task.jobId });
        } catch (e) {
            this.logger.error(`Failed handling finished upload part task with error: ${e.message}`, { task });

            await this.taskService.updateTask(task.id, { status: Status.FAILED });

            await this.eventService.sendEvent(UploadTaskFinishedEvent, { id: task.id, jobId: task.jobId });
        }
    }

    private async uploadFile(job: Job, task: Task) {
        const provider = this.moduleRef.get<Provider>(task.params.provider, { strict: false });
        const { data } = await provider.getData(job.siteId);
        const chunks = [];

        data.on('data', async part => {
            chunks.push(part);
        });

        data.on('end', async () => {
            this.uploadParts(job, task, chunks);
        });
    }

    private async uploadParts(job: Job, task: Task, parts: Buffer[]) {
        let partNumber = 0;

        for (const chunks of chunk(parts, uploadPartLimit)) {
            await Promise.all(chunks.map(part => this.uploadSinglePart(job, task, part, ++partNumber)));
        }
    }

    private async uploadSinglePart(job: Job, task: Task, data: Buffer, partNumber: number) {
        try {
            const uploadPartTask = await this.taskService.createTask(job, TaskType.UploadPart, { provider: task.params.provider }, task.id);

            const result = await this.storageClientService.uploadPart({ key: task.type, data, partNumber, uploadId: job.id });

            if (result.checksum !== this.checksumService.calculateChecksum(data)) {
                throw new Error('Checksums are not equal');
            }

            await this.taskService.updateTask(uploadPartTask.id, { status: Status.DONE });
        } catch (e) {
            this.logger.error(`Failed uploading single part with error: ${e.message}`, { task, partNumber });

            await this.taskService.updateTask(task.id, { status: Status.FAILED });
        } finally {
            await this.eventService.sendEvent(UploadPartTaskFinishedEvent, { id: task.id, jobId: task.jobId, parentId: task.parentId });
        }
    }
}
