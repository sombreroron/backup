import { Injectable, Inject, OnModuleDestroy, Global } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Global()
@Injectable()
export class KafkaClientService implements OnModuleDestroy {
    private producer: Producer;

    private producerConnected: Promise<void>;

    private consumer: Consumer;

    private consumerConnected: Promise<void | any[]>;

    private lastHeartbeat: number;

    private sessionTimeout: number;

    private heartbeatInterval: number;

    constructor(
        private kafka: Kafka,
        @Inject('CONFIG') private config,
        @Inject('LOGGER') private logger,
    ) {
    }

    async onModuleDestroy() {
        this.logger.debug('KafkaClient: onModuleDestroy initiated');

        if (this.producer) {
            this.logger.debug('KafkaClient: Disconnecting from producer');
            await this.producer.disconnect();
        }

        if (this.consumer) {
            this.logger.debug('KafkaClient: Disconnecting from consumer');
            await this.consumer.disconnect();
        }
    }

    async getProducer(): Promise<Producer> {
        if (!this.producer) {
            this.producer = this.kafka.producer();

            this.producerConnected = this.producer.connect();
        }

        await this.producerConnected;
        return this.producer;
    }

    async getConsumer(logHeartbeat = false): Promise<Consumer> {
        const topics = this.getTopics();

        if (!this.consumer) {
            const { maxWaitTimeInMs = 1000, sessionTimeout = 30000, heartbeatInterval = 3000, fromBeginning = false } = this.config;
            this.sessionTimeout = parseInt(sessionTimeout);
            this.heartbeatInterval = parseInt(heartbeatInterval);

            this.consumer = this.kafka.consumer({
                groupId: this.config.groupId,
                maxWaitTimeInMs: parseInt(maxWaitTimeInMs),
                heartbeatInterval: this.heartbeatInterval,
                sessionTimeout: this.sessionTimeout,
            });

            const { HEARTBEAT } = this.consumer.events;

            this.consumer.on(HEARTBEAT, ({ timestamp }) => {
                if (logHeartbeat) {
                    this.logger.debug('KafkaClient: heartbeat received', { timestamp });
                }
                this.lastHeartbeat = timestamp;
            });
            this.consumerConnected = this.consumer.connect().then(() => Promise.all(topics.map(topic => this.consumer.subscribe({ topic, fromBeginning }))));
        }

        await this.consumerConnected;
        return this.consumer;
    }

    getTopics(): string[] {
        const topicsRaw = this.config.topics || this.config.topic;

        if (typeof topicsRaw === 'string') {
            return topicsRaw.split(',');
        } else if (topicsRaw instanceof Array) {
            return topicsRaw.filter(t => typeof t === 'string');
        }

        throw new Error('Kafka Client Service: Illegal "topic(s)" value in configuration');
    }
}
