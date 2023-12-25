import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../models/task.model';
import { Status } from '../enum/status.enum';

@Injectable()
export class TaskRepo {
    constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

    async create(task: Task): Promise<Task> {
        const taskEntity = await this.taskModel.create(task);

        return taskEntity.toObject();
    }

    async update(taskId: string, task: Partial<Task>): Promise<Task> {
        const taskEntity = await this.taskModel.findOneAndUpdate({ _id: taskId }, task);

        return taskEntity.toObject();
    }

    async findOne(taskId: string): Promise<Task> {
        const taskEntity = await this.taskModel.findById(taskId);

        return taskEntity.toObject();
    }

    async find(query: { jobId: string, type?: string, status?: Status }): Promise<Task[]> {
        const tasks = await this.taskModel.find(query).exec();

        return tasks.map(task => task.toObject());
    }
}
