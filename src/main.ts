import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Inpoin Rest API')
    .setDescription('API for Inpoin token transactions')
    .setVersion('1.0')
    .addTag('Inpoin')
    .build();
    
  

    const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}
bootstrap();
