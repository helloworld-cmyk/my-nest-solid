import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception';
import { PrismaExceptionFilter } from './filters/prisma-exception';
import { ResponseInterceptor } from './interceptor/interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //cors (required for socket.io + external test clients)
  app.enableCors({ origin: '*' });

  //validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  //filters
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new PrismaExceptionFilter());
  //interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  //swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('My Nest Solid API')
    .setDescription('API documentation for My Nest Solid')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  //start server
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
