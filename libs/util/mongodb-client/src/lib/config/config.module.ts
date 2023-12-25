import { DynamicModule, Module } from '@nestjs/common';
import { MongooseConfigService } from './services/mongoose-config.service';
import { Config } from './interfaces/config.interface';

@Module({})
export class ConfigModule {
    static forRoot(config: Config): DynamicModule {
        return {
            module: ConfigModule,
            providers: [
                MongooseConfigService,
                { provide: 'Config', useValue: config },
            ],
            exports: [MongooseConfigService],
        };
    }
}
