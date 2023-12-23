import { EventDto } from '@util/event-handler';

export class TaskCreatedEvent extends EventDto {
    static type = 'TaskCreated';

    id: string;

    jobId: string;
}
