import { Module, DynamicModule, Logger } from '@nestjs/common';
import { KafkaSubscribeHandlerService } from './services/kafka-subscribe-handler.service';
import { KafkaEmitHandlerService } from './services/kafka-emit-handler.service';
import { EventEmitHandlerService } from '../event-handler/services/event-emit-handler.service';
import { EventSubscribeHandlerService } from '../event-handler/services/event-subscribe-handler.service';

interface KafkaEventHandlerModuleConfiguration {
    logger: Console | Logger;
}
@Module({})
export class KafkaEventHandlerModule {
    static forRoot(config: KafkaEventHandlerModuleConfiguration): DynamicModule {
        const { logger } = config;

        return {
            module: KafkaEventHandlerModule,
            providers: [
                { provide: EventEmitHandlerService, useClass: KafkaEmitHandlerService },
                { provide: EventSubscribeHandlerService, useClass: KafkaSubscribeHandlerService },
                { provide: 'LOGGER', useValue: logger },
            ],
            exports: [
                { provide: EventEmitHandlerService, useClass: KafkaEmitHandlerService },
                { provide: EventSubscribeHandlerService, useClass: KafkaSubscribeHandlerService },
            ],
        };
    }
}
