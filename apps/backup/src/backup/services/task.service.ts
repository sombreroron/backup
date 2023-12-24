import { Injectable, Logger } from '@nestjs/common';
import { Task } from '../models/task.model';
import { Job } from '../models/job.model';
import { TaskRepo } from '../repos/task.repo';
import { EventService } from './event.service';
import { Status } from '../enum/status.enum';
import { TaskType } from '../enum/task-type.enum';

@Injectable()
export class TaskService {
    constructor(
        private logger: Logger,
        private eventService: EventService,
        private taskRepo: TaskRepo,
    ) {
    }

    async getTasks(query: { jobId: string, type?: string, status?: Status, parentId?: string }): Promise<Task[]> {
        const tasks = await this.taskRepo.find(query);

        return tasks;
    }

    async createTask(job: Job, type: TaskType, params: Record<string, string>, parentId?: string): Promise<Task> {
        const taskEntity = await this.taskRepo.create({ jobId: job.id, type, params, parentId });

        return taskEntity;
    }

    async updateTask(taskId: string, task: Partial<Task>): Promise<Task> {
        const taskEntity = await this.taskRepo.update(taskId, task);

        return taskEntity;
    }
}
