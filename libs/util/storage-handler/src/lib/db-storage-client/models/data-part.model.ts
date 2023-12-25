import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ toObject: { virtuals: true, getters: true } })
export class DataPart {
    @Prop({ type: String, required: true })
    key: string;

    @Prop({ type: Buffer, required: true })
    data: Buffer;

    @Prop({ type: Number, required: true })
    partNumber: string;

    @Prop({ type: String, required: true })
    uploadId: string;
}


export type DataPartDocument = DataPart & Document;
export const DataPartSchema = SchemaFactory.createForClass(DataPart);
DataPartSchema.virtual('id').get(function() {
    return this._id.toString();
});

DataPartSchema.pre<DataPart>('save', function() {
    const date = new Date();
});
