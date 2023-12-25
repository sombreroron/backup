import { Injectable, Inject } from '@nestjs/common';
import { castArray } from 'lodash';
import { EventEmitHandlerService } from '../../event-handler/services/event-emit-handler.service';
import { EventDto } from '../../dtos/event.dto';
import { KafkaClient } from '../interfaces/kafka-client.interface';

@Injectable()
export class KafkaEmitHandlerService implements EventEmitHandlerService {
    producer;

    constructor(
        @Inject('KAFKA_CLIENT') private kafkaClient: KafkaClient,
        @Inject('LOGGER') private logger: any,
    ) {}

    async emit(topic: string, data: EventDto | EventDto[], options: { key?: string } = {}): Promise<any[]> {
        try {
            const producer = await this.kafkaClient.getProducer();
            const { key } = options;
            const value = castArray(data);
            const messages = value.map(message => {
                this.logger.debug(`Sending Kafka message. Type: ${typeof data}`, message);

                return { value: JSON.stringify(message), key };
            });

            return producer.send({ topic, messages });
        } catch (error) {
            this.logger.error(error, `Failed sending message to Kafka with error :${error.message}`);

            throw error;
        }
    }
}
