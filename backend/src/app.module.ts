import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountController } from './controllers/account/account.controller';
import { ConfigController } from './controllers/config/config.controller';
import { Global } from './models/global';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: Global.isDev()
        ? __dirname + '/../../frontend/dist'
        : __dirname + '/frontend',
    }),
  ],
  controllers: [AppController, AccountController, ConfigController],
  providers: [AppService],
})
export class AppModule {}
