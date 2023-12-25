import { EventDto } from '@util/event-handler';

export class UploadPartTaskFinishedEvent extends EventDto {
    static type = 'UploadPartTaskFinished';

    id: string;

    jobId: string;

    parentId: string;
}
