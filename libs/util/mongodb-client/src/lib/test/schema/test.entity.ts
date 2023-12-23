import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Test {
    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

    @Prop({ type: Boolean, default: true })
    isWorking: boolean;

    @Prop({ type: String })
    name?: string;
}

export type TestDocument = Test & Document;
export const TestSchema = SchemaFactory.createForClass<Test>(Test);
