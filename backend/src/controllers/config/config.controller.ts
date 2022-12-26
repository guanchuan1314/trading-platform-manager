import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Param, Query, Req } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Config } from 'src/models/config';
import { Global } from 'src/models/global';
import { MPath } from 'src/models/mpath';

export class CreateConfigDto {
  name: string;
  remark: string;
  platform: string;
  symbol: string;
  timeframe: string;
  token: string;
}

export class DeleteConfigDto {
  name: string;
  token: string;
}

export class ListConfigDto {
  token: string;
}

@Controller('config')
export class ConfigController {
  configPath = '' as string;

  @Post('add')
  async addConfig(@Body() createConfigDto: CreateConfigDto) {
    const config = new Config();
    try {
      await Global.checkPermission(createConfigDto.token);
      await config.addConfig(createConfigDto.name, {
        remark: createConfigDto.remark,
        platform: createConfigDto.platform,
        symbol: createConfigDto.symbol,
        timeframe: createConfigDto.timeframe,
      });
      return { status: 'success', message: 'Config added' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Get('list')
  async listConfigs(@Query() listConfigDto: ListConfigDto) {
    const config = new Config();
    try {
      await Global.checkPermission(listConfigDto.token);
      const configs = await config.getConfigs();

      return {
        status: 'success',
        message: 'Configs listed',
        configs: configs,
      };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('delete')
  async deleteConfig(@Body() deleteConfigDto: DeleteConfigDto) {
    const config = new Config();
    try {
      await Global.checkPermission(deleteConfigDto.token);
      await config.deleteConfig(deleteConfigDto.name);
      return { status: 'success', message: 'Config deleted' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, MPath.getConfigPath(req.body.name));
        },
        filename: (req, file, cb) => {
          let formattedFileName = '';
          if (req.body.type === 'expert') {
            if (req.body.platform === 'mt5') {
              formattedFileName = 'expert.ex5';
            } else if (req.body.platform === 'mt4') {
              formattedFileName = 'expert.ex4';
            }
          } else if (req.body.type == 'set') {
            formattedFileName = 'set.set';
          }
          cb(null, formattedFileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (req.body.type === 'expert') {
          if (
            req.body.platform === 'mt5' &&
            file.originalname.indexOf('ex5') === -1
          ) {
            req.fileValidationError = 'Only ex5 file is allowed.';
            cb(null, false);
          } else if (
            req.body.platform === 'mt4' &&
            file.originalname.indexOf('ex4') === -1
          ) {
            req.fileValidationError = 'Only ex4 file is allowed.';
            cb(null, false);
          }
        } else if (
          req.body.type == 'set' &&
          file.originalname.indexOf('set') == -1
        ) {
          req.fileValidationError = 'Only set file is allowed.';
          cb(null, false);
        }
        cb(null, true);
      },
    }),
  )
  uploadConfigFile(
    @Body() body,
    @Req() req,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    return { status: 'success', message: 'Config file uploaded' };
  }
}
