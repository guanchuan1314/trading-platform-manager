import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';
import { Req } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { execFile } from 'child_process';
import * as fs from 'fs';
import { diskStorage } from 'multer';

export class CreateConfigDto {
  name: string;
  remark: string;
  platform: string;
  symbol: string;
  timeframe: string;
}

export class DeleteConfigDto {
  name: string;
}

@Controller('config')
export class ConfigController {
  configPath = '' as string;

  constructor() {
    this.configPath = __dirname + '/../../../configs/';
  }

  writeData(configName, name, value) {
    if (value) {
      const folderName =
        this.configPath + configName + '/Data/' + name + '.txt';
      fs.writeFileSync(folderName, value);
    }
  }

  readData(file, name) {
    const folderName = this.configPath + file;
    const dataFolderName = folderName + '/Data/' + name + '.txt';
    return fs.existsSync(dataFolderName)
      ? fs.readFileSync(dataFolderName, { encoding: 'utf-8' })
      : '';
  }

  @Post('add')
  addConfig(@Body() createConfigDto: CreateConfigDto) {
    const folderName = this.configPath + createConfigDto.name;
    const dataFolderName = folderName + '/Data';
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }

    if (!fs.existsSync(dataFolderName)) {
      fs.mkdirSync(dataFolderName);
    }

    this.writeData(createConfigDto.name, 'remark', createConfigDto.remark);
    this.writeData(createConfigDto.name, 'platform', createConfigDto.platform);
    this.writeData(createConfigDto.name, 'symbol', createConfigDto.symbol);
    this.writeData(
      createConfigDto.name,
      'timeframe',
      createConfigDto.timeframe,
    );

    return { status: 'success', message: 'Config added' };
  }

  @Get('list')
  listConfigs() {
    const configs = [];
    const files = fs.readdirSync(this.configPath);

    for (const file of files) {
      if (!fs.lstatSync(this.configPath + file).isDirectory()) {
        continue;
      }

      const data = {
        name: file,
      };
      const attributes = fs.readdirSync(this.configPath + file + '/Data');
      for (const attribute of attributes) {
        const formattedAttribute = attribute.replace('.txt', '');
        data[formattedAttribute] = this.readData(file, formattedAttribute);
      }

      const uploadedAttributes = [];

      if (
        fs.existsSync(this.configPath + file + '/expert.ex5') ||
        fs.existsSync(this.configPath + file + '/expert.ex4')
      ) {
        uploadedAttributes.push({
          name: 'Expert',
          value: true,
          type: 'expert',
        });
      } else {
        uploadedAttributes.push({
          name: 'Expert',
          value: false,
          type: 'expert',
        });
      }

      if (fs.existsSync(this.configPath + file + '/set.set')) {
        uploadedAttributes.push({ name: 'Set File', value: true, type: 'set' });
      } else {
        uploadedAttributes.push({
          name: 'Set File',
          value: false,
          type: 'set',
        });
      }

      data['uploadedAttributes'] = uploadedAttributes;

      configs.push(data);
    }

    return {
      status: 'success',
      message: 'Configs listed',
      configs: configs,
    };
  }

  @Post('delete')
  deleteConfig(@Body() deleteConfigDto: DeleteConfigDto) {
    const folderName = this.configPath + deleteConfigDto.name;

    if (fs.existsSync(folderName)) {
      fs.rmdirSync(folderName, { recursive: true });
    }
    return { status: 'success', message: 'Config deleted' };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const configPath = __dirname + '/../../../configs/';
          const folderName = configPath + req.body.name;
          cb(null, folderName);
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
