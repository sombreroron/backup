import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT || 3000;
    const config = new DocumentBuilder()
        .setTitle('Backup API')
        .setDescription('Backup API description')
        .setVersion('1.0')
        .addTag('backup')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);


    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    await app.listen(port);
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}`,
    );
}

bootstrap();
