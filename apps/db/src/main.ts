import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT || 3002;
    const config = new DocumentBuilder()
        .setTitle('DB API')
        .setDescription('DB API description')
        .setVersion('1.0')
        .addTag('db')
        .build();
    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document);

    await app.listen(port);
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}`,
    );
}

bootstrap();
