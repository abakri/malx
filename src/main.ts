import * as cookieParser from 'cookie-parser';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser('MALX_COOKIE_SECRET'));
  
  // documentation
  const config = new DocumentBuilder()
    .setTitle('malX')
    .setDescription('Extend MyAnimeList')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(9876);
}

bootstrap();
