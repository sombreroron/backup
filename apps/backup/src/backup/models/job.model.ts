import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsNotEmpty } from 'class-validator';
import { Status } from '../enum/status.enum';
import { Task } from './task.model';
import { ApiResponseProperty } from '@nestjs/swagger';

@Schema({ toObject: { virtuals: true, getters: true } })
export class Job {
    id?: string;

    @Prop({ type: String, required: true })
    @IsNotEmpty()
    @ApiResponseProperty()
    userId: string;

    @Prop({ type: String, required: true })
    @IsNotEmpty()
    @ApiResponseProperty()
    siteId: string;

    @Prop({ type: Number, enum: Status, required: true, default: Status.PENDING })
    @IsNotEmpty()
    @ApiResponseProperty({ type: Number })
    status?: Status;

    @Prop({ type: Date })
    createdAt?: Date;

    @Prop({ type: Date })
    updatedAt?: Date;

    @ApiResponseProperty({ type: [Task] })
    tasks?: Task[];
}

export type JobDocument = Job & Document;
export const JobSchema = SchemaFactory.createForClass(Job);
JobSchema.virtual('id').get(function() {
    return this._id.toString();
});

JobSchema.virtual('tasks').get(function() {
    return [];
});

JobSchema.pre<Job>('save', function() {
    const date = new Date();

    this.createdAt = this.createdAt || date;
    this.updatedAt = date;
});

JobSchema.pre('findOneAndUpdate', function(next) {
    const workflow = this.getUpdate();

    workflow['updatedAt'] = new Date();

    next();
});

JobSchema.index({ userId: 1, siteId: 1 });
