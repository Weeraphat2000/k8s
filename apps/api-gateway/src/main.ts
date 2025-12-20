import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('test print :');
  console.log(process.env.KK);
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
  console.log(`API Gateway is running on: ${await app.getUrl()}`);
}
bootstrap();
