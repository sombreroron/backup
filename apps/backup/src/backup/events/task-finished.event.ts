import { EventDto } from '@util/event-handler';

export class TaskFinishedEvent extends EventDto {
    static type = 'TaskFinished';

    id: string;

    jobId: string;
}
