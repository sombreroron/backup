import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChecksumModule } from '@util/checksum';
import { KafkaEventHandlerModule } from '@util/event-handler';
import { KafkaClientModule } from '@util/kafka-client';
import { ConsoleLoggerModule } from '@util/logger';
import { DB } from '@util/mongodb-client';
import { DbStorageHandlerModule } from '@util/storage-handler';
import config from 'config';
import process from 'process';
import { v4 } from 'uuid';
import { BackupController } from './controllers/backup.controller';
import { JobRepo } from './repos/job.repo';
import { Job, JobSchema } from './models/job.model';
import { Task, TaskSchema } from './models/task.model';
import { TaskRepo } from './repos/task.repo';
import { TaskService } from './services/task.service';
import { JobService } from './services/job.service';
import { EventService } from './services/event.service';
import { ProviderModule } from '../provider/provider.module';
import { DataService } from './services/data.service';

// In order to avoid local rebalances, a unique group id is created for each instance of the service.
function createGroupId() {
    return `backup-group${process.env.NODE_ENV === 'development' ? `-${v4()}` : ''}`;
}

@Module({
    imports: [
        ChecksumModule,
        ConsoleLoggerModule,
        DbStorageHandlerModule,
        DB.forRoot({
            config: config.get('mongodb'),
            logger: console,
        }),
        KafkaClientModule.forRoot({
            logger: console,
            config: {
                brokers: config.get('kafka.brokers'),
                topics: config.get('kafka.topic'),
                groupId: createGroupId(),
                clientId: 'backup',
            },
        }),
        KafkaEventHandlerModule.forRoot({ logger: console }),
        MongooseModule.forFeature([
            { name: Job.name, schema: JobSchema, collection: 'job' },
            { name: Task.name, schema: TaskSchema, collection: 'task' },
        ]),
        ProviderModule,
    ],
    controllers: [BackupController],
    providers: [DataService, EventService, JobRepo, TaskRepo, TaskService, JobService],
})
export class BackupModule {}
