import { AxiosResponse } from 'axios';

export abstract class Provider {
    abstract getData(siteId: string): Promise<AxiosResponse<any>>;
}
