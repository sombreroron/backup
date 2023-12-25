import { Injectable } from '@nestjs/common';
import config from 'config';
import { EventDto, EventEmitHandlerService } from '@util/event-handler';

@Injectable()
export class EventService {
    constructor(
        private eventEmitHandlerService: EventEmitHandlerService,
    ) {}

    async sendEvent(eventType: typeof EventDto, event: Record<string, any>): Promise<void> {
        await this.eventEmitHandlerService.emit(config.get('kafka.topic'), {
            type: eventType.type,
            ...event,
        });
    }
}
