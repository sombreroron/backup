import { Test, TestingModule } from '@nestjs/testing';
import { KafkaEmitHandlerService } from './kafka-emit-handler.service';

describe('KafkaEmitHandlerService', () => {
    let moduleRef: TestingModule;
    let service;
    let producerMock;
    let kafkaClientMock;
    const topic = 'TestTopic';

    beforeEach(async () => {
        producerMock = { send: jest.fn() };

        kafkaClientMock = { getProducer: () => producerMock };

        moduleRef = await Test.createTestingModule({
            providers: [
                KafkaEmitHandlerService,
                {
                    provide: 'KAFKA_CLIENT',
                    useValue: kafkaClientMock,
                },
                {
                    provide: 'LOGGER',
                    useValue: console,
                },
            ],
        }).compile();

        service = moduleRef.get<KafkaEmitHandlerService>(KafkaEmitHandlerService);
    });

    afterEach(() => {
        moduleRef.close();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('emit', () => {
        it('should emit a single message via producer', async () => {
            const message = { event: 'TestEvent', success: true };
            await service.emit(topic, message);

            expect(producerMock.send).toHaveBeenCalled();

            const [messageArgument] = producerMock.send.mock.calls[0];

            expect(messageArgument.topic).toEqual(topic);
            expect(messageArgument.messages).toEqual([{ value: JSON.stringify(message) }]);
        });

        it('should emit a single message via producer using key', async () => {
            const key = 'myKey';
            const transactionId = '2e2a3591-fad5-498a-8bb5-15836a65c504';
            const message = { event: 'TestEvent', success: true, transactionId };
            await service.emit(topic, message, { key });

            expect(producerMock.send).toHaveBeenCalled();

            const [messageArgument] = producerMock.send.mock.calls[0];

            expect(messageArgument.topic).toEqual(topic);
            expect(messageArgument.messages).toEqual([{ key, value: JSON.stringify(message) }]);
        });

        it('should emit a single message via producer using transactionId without a key when key is not defined', async () => {
            const transactionId = '2e2a3591-fad5-498a-8bb5-15836a65c504';
            const message = { event: 'TestEvent', success: true, transactionId };

            await service.emit(topic, message);

            expect(producerMock.send).toHaveBeenCalled();

            const [messageArgument] = producerMock.send.mock.calls[0];

            expect(messageArgument.topic).toEqual(topic);
            expect(messageArgument.messages).toEqual([{ value: JSON.stringify(message) }]);
            expect(messageArgument.key).toBeUndefined();
        });

        it('should emit an array of messages via producer', async () => {
            const messages = [
                { event: 'TestEvent', success: true },
                { event: 'TestEvent2', success: true },
                { event: 'TestEvent3', success: true },
            ];

            await service.emit(topic, messages);

            expect(producerMock.send).toHaveBeenCalled();

            const [messageArgument] = producerMock.send.mock.calls[0];

            expect(messageArgument.topic).toEqual(topic);
            expect(messageArgument.messages[0].value).toEqual(JSON.stringify(messages[0]));
            expect(messageArgument.messages[1].value).toEqual(JSON.stringify(messages[1]));
            expect(messageArgument.messages[2].value).toEqual(JSON.stringify(messages[2]));
        });

        it('should emit an array of messages via producer using key', async () => {
            const key = 'myKey';
            const transactionId = '2e2a3591-fad5-498a-8bb5-15836a65c504';
            const messages = [
                { event: 'TestEvent', success: true },
                { event: 'TestEvent2', success: true },
                { event: 'TestEvent3', success: true, transactionId },
            ];

            await service.emit(topic, messages, { key: 'myKey' });

            expect(producerMock.send).toHaveBeenCalled();

            const [messageArgument] = producerMock.send.mock.calls[0];

            expect(messageArgument.topic).toEqual(topic);
            expect(messageArgument.messages[0].key).toEqual(key);
            expect(messageArgument.messages[1].key).toEqual(key);
            expect(messageArgument.messages[2].key).toEqual(key);
        });

        it('should emit an array of messages via producer without a key when key is not defined', async () => {
            const transactionId = '2e2a3591-fad5-498a-8bb5-15836a65c504';
            const messages = [
                { event: 'TestEvent', success: true, transactionId },
                { event: 'TestEvent2', success: true, transactionId },
                { event: 'TestEvent3', success: true, transactionId },
            ];

            await service.emit(topic, messages);

            expect(producerMock.send).toHaveBeenCalled();

            const [messageArgument] = producerMock.send.mock.calls[0];

            expect(messageArgument.topic).toEqual(topic);
            expect(messageArgument.messages[0].key).toBeUndefined();
            expect(messageArgument.messages[1].key).toBeUndefined();
            expect(messageArgument.messages[2].key).toBeUndefined();
        });
    });
});
