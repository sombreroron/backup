import { EventDto } from '@util/event-handler';

export class UploadJobCreatedEvent extends EventDto {
    static type = 'UploadJobCreated';

    jobId: string;

    siteId: string;
}
