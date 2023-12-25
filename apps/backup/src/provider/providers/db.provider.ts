import { Provider } from './provider';
import { DbClientService } from '@data-access/db';
import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DbProvider extends Provider {
    constructor(private dbClientService: DbClientService) {
        super();
    }

    async getData(siteId: string): Promise<AxiosResponse<string>> {
        return this.dbClientService.exportDb(siteId, { responseType: 'stream' });
    }
}
