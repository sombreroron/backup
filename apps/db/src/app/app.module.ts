import { Module } from '@nestjs/common';
import { DataController } from './controllers/data.controller';

@Module({
    imports: [],
    controllers: [DataController],
})
export class AppModule {}
