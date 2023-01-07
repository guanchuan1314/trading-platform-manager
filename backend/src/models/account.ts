import * as path from 'path';
import { MPath } from 'src/models/mpath';
import { Global } from 'src/models/global';
import * as fs from 'fs';
import { snapshot } from 'process-list';
import * as unzipper from 'unzipper';
import { exec } from 'child_process';

export class Account {
  private async getTaskByPath(folderPath) {
    let tasks = await snapshot('pid', 'name', 'path');
    tasks = tasks.filter((task) => {
      return (
        task.name === 'terminal64.exe' &&
        path.resolve(task.path) === path.resolve(folderPath)
      );
    });
    return tasks;
  }

  public async getAccounts() {
    const accounts = [];
    const files = fs.readdirSync(MPath.getPlatformPath(''));
    for (const file of files) {
      if (!fs.lstatSync(MPath.getPlatformPath(file)).isDirectory()) {
        continue;
      }
      const tasks = await this.getTaskByPath(
        MPath.getPlatformPath(file + '/terminal64.exe'),
      );
      const isRunning = tasks.length > 0;
      let status = '';
      if (isRunning) {
        if (
          fs.existsSync(
            MPath.getPlatformPath(
              file + '/MQL5/Files/TradingTerminalManagerData/status.txt',
            ),
          )
        ) {
          const currentState = fs.readFileSync(
            MPath.getPlatformPath(
              file + '/MQL5/Files/TradingTerminalManagerData/status.txt',
            ),
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
        MPath.getPlatformPath(file + '/TradingPlatformManager/Data'),
      );
      for (const attribute of attributes) {
        const formattedAttribute = attribute.replace('.txt', '');

        if (formattedAttribute === 'password') continue;

        account[formattedAttribute] = await this.readData(
          file,
          formattedAttribute,
        );
      }
      account['configs'] = account['configs']
        ? account['configs'].split('\n')
        : [];
      accounts.push(account);
    }
    return accounts;
  }

  public async deleteAccount(accountName) {
    if (!fs.existsSync(MPath.getPlatformPath(accountName))) {
      throw new Error('Account does not exist');
    }
    fs.rmSync(MPath.getPlatformPath(accountName), { recursive: true });
  }

  private async extractZip(filename, folderName) {
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

  public async addAccount(accountName, account, password, broker, data = {}) {
    if (fs.existsSync(MPath.getPlatformPath(accountName))) {
      throw new Error('Account already exists');
    }
    await this.extractZip(
      MPath.getResourcePath('MT5/Setups/metatrader5.zip'),
      MPath.getPlatformPath(accountName),
    );
    fs.mkdirSync(
      MPath.getPlatformPath(accountName + '/TradingPlatformManager'),
    );
    fs.mkdirSync(
      MPath.getPlatformPath(accountName + '/TradingPlatformManager/Data'),
    );
    fs.mkdirSync(
      MPath.getPlatformPath(accountName + '/TradingPlatformManager/Config'),
    );
    fs.mkdirSync(MPath.getPlatformPath(accountName + '/MQL5/Experts/TTM'));

    for (const key of Object.keys(data)) {
      await this.writeData(accountName, key, data[key]);
    }
    await this.writeData(accountName, 'account', account);
    await this.writeData(accountName, 'password', password);
    await this.writeData(accountName, 'broker', broker);

    fs.writeFileSync(
      MPath.getPlatformPath(accountName + '/start.bat'),
      'terminal64.exe /portable /config:TradingPlatformManager\\Config\\Config.ini /profile:TTM',
    );

    let config = '[Common]';
    config += '\nLogin=' + account;
    config += '\nPassword=' + password;
    config += '\nServer=' + broker;

    config += '\n';
    config += '\n[Experts]';
    config += '\nAllowLiveTrading=1';
    config += '\nAllowDllImport=1';
    config += '\nEnabled=1';
    config += '\nAccount=0';
    config += '\nProfile=0';

    fs.writeFileSync(
      MPath.getPlatformPath(
        accountName + '/TradingPlatformManager/Config/Config.ini',
      ),
      config,
    );
  }

  public async writeData(accountName, name, value) {
    if (value) {
      const folderName = MPath.getPlatformPath(
        accountName + '/TradingPlatformManager/Data/' + name + '.txt',
      );
      fs.writeFileSync(folderName, value);
    }
  }

  public async readData(file, name) {
    return fs.existsSync(
      MPath.getPlatformPath(
        file + '/TradingPlatformManager/Data/' + name + '.txt',
      ),
    )
      ? fs.readFileSync(
          MPath.getPlatformPath(
            file + '/TradingPlatformManager/Data/' + name + '.txt',
          ),
          { encoding: 'utf-8' },
        )
      : '';
  }

  private async stopProcess(pid) {
    return new Promise((resolve) => {
      process.kill(pid);
      resolve('');
    });
  }

  public async initAccount(accountName) {
    if (!fs.existsSync(MPath.getPlatformPath(accountName))) {
      throw new Error('Account does not exist');
    }
    if (
      fs.existsSync(
        MPath.getPlatformPath(accountName + '/MQL5/Profiles/Charts/TTM'),
      )
    ) {
      fs.rmSync(
        MPath.getPlatformPath(accountName + '/MQL5/Profiles/Charts/TTM'),
        {
          recursive: true,
        },
      );
    }
    fs.mkdirSync(
      MPath.getPlatformPath(accountName) + '/MQL5/Profiles/Charts/TTM',
    );
    if (!fs.existsSync(MPath.getPlatformPath(accountName) + '/MQL5/Files')) {
      fs.mkdirSync(MPath.getPlatformPath(accountName) + '/MQL5/Files');
    }
    if (
      fs.existsSync(
        MPath.getPlatformPath(accountName) +
          '/MQL5/Files/TradingTerminalManagerData',
      )
    ) {
      fs.rmSync(
        MPath.getPlatformPath(accountName) +
          '/MQL5/Files/TradingTerminalManagerData',
        {
          recursive: true,
        },
      );
    }
    fs.mkdirSync(
      MPath.getPlatformPath(accountName) +
        '/MQL5/Files/TradingTerminalManagerData',
    );
  }

  public async startAccount(accountName) {
    if (!fs.existsSync(MPath.getPlatformPath(accountName))) {
      throw new Error('Account does not exist');
    }

    const tradingTerminalChartData = fs.readFileSync(
      MPath.getResourcePath('MT5/Charts/TradingTerminalManagerChart.chr'),
      { encoding: 'utf16le' },
    );
    fs.writeFileSync(
      MPath.getPlatformPath(accountName) +
        '/MQL5/Profiles/Charts/TTM/chart' +
        Global.leadingZeros((await this.getChartCount(accountName)) + 1, 2) +
        '.chr',
      tradingTerminalChartData,
    );
    fs.copyFileSync(
      MPath.getResourcePath('MT5/Experts/TradingTerminalManager.ex5'),
      MPath.getPlatformPath(accountName) +
        '/MQL5/Experts/TradingTerminalManager.ex5',
    );

    exec(
      'start cmd /c "cd ' +
        MPath.getPlatformPath(accountName) +
        ' && start.bat"',
    );
  }

  public async stopAccount(accountName) {
    if (!fs.existsSync(MPath.getPlatformPath(accountName))) {
      throw new Error('Account does not exist');
    }
    const tasks = await this.getTaskByPath(
      MPath.getPlatformPath(accountName + '/terminal64.exe'),
    );
    for (const task of tasks) {
      await this.stopProcess(task.pid);
    }
  }

  public async updateConfigs(accountName, configs = []) {
    if (!fs.existsSync(MPath.getPlatformPath(accountName))) {
      throw new Error('Account does not exist');
    }
    const configPath =
      MPath.getPlatformPath(accountName) +
      '/TradingPlatformManager/Data/configs.txt';
    fs.writeFileSync(configPath, configs.join('\n'));
  }

  public async getConfigs(accountName) {
    const configString = await this.readData(accountName, 'configs');
    return configString ? configString.split('\n') : [];
  }

  public async getChartCount(accountName) {
    return fs.readdirSync(
      MPath.getPlatformPath(accountName + '/MQL5/Profiles/Charts/TTM'),
    ).length;
  }
}
