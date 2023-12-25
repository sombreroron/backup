import { Module } from '@nestjs/common';
import config from 'config';
import { DefaultApi } from './openapi';

const { site: basePath } = config.get('services');

export class SiteClientService extends DefaultApi {}

@Module({
    providers: [
        {
            provide: SiteClientService,
            useFactory: () => new DefaultApi(undefined, basePath),
        },
    ],
    exports: [SiteClientService],
})
export class SiteModule {}
