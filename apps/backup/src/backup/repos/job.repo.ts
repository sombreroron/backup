import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from '../models/job.model';

@Injectable()
export class JobRepo {
    constructor(@InjectModel(Job.name) private jobModel: Model<Job>) {}

    async create(job: Job): Promise<Job> {
        const jobEntity = await this.jobModel.create(job);

        return jobEntity.toObject();
    }

    async findOne(id: string): Promise<Job> {
        const jobEntity = await this.jobModel.findById(id);

        if (jobEntity) {
            return jobEntity.toObject();
        }

        return null;
    }

    async update(id: string, job: Partial<Job>): Promise<Job> {
        const updatedJobEntity = await this.jobModel.findOneAndUpdate({ _id: id }, job, { new: true });

        return updatedJobEntity.toObject();
    }
}
