import { Injectable } from '@nestjs/common';
import { EventDto } from '../../dtos/event.dto';

@Injectable()
export abstract class EventEmitHandlerService {
    abstract emit(event: string, data: Record<string, any> | EventDto[], options?: Record<string, any>): void;
}
