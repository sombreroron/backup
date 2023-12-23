import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Config } from '../config/interfaces/config.interface';
import { ConfigModule } from '../config/config.module';
import { MongooseConfigService } from '../config/services/mongoose-config.service';
import { castArray } from 'lodash';

@Global()
@Module({})
export class DB {
    static forRoot({ config, logger }: { config: Config|Config[], logger: Console|Logger }): DynamicModule {
        const imports = castArray(config).map(config => MongooseModule.forRootAsync({
            connectionName: config.connectionName,
            imports: [ConfigModule.forRoot(config)],
            inject: [MongooseConfigService],
            useFactory: async (mongooseConfigService: MongooseConfigService) =>
                mongooseConfigService.createMongooseOptions(),
        }));

        return {
            module: DB,
            imports,
            providers: [
                MongooseConfigService,
                { provide: 'Logger', useValue: logger },
                { provide: 'Config', useValue: config },
            ],
        };
    }
}
