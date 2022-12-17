import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountController } from './account/account.controller';
import { ConfigController } from './config/config.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: __dirname + '/../../frontend/dist',
    }),
  ],
  controllers: [AppController, AccountController, ConfigController],
  providers: [AppService],
})
export class AppModule {}
