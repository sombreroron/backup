import { Module } from '@nestjs/common';
import { SiteController } from './controllers/site.controller';

@Module({
    imports: [],
    controllers: [SiteController],
})
export class AppModule {}
