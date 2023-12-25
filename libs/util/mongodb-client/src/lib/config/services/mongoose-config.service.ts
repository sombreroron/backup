import { Inject, Injectable } from '@nestjs/common';
import fs from 'fs';
import { Config, SSLOptions } from '../interfaces/config.interface';
import { ConfigFactory } from '../interfaces/config-factory.interface';
import {
    MongooseModuleOptions,
    MongooseOptionsFactory,
} from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory, ConfigFactory {
    private readonly databaseConfiguration;

    private readonly sslOptions;

    constructor(@Inject('Config') private config: Config) {
        const {
            user,
            pass,
            dbName,
            sslCA,
            maxPoolSize,
            connectTimeoutMS,
            replicaSet,
            readPreference,
            ssl = 'false',
            authSource = 'admin',
            useNewUrlParser = true,
            useUnifiedTopology = true,
        }
            = config;

        this.databaseConfiguration = {
            user,
            pass,
            dbName,
            authSource,
            maxPoolSize,
            connectTimeoutMS,
            replicaSet,
            readPreference,
            useNewUrlParser,
            useUnifiedTopology,
        };

        if (ssl.toString() === 'true') {
            this.sslOptions = { sslCA: this.generateSslKey(sslCA), ssl: true, tlsAllowInvalidHostnames: true, sslValidate: true };
        }
    }

    getUri(): string {
        return `mongodb://${this.config.user}:${this.config.pass}@${this.config.host}:${this.config.port}/${this.config.dbName}`;
    }

    getSSLOptions(): SSLOptions {
        return this.sslOptions;
    }

    createMongooseOptions(): MongooseModuleOptions {
        return { uri: this.getUri(), ...this.databaseConfiguration, ...this.sslOptions };
    }

    private generateSslKey(sslCA: string): string {
        if (!sslCA.includes('CERTIFICATE')) {
            return sslCA;
        }

        const pathName = `${process.cwd()}/tmp`;
        const fileName = `${pathName}/ca.pem`;

        fs.mkdirSync(pathName, { recursive: true });
        fs.writeFileSync(fileName, sslCA);

        return fileName;
    }
}
