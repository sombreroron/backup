import { Injectable } from '@nestjs/common';
import { EventDto } from '../../dtos/event.dto';

type EventCallback = (event: EventDto) => void;

@Injectable()
export abstract class EventSubscribeHandlerService {
    abstract subscribe(event: string, callback: EventCallback): (...args: any[]) => void;

    abstract unsubscribe(event: string, listener: (...args: any[]) => void): void;
}
