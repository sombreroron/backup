import { Logger, Module } from '@nestjs/common';

@Module({
    providers: [{ provide: Logger, useValue: console }],
    exports: [Logger],
})
export class ConsoleLoggerModule {}
