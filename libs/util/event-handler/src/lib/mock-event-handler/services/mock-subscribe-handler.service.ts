import { EventEmitter } from 'events';
import { Injectable } from '@nestjs/common';
import { EventSubscribeHandlerService } from '../../event-handler/services/event-subscribe-handler.service';
import { Event } from '../consts';

@Injectable()
export class MockSubscribeHandlerService implements EventSubscribeHandlerService {
    static TEST_EVENT: Event.TEST;

    eventEmitter: EventEmitter;

    subscribe(event: string, callback): (...args: any[]) => void {
        this.setEventEmitter();

        const listener = async (...args) => {
            try {
                const result = await callback(...args);
                this.eventEmitter.emit(Event.TEST, result);
            } catch (e) {
                this.eventEmitter.emit(Event.TEST, e);
            }
        };

        this.eventEmitter.on(event, listener);

        return listener;
    }

    static forRoot(eventEmitter: EventEmitter): MockSubscribeHandlerService {
        const instance = new MockSubscribeHandlerService();
        instance.setEventEmitter(eventEmitter);

        return instance;
    }

    setEventEmitter(eventEmitter?: EventEmitter): MockSubscribeHandlerService {
        this.eventEmitter = this.eventEmitter || eventEmitter || new EventEmitter();

        return this;
    }

    unsubscribe(event: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.removeListener(event, listener);
    }
}
