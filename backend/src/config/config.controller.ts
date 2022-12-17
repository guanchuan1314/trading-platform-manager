import { Controller, Post, Get, Body } from '@nestjs/common';
import * as fs from 'fs';

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
  listConfig() {
    const configs = [];
    const files = fs.readdirSync(this.configPath);

    for (const file of files) {
      const data = {
        name: file,
      };
      const attributes = fs.readdirSync(this.configPath + file + '/Data');
      for (const attribute of attributes) {
        const formattedAttribute = attribute.replace('.txt', '');
        data[formattedAttribute] = this.readData(file, formattedAttribute);
      }
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
}
