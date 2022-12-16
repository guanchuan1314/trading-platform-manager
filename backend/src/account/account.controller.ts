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

  @Post('add')
  async addAccount(@Body() createAccountDto: CreateAccountDto) {
    const folderName =
      __dirname + '/../../../platforms/' + createAccountDto.name;
    try {
      if (fs.existsSync(folderName)) {
        throw new Error('Account already exists');
      }
      await this.extractZip(
        __dirname + '/../../../setups/metatrader5.zip',
        folderName,
      );
      fs.mkdirSync(folderName + '/TradingPlatformManager');
      fs.mkdirSync(folderName + '/TradingPlatformManager/Data');
      fs.mkdirSync(folderName + '/TradingPlatformManager/Config');
      if (createAccountDto.account) {
        fs.writeFileSync(
          folderName + '/TradingPlatformManager/Data/Account.txt',
          createAccountDto.account,
        );
      }
      if (createAccountDto.password) {
        fs.writeFileSync(
          folderName + '/TradingPlatformManager/Data/Password.txt',
          createAccountDto.password,
        );
      }
      if (createAccountDto.broker) {
        fs.writeFileSync(
          folderName + '/TradingPlatformManager/Data/Broker.txt',
          createAccountDto.broker,
        );
      }

      fs.writeFileSync(
        folderName + '/start.bat',
        'terminal64.exe /portable /config:TradingPlatformManager\\Config\\Config.ini',
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
    const folderName = __dirname + '\\..\\..\\..\\platforms';
    const files = fs.readdirSync(folderName);
    for (const file of files) {
      const tasks = await this.getTaskByPath(
        folderName + '\\' + file + '\\terminal64.exe',
      );
      const isRunning = tasks.length > 0;

      accounts.push({
        name: file,
        account: fs.existsSync(
          folderName +
            '\\' +
            file +
            '\\TradingPlatformManager\\Data\\Account.txt',
        )
          ? fs.readFileSync(
              folderName +
                '\\' +
                file +
                '\\TradingPlatformManager\\Data\\Account.txt',
              { encoding: 'utf-8' },
            )
          : '',
        broker: fs.existsSync(
          folderName +
            '\\' +
            file +
            '\\TradingPlatformManager\\Data\\Broker.txt',
        )
          ? fs.readFileSync(
              folderName +
                '\\' +
                file +
                '\\TradingPlatformManager\\Data\\Broker.txt',
              { encoding: 'utf-8' },
            )
          : '',
        status: isRunning ? 'Running' : 'Stopped',
      });
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
    let folderName = __dirname + '/../../../platforms/' + startAccountDto.name;
    folderName = path.resolve(folderName);
    exec('start cmd /c "cd ' + folderName + ' && start.bat"');
    return { status: 'success', message: 'Account started' };
  }

  @Post('stop')
  async stopAccount(@Body() stopAccountDto: StopAccountDto) {
    const folderName = __dirname + '/../../../platforms/' + stopAccountDto.name;
    const tasks = await this.getTaskByPath(folderName + '\\terminal64.exe');
    for (const task of tasks) {
      await this.stopProcess(task.pid);
    }
    return { status: 'success', message: 'Account stopped' };
  }
}
