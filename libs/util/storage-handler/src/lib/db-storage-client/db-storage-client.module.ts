import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DB } from '@util/mongodb-client';
import { ChecksumModule } from '@util/checksum';
import config from 'config';
import { StorageClientService } from '../storage-client/services/storage-client.service';
import { DbStorageClientService } from './services/db-storage-client.service';
import { DataPart, DataPartSchema } from './models/data-part.model';

@Module({
    imports: [
        ChecksumModule,
        DB.forRoot({
            config: config.get('mongodb'),
            logger: console,
        }),
        MongooseModule.forFeature([
            { name: DataPart.name, schema: DataPartSchema, collection: 'data-part' },
        ]),
    ],
    providers: [
        {
            provide: StorageClientService,
            useClass: DbStorageClientService,
        },
    ],
    exports: [StorageClientService],
})
export class DbStorageHandlerModule {}
