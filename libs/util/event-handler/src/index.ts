import { EventError, EventDto } from './lib/dtos/event.dto';
import { Subscribe } from './lib/decorators/subscribe.decorator';

// Abstract Event Handler
import { EventEmitHandlerService } from './lib/event-handler/services/event-emit-handler.service';
import { EventSubscribeHandlerService } from './lib/event-handler/services/event-subscribe-handler.service';

// Mock Event Handler
import { MockEmitHandlerService } from './lib/mock-event-handler/services/mock-emit-handler.service';
import { MockSubscribeHandlerService } from './lib/mock-event-handler/services/mock-subscribe-handler.service';

// Kafka Event Handler
import { KafkaEventHandlerModule } from './lib/kafka-event-handler/kafka-event-handler.module';
import { KafkaEmitHandlerService } from './lib/kafka-event-handler/services/kafka-emit-handler.service';
import { KafkaSubscribeHandlerService } from './lib/kafka-event-handler/services/kafka-subscribe-handler.service';
import { KafkaClient } from './lib/kafka-event-handler/interfaces/kafka-client.interface';


export {
    EventError,
    EventDto,
    Subscribe,
    EventEmitHandlerService,
    EventSubscribeHandlerService,
    MockEmitHandlerService,
    MockSubscribeHandlerService,
    KafkaEventHandlerModule,
    KafkaEmitHandlerService,
    KafkaSubscribeHandlerService,
    KafkaClient,
};
