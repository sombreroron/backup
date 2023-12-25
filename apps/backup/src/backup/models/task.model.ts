import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Status } from '../enum/status.enum';
import { ApiResponseProperty } from '@nestjs/swagger';

@Schema({ toObject: { virtuals: true, getters: true } })
export class Task {
    id?: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'job' })
    @IsNotEmpty()
    jobId?: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'task' })
    @IsOptional()
    parentId?: string;

    @Prop({ type: String, required: true })
    @IsNotEmpty()
    @ApiResponseProperty()
    type: string;

    @Prop({ type: Object, required: true })
    @IsNotEmpty()
    @ApiResponseProperty()
    params: Record<string, string>;

    @Prop({ type: Number, enum: Status, required: true, default: Status.PENDING })
    @IsNotEmpty()
    @ApiResponseProperty({ type: Number })
    status?: Status;

    @Prop({ type: String })
    @IsNotEmpty()
    @ApiResponseProperty()
    error?: string;

    @Prop({ type: Date })
    createdAt?: Date;

    @Prop({ type: Date })
    updatedAt?: Date;

}


export type TaskDocument = Task & Document;
export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.virtual('id').get(function() {
    return this._id.toString();
});

TaskSchema.pre<Task>('save', function() {
    const date = new Date();

    this.createdAt = this.createdAt || date;
    this.updatedAt = date;
});

TaskSchema.pre('findOneAndUpdate', function(next) {
    const workflow = this.getUpdate();

    workflow['updatedAt'] = new Date();

    next();
});

TaskSchema.index({ jobId: 1 });
