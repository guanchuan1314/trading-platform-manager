import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountController } from './controllers/account/account.controller';
import { ConfigController } from './controllers/config/config.controller';
import path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '/../../frontend/dist'),
    }),
  ],
  controllers: [AppController, AccountController, ConfigController],
  providers: [AppService],
})
export class AppModule {}
