import { Controller, Get, Post, Body } from '@nestjs/common';
import * as fs from 'fs';
import * as unzipper from 'unzipper';
import { snapshot } from 'process-list';
import { exec } from 'child_process';
import * as path from 'path';
import * as process from 'process';

export class CreateAccountDto {
  name: string;
  account: string;
  password: string;
  broker: string;
  platform: string;
}

export class DeleteAccountDto {
  name: string;
}

export class StartAccountDto {
  name: string;
}

export class StopAccountDto {
  name: string;
}

@Controller('account')
export class AccountController {
  platformPath = '' as string;
  resourcePath = '' as string;

  constructor() {
    this.platformPath = __dirname + '/../../../platforms/';
    this.resourcePath = __dirname + '/../../../resources/';
  }

  async extractZip(filename, folderName) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filename)
        .pipe(
          unzipper.Extract({
            path: folderName,
          }),
        )
        .on('close', () => {
          resolve('');
        })
        .on('error', (e) => {
          reject(e);
        });
    });
  }

  async getTaskByPath(folderPath) {
    let tasks = await snapshot('pid', 'name', 'path');
    tasks = tasks.filter((task) => {
      return (
        task.name === 'terminal64.exe' &&
        path.resolve(task.path) === path.resolve(folderPath)
      );
    });
    return tasks;
  }

  async stopProcess(pid) {
    return new Promise((resolve) => {
      process.kill(pid);
      resolve('');
    });
  }

  writeData(accountName, name, value) {
    if (value) {
      const folderName =
        this.platformPath +
        accountName +
        '/TradingPlatformManager/Data/' +
        name +
        '.txt';
      fs.writeFileSync(folderName, value);
    }
  }

  readData(file, name) {
    const folderName = this.platformPath + file;
    const dataFolderName =
      folderName + '/TradingPlatformManager/Data/' + name + '.txt';
    return fs.existsSync(dataFolderName)
      ? fs.readFileSync(dataFolderName, { encoding: 'utf-8' })
      : '';
  }

  @Post('add')
  async addAccount(@Body() createAccountDto: CreateAccountDto) {
    const folderName = this.platformPath + createAccountDto.name;
    try {
      if (fs.existsSync(folderName)) {
        throw new Error('Account already exists');
      }
      await this.extractZip(
        this.resourcePath + 'MT5/Setups/metatrader5.zip',
        folderName,
      );
      fs.mkdirSync(folderName + '/TradingPlatformManager');
      fs.mkdirSync(folderName + '/TradingPlatformManager/Data');
      fs.mkdirSync(folderName + '/TradingPlatformManager/Config');
      fs.mkdirSync(folderName + '/MQL5/Profiles/Charts/TTM');

      this.writeData(
        createAccountDto.name,
        'account',
        createAccountDto.account,
      );
      this.writeData(
        createAccountDto.name,
        'password',
        createAccountDto.password,
      );
      this.writeData(createAccountDto.name, 'broker', createAccountDto.broker);
      this.writeData(
        createAccountDto.name,
        'platform',
        createAccountDto.platform,
      );

      fs.writeFileSync(
        folderName + '/start.bat',
        'terminal64.exe /portable /config:TradingPlatformManager\\Config\\Config.ini /profile:TTM',
      );

      if (
        createAccountDto.password &&
        createAccountDto.name &&
        createAccountDto.broker
      ) {
        let config = '[Common]';
        config += '\nLogin=' + createAccountDto.account;
        config += '\nPassword=' + createAccountDto.password;
        config += '\nServer=' + createAccountDto.broker;

        config += '\n';
        config += '\n[Expert]';
        config += '\nAllowLiveTrading=1';
        config += '\nAllowDllImport=1';
        config += '\nEnabled=1';
        config += '\nProfile=0';

        fs.writeFileSync(
          folderName + '/TradingPlatformManager/Config/Config.ini',
          config,
        );
      }
      return { status: 'success', message: 'Account added' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Get('list')
  async listAccounts() {
    const accounts = [];
    const files = fs.readdirSync(this.platformPath);
    for (const file of files) {
      if (!fs.lstatSync(this.platformPath + file).isDirectory()) {
        continue;
      }
      const tasks = await this.getTaskByPath(
        this.platformPath + file + '\\terminal64.exe',
      );
      const isRunning = tasks.length > 0;
      let status = '';
      if (isRunning) {
        if (
          fs.existsSync(
            this.platformPath +
              file +
              '/MQL5/Files/TradingTerminalManagerData/status.txt',
          )
        ) {
          const currentState = fs.readFileSync(
            this.platformPath +
              file +
              '/MQL5/Files/TradingTerminalManagerData/status.txt',
            {
              encoding: 'utf16le',
            },
          );
          status = `Account ${currentState}`;
        } else {
          status = 'Account Pending Login';
        }
      } else {
        status = 'Terminal Not Started';
      }

      const account = {
        name: file,
        status: status,
      };
      const attributes = fs.readdirSync(
        this.platformPath + file + '/TradingPlatformManager/Data',
      );
      for (const attribute of attributes) {
        const formattedAttribute = attribute.replace('.txt', '');
        account[formattedAttribute] = this.readData(file, formattedAttribute);
      }
      accounts.push(account);
    }
    return {
      status: 'success',
      message: 'Accounts listed',
      accounts: accounts,
    };
  }

  @Post('delete')
  deleteAccount(@Body() deleteAccountDto: DeleteAccountDto) {
    const folderName =
      __dirname + '/../../../platforms/' + deleteAccountDto.name;
    try {
      fs.rmdirSync(folderName, { recursive: true });
      return { status: 'success', message: 'Account deleted' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('start')
  async startAccount(@Body() startAccountDto: StartAccountDto) {
    let folderName = this.platformPath + startAccountDto.name;
    folderName = path.resolve(folderName);

    if (fs.existsSync(folderName + '/MQL5/Profiles/Charts/TTM')) {
      fs.rmdirSync(folderName + '/MQL5/Profiles/Charts/TTM', {
        recursive: true,
      });
    }
    fs.mkdirSync(folderName + '/MQL5/Profiles/Charts/TTM');
    if (!fs.existsSync(folderName + '/MQL5/Files')) {
      fs.mkdirSync(folderName + '/MQL5/Files');
    }
    if (fs.existsSync(folderName + '/MQL5/Files/TradingTerminalManagerData')) {
      fs.rmdirSync(folderName + '/MQL5/Files/TradingTerminalManagerData', {
        recursive: true,
      });
    }
    fs.mkdirSync(folderName + '/MQL5/Files/TradingTerminalManagerData');

    const tradingTerminalChartData = fs.readFileSync(
      this.resourcePath + 'MT5/Charts/TradingTerminalManagerChart.chr',
      { encoding: 'utf16le' },
    );
    fs.writeFileSync(
      folderName + '/MQL5/Profiles/Charts/TTM/chart01.chr',
      tradingTerminalChartData,
    );
    fs.copyFileSync(
      this.resourcePath + 'MT5/Experts/TradingTerminalManager.ex5',
      folderName + '/MQL5/Experts/TradingTerminalManager.ex5',
    );

    exec('start cmd /c "cd ' + folderName + ' && start.bat"');
    return { status: 'success', message: 'Account started' };
  }

  @Post('stop')
  async stopAccount(@Body() stopAccountDto: StopAccountDto) {
    const folderName = this.platformPath + stopAccountDto.name;
    const tasks = await this.getTaskByPath(folderName + '\\terminal64.exe');
    for (const task of tasks) {
      await this.stopProcess(task.pid);
    }
    return { status: 'success', message: 'Account stopped' };
  }
}
