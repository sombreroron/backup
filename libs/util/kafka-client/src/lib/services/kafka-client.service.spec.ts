import { Kafka } from 'kafkajs';
import { Test, TestingModule } from '@nestjs/testing';
import { KafkaClientService } from './kafka-client.service';

describe('KafkaClientService', () => {
    type Callback = (result?: string) => void;
    let moduleRef: TestingModule;
    let service: KafkaClientService;
    let producer;
    let consumer;
    const topics = ['test', 'test2'];
    const brokers = ['localhost:9092'];

    beforeEach(async () => {
        jest.clearAllMocks();

        const kafka = new Kafka({ clientId: 'test', brokers });
        producer = kafka.producer();
        consumer = kafka.consumer({ groupId: 'test-group' });

        jest.spyOn(kafka, 'producer').mockReturnValue(producer);
        jest.spyOn(kafka, 'consumer').mockReturnValue(consumer);
        jest.spyOn(producer, 'connect').mockResolvedValue(producer);
        jest.spyOn(producer, 'disconnect');
        jest.spyOn(consumer, 'connect').mockResolvedValue(producer);
        jest.spyOn(consumer, 'subscribe').mockResolvedValue({});
        jest.spyOn(consumer, 'disconnect');

        moduleRef = await Test.createTestingModule({
            providers: [
                KafkaClientService,
                { provide: Kafka, useValue: kafka },
                { provide: 'CONFIG', useValue: { topics } },
                { provide: 'LOGGER', useFactory: () => console },
            ],
        }).compile();

        service = moduleRef.get<KafkaClientService>(KafkaClientService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getProducer', () => {
        it('should connect to producer', async () => {
            const result = await service.getProducer();

            expect(producer.connect).toHaveBeenCalled();

            expect(result).toEqual(producer);
        });

        it('should connect to producer once', async () => {
            await service.getProducer();
            await service.getProducer();
            const result = await service.getProducer();

            expect(producer.connect).toHaveBeenCalled();

            expect(result).toEqual(producer);
        });
    });

    describe('getConsumer', () => {
        beforeEach(async () => {
            jest.spyOn(service, 'getTopics').mockReturnValue(topics);
        });

        it('should connect to consumer', async () => {
            const result = await service.getConsumer();

            expect(consumer.connect).toHaveBeenCalled();

            expect(result).toEqual(consumer);
        });

        it('should only connect to consumer once', async () => {
            await service.getConsumer();
            await service.getConsumer();
            const result = await service.getConsumer();

            expect(consumer.connect).toHaveBeenCalledTimes(1);

            expect(result).toEqual(consumer);
        });

        it('should subscribe to topics when connection is ready', async () => {
            await service.getConsumer();

            expect(consumer.subscribe).toHaveBeenCalledTimes(2);
            expect(consumer.subscribe).toHaveBeenCalledWith({ topic: 'test', fromBeginning: false });
            expect(consumer.subscribe).toHaveBeenCalledWith({ topic: 'test2', fromBeginning: false });
        });
    });

    describe('getTopics', () => {
        async function initServiceWithConfig(config: any): Promise<KafkaClientService> {
            const kafka = new Kafka({ clientId: 'test', brokers });
            producer = kafka.producer();
            consumer = kafka.consumer({ groupId: 'test-group' });

            const moduleRef = await Test.createTestingModule({
                providers: [
                    KafkaClientService,
                    { provide: Kafka, useValue: kafka },
                    { provide: 'CONFIG', useValue: config },
                    { provide: 'LOGGER', useFactory: () => console },
                ],
            }).compile();

            const service = moduleRef.get<KafkaClientService>(KafkaClientService);
            return service;
        }

        it('can handle an array of string values under "topics"', async () => {
            const topics = ['topic1', 'topic2'];
            const expectedTopics = ['topic1', 'topic2'];

            const service = await initServiceWithConfig({ topics });

            const result = service.getTopics();
            expect(result).toStrictEqual(expectedTopics);
        });

        it('can handle a string value under "topics"', async () => {
            const topics = 'topic1';
            const expectedTopics = ['topic1'];

            const service = await initServiceWithConfig({ topics });

            const result = service.getTopics();
            expect(result).toStrictEqual(expectedTopics);
        });

        it('can handle comma-delimited string value under "topics"', async () => {
            const topics = 'topic1,topic2';
            const expectedTopics = ['topic1', 'topic2'];

            const service = await initServiceWithConfig({ topics });

            const result = service.getTopics();
            expect(result).toStrictEqual(expectedTopics);
        });

        it('can handle the field "topic"', async () => {
            const topic = 'topic1';
            const expectedTopics = ['topic1'];

            const service = await initServiceWithConfig({ topic });

            const result = service.getTopics();
            expect(result).toStrictEqual(expectedTopics);
        });

        it('gives higher priority to "topics" over "topic" if both exist', async () => {
            const topic = 'topic1';
            const topics = 'topic2';
            const expectedTopics = ['topic2'];

            const service = await initServiceWithConfig({ topic, topics });

            const result = service.getTopics();
            expect(result).toStrictEqual(expectedTopics);
        });
    });

    describe('onModuleDestroy', () => {
        it('should disconnect from producer', async () => {
            await service.getProducer();
            await moduleRef.close();

            expect(producer.disconnect).toHaveBeenCalled();
        });

        it('should not disconnect from producer when not connected', async () => {
            await moduleRef.close();

            expect(producer.disconnect).not.toHaveBeenCalled();
        });

        it('should disconnect from consumer', async () => {
            await service.getConsumer();
            await moduleRef.close();

            expect(consumer.disconnect).toHaveBeenCalled();
        });

        it('should not disconnect from consumer when not connected', async () => {
            await moduleRef.close();

            expect(consumer.disconnect).not.toHaveBeenCalled();
        });
    });
});
