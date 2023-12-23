import { EventEmitter } from 'events';
import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventSubscribeHandlerService } from '../../event-handler/services/event-subscribe-handler.service';
import { KafkaClient } from '../interfaces/kafka-client.interface';

@Injectable()
export class KafkaSubscribeHandlerService implements EventSubscribeHandlerService, OnModuleInit, OnModuleDestroy {

    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(
        @Inject('KAFKA_CLIENT') private kafkaClient: KafkaClient,
        @Inject('LOGGER') private logger: any,
    ) {}

    onModuleInit(): void {
        this.eventEmitter.setMaxListeners(50);
        this.subscribeToConsumer().catch(error => {
            this.logger.error(error, `Failed connecting to Kafka consumer with error: ${error.message}`);
        });
    }

    onModuleDestroy(): any {
        this.eventEmitter.removeAllListeners();
    }

    private async subscribeToConsumer() {
        const consumer = await this.kafkaClient.getConsumer();

        consumer.run({
            eachMessage: async ({ message }) => {
                try {
                    const data = JSON.parse(message.value.toString());
                    this.logger.debug(`Kafka message received. Type: ${data.type}`, data);

                    const callback = (error: Error) => {
                        if (error) {
                            this.logger.error(error, message, `Failed sending Kafka event with error :${error.message}`);
                        }
                    };
                    this.eventEmitter.emit(data.type, data, callback);
                } catch (error) {
                    this.logger.error(error, `Failed retrieving message from Kafka with error :${error.message}`);
                }
            },
        });
        this.logger.info('Kafka Event Subscriber - successfully connected to kafka.');
    }

    subscribe(type: string, callback): (...args: any[]) => void {
        this.eventEmitter.on(type, callback);
        return callback;
    }

    unsubscribe(topic: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.removeListener(topic, listener);
    }
}
