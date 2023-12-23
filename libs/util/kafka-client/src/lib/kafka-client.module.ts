import { DynamicModule, Module, Global } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KafkaClientService } from './services/kafka-client.service';

@Global()
@Module({})
export class KafkaClientModule {
    static forRoot({ config, logger }): DynamicModule {
        const { clientId, brokers, connectionTimeout = 1000, requestTimeout = 30000 } = config;
        const kafka = new Kafka({
            clientId,
            connectionTimeout,
            requestTimeout,
            brokers: brokers && brokers.split(','),
        });

        const kafkaClientProvider = {
            provide: 'KAFKA_CLIENT',
            useExisting: KafkaClientService,
        };

        return {
            module: KafkaClientModule,
            providers: [
                KafkaClientService,
                kafkaClientProvider,
                { provide: Kafka, useValue: kafka },
                { provide: 'CONFIG', useValue: config },
                { provide: 'LOGGER', useValue: logger },
            ],
            exports: [KafkaClientService, kafkaClientProvider],
        };
    }
}
