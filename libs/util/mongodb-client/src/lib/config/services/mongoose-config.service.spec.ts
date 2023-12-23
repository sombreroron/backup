import { Test } from '@nestjs/testing';
import fs from 'fs';
import { MongooseConfigService } from './mongoose-config.service';

jest.mock('fs', () => ({
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
}));

describe('MongooseConfigService', () => {
    let config: any = {};
    let module;
    let service;

    beforeEach(async () => {
        config = {
            host: 'test.com',
            port: 27017,
            user: 'me',
            pass: 'password123',
            dbName: 'test',
        };

        module = await Test.createTestingModule({
            providers: [
                MongooseConfigService,
                { provide: 'Config', useValue: config },
            ],
        });
    });

    describe('createMongooseOptions', () => {
        it('should create Mongoose options', async () => {
            module = service = await module.compile();
            service = module.get(MongooseConfigService);

            const mongooseOptions = service.createMongooseOptions();

            expect(mongooseOptions.uri).toEqual('mongodb://me:password123@test.com:27017/test');
            expect(mongooseOptions.user).toEqual(config.user);
            expect(mongooseOptions.pass).toEqual(config.pass);
            expect(mongooseOptions.useNewUrlParser).toBeTruthy();
            expect(mongooseOptions.useUnifiedTopology).toBeTruthy();
            expect(mongooseOptions.useFindAndModify).toBeFalsy();
        });

        it('should create Mongoose options with admin as authSource by default', async () => {
            module = service = await module.compile();
            service = module.get(MongooseConfigService);

            const mongooseOptions = service.createMongooseOptions();

            expect(mongooseOptions.authSource).toEqual('admin');
        });

        it('should create Mongoose options with authSource', async () => {
            config.authSource = 'test-source';
            module = service = await module.compile();
            service = module.get(MongooseConfigService);

            const mongooseOptions = service.createMongooseOptions();

            expect(mongooseOptions.authSource).toEqual('test-source');
        });

        it('should create Mongoose options with readPreference', async () => {
            config.readPreference = 'secondaryPreferred';
            module = service = await module.compile();
            service = module.get(MongooseConfigService);

            const mongooseOptions = service.createMongooseOptions();

            expect(mongooseOptions.readPreference).toEqual('secondaryPreferred');
        });

        it('should create Mongoose options with replicaSet', async () => {
            config.replicaSet = 'rs0';
            module = service = await module.compile();
            service = module.get(MongooseConfigService);

            const mongooseOptions = service.createMongooseOptions();

            expect(mongooseOptions.replicaSet).toEqual('rs0');
        });

        it('should create Mongoose options without ssl options by default', async () => {
            module = service = await module.compile();
            service = module.get(MongooseConfigService);

            const mongooseOptions = service.createMongooseOptions();

            expect(mongooseOptions.ssl).toBeUndefined();
            expect(mongooseOptions.sslCA).toBeUndefined();
            expect(mongooseOptions.tlsAllowInvalidHostnames).toBeUndefined();
            expect(mongooseOptions.sslValidate).toBeUndefined();
        });

        it('should create Mongoose options with ssl options', async () => {
            config.ssl = true;
            config.sslCA = '1234';

            module = service = await module.compile();
            service = module.get(MongooseConfigService);

            const mongooseOptions = service.createMongooseOptions();

            expect(mongooseOptions.ssl).toEqual(true);
            expect(mongooseOptions.sslCA).toEqual('1234');
            expect(mongooseOptions.tlsAllowInvalidHostnames).toEqual(true);
            expect(mongooseOptions.sslValidate).toEqual(true);
        });
    });

    describe('getUri', () => {
        it('should get Mongoose uri', async () => {
            module = service = await module.compile();
            service = module.get(MongooseConfigService);

            const uri = service.getUri();

            expect(uri).toEqual('mongodb://me:password123@test.com:27017/test');
        });
    });

    describe('getSSLOptions', () => {
        it('should get Mongoose uri', async () => {
            config.ssl = true;
            config.sslCA = '/tmp/ca.pem';

            module = service = await module.compile();
            service = module.get(MongooseConfigService);

            const sslOptions = service.getSSLOptions();

            expect(sslOptions).toEqual({
                sslCA: '/tmp/ca.pem',
                ssl: true,
                tlsAllowInvalidHostnames: true,
                sslValidate: true,
            });
        });

        it('should generate ca file if sslCA is a certificate string', async () => {
            config.ssl = true;
            config.sslCA = '-----BEGIN CERTIFICATE-----\r\n123\r\n-----END CERTIFICATE-----\r\n';

            module = service = await module.compile();
            service = module.get(MongooseConfigService);

            const sslOptions = service.getSSLOptions();

            expect(fs.mkdirSync).toHaveBeenCalledWith(`${process.cwd()}/tmp`, { recursive: true });
            expect(fs.writeFileSync).toHaveBeenCalledWith(`${process.cwd()}/tmp/ca.pem`, config.sslCA);

            expect(sslOptions).toEqual({
                sslCA: `${process.cwd()}/tmp/ca.pem`,
                ssl: true,
                tlsAllowInvalidHostnames: true,
                sslValidate: true,
            });
        });
    });
});
