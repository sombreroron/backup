import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { MongooseOptionsFactory } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Config } from '../interfaces/config.interface';
import { ConfigFactory } from '../interfaces/config-factory.interface';

@Injectable()
export class MongooseInMemoryConfigService implements MongooseOptionsFactory, ConfigFactory, OnModuleDestroy {
    constructor(@Inject('Config') private config: Config) {
    }

    private mongod;

    async onModuleDestroy(): Promise<void> {
        await this.mongod.stop();
    }

    getUri(): string {
        return this.mongod.getUri();
    }

    getSSLOptions() {
        return {};
    }

    createMongooseOptions() {
        return this.getInMemoryConfiguration();
    }

    private async getInMemoryConfiguration() {
        if (this.mongod) {
            return this.mongod;
        }

        this.mongod = await MongoMemoryServer.create({ instance: { dbName: this.config.dbName } });
        const uri = await this.mongod.getUri();

        return { uri };
    }
}
