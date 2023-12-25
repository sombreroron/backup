import { Provider } from './provider';
import { SiteClientService } from '@data-access/site';
import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SiteProvider extends Provider {
    constructor(private siteClientService: SiteClientService) {
        super();
    }

    async getData(siteId: string): Promise<AxiosResponse<string>> {
        return this.siteClientService.exportSite(siteId, { responseType: 'stream' });
    }
}
