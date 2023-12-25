import { Inject } from '@nestjs/common';
import { EventDto } from '../dtos/event.dto';
import { EventSubscribeHandlerService } from '../event-handler/services/event-subscribe-handler.service';

export function Subscribe(Event: typeof EventDto) {
    const eventInjector = Inject(EventSubscribeHandlerService);

    return (target, title, descriptor) => {
        eventInjector(target, 'eventSubscriberService');
        const onModuleInit = target.onModuleInit;

        target.onModuleInit = function() {
            this.eventSubscriberService.subscribe(
                Event.type,
                (event: EventDto) => descriptor.value.call(this, event),
            );

            if (onModuleInit) {
                onModuleInit.call(this);
            }
        };
    };
}
