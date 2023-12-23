import { Injectable, Logger } from '@nestjs/common';
import { EventEmitHandlerService, Subscribe } from '@util/event-handler';
import { TaskCreatedEvent } from '../events/task-created.event';
import { Task } from '../models/task.model';
import { Job } from '../models/job.model';
import { TaskRepo } from '../repos/task.repo';
import { EventService } from './event.service';
import { Status } from '../enum/status.enum';
import { TaskFinishedEvent } from '../events/task-finished.event';

@Injectable()
export class TaskService {
    constructor(
        private logger: Logger,
        private eventService: EventService,
        private taskRepo: TaskRepo,
    ) {
    }

    @Subscribe(TaskCreatedEvent)
    async handleCreatedTask(task: Task) {
        try {
            this.logger.log(`Handling created task id: ${task.id}`);

            await this.taskRepo.update(task.id, { status: Status.DONE });

            await this.eventService.sendEvent(TaskFinishedEvent, { id: task.id, jobId: task.jobId });
        } catch (e) {
            this.logger.error(`Failed handling task with error: ${e.message}`, { task });
        }
    }

    async getTasks(jobId: string): Promise<Task[]> {
        const tasks = await this.taskRepo.find(jobId);

        return tasks;
    }

    async createTask(job: Job): Promise<Task> {
        const taskEntity = await this.taskRepo.create({ jobId: job.id, type: 'hi' });

        await this.eventService.sendEvent(TaskCreatedEvent, { id: taskEntity.id, jobId: job.id });

        return taskEntity;
    }
}
