import { DynamicModule, Global, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { KafkaClient } from '../interfaces/kafka-client.interface';
import { KafkaSubscribeHandlerService } from './kafka-subscribe-handler.service';

interface MessageMock {
    value: Buffer | string | null;
    key?: Buffer | string | null;
}

const producerSendMockFunc = jest.fn();
let consumerRunMockFunc = jest.fn();

class ProducerMock {
    async send({ topic, messages }: { topic: string, messages: MessageMock[] }, ...rest): Promise<any> {
        producerSendMockFunc({ topic, messages }, ...rest);
    }
}

class ConsumerMock {
    async run({ eachMessage }: { eachMessage({ topic, message }: { topic: string; message: MessageMock }): Promise<void> }, ...rest): Promise<void> {
        consumerRunMockFunc({ eachMessage }, ...rest);
    }
}

@Global()
@Injectable()
class KafkaClientServiceMock implements KafkaClient {
    async getProducer(): Promise<ProducerMock> {
        return new ProducerMock();
    }

    async getConsumer(): Promise<ConsumerMock> {
        return new ConsumerMock();
    }
}

@Global()
@Module({})
class KafkaClientModuleMock {
    static forRoot(): DynamicModule {
        const kafkaClientProvider = {
            provide: 'KAFKA_CLIENT',
            useExisting: KafkaClientServiceMock,
        };

        return {
            module: KafkaClientModuleMock,
            providers: [
                KafkaClientServiceMock,
                kafkaClientProvider,
            ],
            exports: [
                KafkaClientServiceMock,
                kafkaClientProvider,
            ],
        };
    }
}

@Module({})
class KafkaSubscriberHandlerModuleMock {
    static forRoot(): DynamicModule {
        return {
            module: KafkaSubscriberHandlerModuleMock,
            providers: [
                KafkaSubscribeHandlerService,
                {
                    provide: 'LOGGER',
                    useValue: console,
                },
            ],
            exports: [KafkaSubscribeHandlerService],
        };
    }
}

describe('KafkaSubscribeHandlerService', () => {
    let moduleRef: TestingModule;
    let kafkaClientMock;
    let consumerMock;
    let service;

    beforeEach(async () => {
        consumerMock = { run: jest.fn() };

        kafkaClientMock = { getConsumer: () => consumerMock };

        moduleRef = await Test.createTestingModule({
            imports: [
                KafkaClientModuleMock.forRoot(),
                KafkaSubscriberHandlerModuleMock.forRoot(),
            ],
            providers: [
            ],
        }).compile();

        service = moduleRef.get<KafkaSubscribeHandlerService>(KafkaSubscribeHandlerService);
    });

    afterEach(() => {
        moduleRef.close();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should connect to consumer on init', async () => {
            await moduleRef.init();

            expect(consumerRunMockFunc).toHaveBeenCalled();
        });

        it('should connect to consumer on init', async () => {
            jest.spyOn(service.eventEmitter, 'setMaxListeners');

            await moduleRef.init();

            expect(service.eventEmitter.setMaxListeners).toHaveBeenCalledWith(50);
        });
    });

    describe('onModuleDestroy', () => {
        it('should remove all listeners on destroy', async () => {
            jest.spyOn(service.eventEmitter, 'removeAllListeners');

            await moduleRef.close();

            expect(service.eventEmitter.removeAllListeners).toHaveBeenCalled();
        });
    });

    describe('subscribe', () => {
        it('should subscribe to Kafka event', done => {
            const topic = 'TestTopic';
            const event = { status: 'done' };
            const value = JSON.stringify(event);
            let receiveMessage;

            const oldConsumerRunMockFunc = consumerRunMockFunc;
            consumerRunMockFunc = jest.fn().mockImplementation(({ eachMessage }) => {
                receiveMessage = eachMessage;
            });

            moduleRef.init().then(() => {
                service.subscribe(topic, data => {
                    try {
                        expect(data).toEqual(event);

                        done();
                    } catch (e) {
                        done.fail(e);
                    }
                });

                const message = { topic, value };
                receiveMessage({ topic, message, partition: 0 });
            })
                .finally(() => {
                    consumerRunMockFunc = oldConsumerRunMockFunc;
                });
        });
    });

    describe('unsubscribe', () => {
        it('should unsubscribe listener from kafka', done => {
            const topic = 'TestTopic';
            const event = { status: 'done' };
            const value = JSON.stringify(event);
            let receiveMessage;

            const oldConsumerRunMockFunc = consumerRunMockFunc;
            consumerRunMockFunc = jest.fn().mockImplementation(({ eachMessage }) => {
                receiveMessage = eachMessage;
            });

            let listener1;
            const listener1CallMock = jest.fn();
            let listener2;
            const listener2CallMock = jest.fn();
            moduleRef.init().then(() => {
                listener1 = service.subscribe(topic, data => {
                    try {
                        expect(data).toEqual(event);
                        listener1CallMock();
                    } catch (e) {
                        done.fail(e);
                    }
                });
                listener2 = service.subscribe(topic, data => {
                    try {
                        expect(data).toEqual(event);
                        listener2CallMock();
                    } catch (e) {
                        done.fail(e);
                    }
                });

                const message = { topic, value };
                receiveMessage({ topic, message, partition: 0 });
                service.unsubscribe(topic, listener2);
                receiveMessage({ topic, message, partition: 0 });
            })
                .finally(() => {
                    consumerRunMockFunc = oldConsumerRunMockFunc;
                    expect(listener1CallMock).toHaveBeenCalledTimes(2);
                    expect(listener2CallMock).toHaveBeenCalledTimes(1);
                    done();
                });
        });
    });
});
