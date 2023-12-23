import { Injectable, Logger } from '@nestjs/common';
import { Subscribe } from '@util/event-handler';
import { groupBy } from 'lodash';
import { TaskFinishedEvent } from '../events/task-finished.event';
import { JobRepo } from '../repos/job.repo';
import { TaskRepo } from '../repos/task.repo';
import { Task } from '../models/task.model';
import { Status } from '../enum/status.enum';
import { Job } from '../models/job.model';
import { TaskService } from './task.service';

@Injectable()
export class JobService {
    constructor(
        private logger: Logger,
        private jobRepo: JobRepo,
        private taskService: TaskService,
    ) {}

    @Subscribe(TaskFinishedEvent)
    async handleFinishedTask(task: Task) {
        try {
            this.logger.log(`Handling finished task id: ${task.id}`);

            const tasks = await this.taskService.getTasks(task.jobId);
            const tasksByStatus = groupBy(tasks, 'status');

            if (tasksByStatus[Status.FAILED]) {
                return this.jobRepo.update(task.jobId, { status: Status.FAILED });
            }

            if (tasksByStatus[Status.PENDING]) {
                return;
            }

            return this.jobRepo.update(task.jobId, { status: Status.DONE });
        } catch (e) {
            this.logger.error(`Failed handling finished task with error: ${e.message}`, { task });
        }
    }

    async createJob(job: Job): Promise<Job> {
        const jobEntity = await this.jobRepo.create(job);
        const task = await this.taskService.createTask(jobEntity);

        jobEntity.tasks = [task];

        return jobEntity;
    }

    async getJob(jobId: string): Promise<Job> {
        const job = await this.jobRepo.findOne(jobId);

        job.tasks = await this.taskService.getTasks(jobId);

        return job;
    }
}
