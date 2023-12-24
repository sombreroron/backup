import { EventDto } from '@util/event-handler';

export class UploadTaskFinishedEvent extends EventDto {
    static type = 'UploadTaskFinished';

    id: string;

    jobId: string;
}
