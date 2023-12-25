import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { TestSchema } from '../test/schema/test.entity';
import { DB } from './db.module';
import { MongooseConfigService } from '../config/services/mongoose-config.service';
import { MongooseInMemoryConfigService } from '../config/services/mongoose-in-memory-config.service';

const config = {
    host: '',
    port: '',
    user: '',
    pass: '',
    dbName: 'test',
    collections: ['test'],
    connectionOptions: {},
};

describe('DB Module', () => {
    describe('single connection', () => {
        let model;

        beforeEach(async () => {
            const mongooseInMemoryConfigService = new MongooseInMemoryConfigService(config);
            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    DB.forRoot({
                        config,
                        logger: console,
                    }),
                    MongooseModule.forFeature([
                        { name: Test.name, schema: TestSchema, collection: 'test' },
                    ]),
                ],
            })
                .overrideProvider(MongooseConfigService)
                .useValue(mongooseInMemoryConfigService)
                .compile();

            model = module.get(getModelToken(Test.name));
        });

        it('should create entities', async () => {
            const createTestResult = await model.create({});

            expect(createTestResult.isWorking).toEqual(true);

            const getTestResult = await model.findOne({ _id: createTestResult.id });

            expect(getTestResult.isWorking).toEqual(true);
        });
    });

    describe('multiple connections', () => {
        let model;
        let model2;

        beforeEach(async () => {
            const mongooseInMemoryConfigService = new MongooseInMemoryConfigService(config);
            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    DB.forRoot({
                        config: [{ ...config, connectionName: 'test' }, { ...config, connectionName: 'test2' }],
                        logger: console,
                    }),
                    MongooseModule.forFeature([
                        { name: Test.name, schema: TestSchema, collection: 'test' },
                    ], 'test'),
                    MongooseModule.forFeature([
                        { name: Test.name, schema: TestSchema, collection: 'test' },
                    ], 'test2'),
                ],
            })
                .overrideProvider(MongooseConfigService)
                .useValue(mongooseInMemoryConfigService)
                .compile();

            model = module.get(getModelToken(Test.name, 'test'));
            model2 = module.get(getModelToken(Test.name, 'test2'));
        });

        it('should create entities', async () => {
            const createTestResult = await model.create({ name: 'test' });
            const createTestResult2 = await model2.create({ name: 'test2' });

            expect(createTestResult.isWorking).toEqual(true);
            expect(createTestResult2.isWorking).toEqual(true);

            const getTestResult = await model.find();
            const getTestResult2 = await model2.find();

            expect(getTestResult).toHaveLength(1);
            expect(getTestResult[0].name).toEqual('test');

            expect(getTestResult2).toHaveLength(1);
            expect(getTestResult2[0].name).toEqual('test2');
        });
    });
});
