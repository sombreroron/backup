import { Module } from '@nestjs/common';
import { AbstractStorageClientService } from '../storage-client/services/abstract-storage-client.service';
import { FsStorageClientService } from './services/fs-storage-client.service';

@Module({
    providers: [
        {
            provide: AbstractStorageClientService,
            useClass: FsStorageClientService,
        },
    ],
    exports: [],
})
export class FsStorageHandlerModule {}
