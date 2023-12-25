import { Module } from '@nestjs/common';
import config from 'config';
import { DefaultApi } from './openapi';

const { db: basePath } = config.get('services');

export class DbClientService extends DefaultApi {}

@Module({
    providers: [
        {
            provide: DbClientService,
            useFactory: () => new DefaultApi(undefined, basePath),
        },
    ],
    exports: [DbClientService],
})
export class DbModule {}
