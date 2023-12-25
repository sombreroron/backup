import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { EventEmitHandlerService } from '../../event-handler/services/event-emit-handler.service';
import { EventDto } from '../../dtos/event.dto';
import { Event } from '../consts';

@Injectable()
export class MockEmitHandlerService implements EventEmitHandlerService {
    static TEST_EVENT = Event.TEST;

    eventEmitter: EventEmitter;

    emit(event: string, data: EventDto | EventDto[]) {
        this.setEventEmitter();

        return new Promise((resolve, reject) => {
            this.eventEmitter.on(Event.TEST, result => {
                if (result instanceof Error) {
                    return reject(result);
                }

                return resolve(result);
            });
            this.eventEmitter.emit(event, data);
        });
    }

    static forRoot(eventEmitter: EventEmitter): MockEmitHandlerService {
        const instance = new MockEmitHandlerService();
        instance.setEventEmitter(eventEmitter);

        return instance;
    }

    setEventEmitter(eventEmitter?: EventEmitter): MockEmitHandlerService {
        this.eventEmitter = this.eventEmitter || eventEmitter || new EventEmitter();

        return this;
    }
}
