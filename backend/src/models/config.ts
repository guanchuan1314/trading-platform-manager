import { MPath } from './mpath';
import * as fs from 'fs';
import { Global } from './global';
import * as AdmZip from 'adm-zip';
import * as http from 'http';

export class Config {
  public async getExpertExtension(configName) {
    const platform = await this.readData(configName, 'platform');
    if (platform === 'mt5') {
      return '.ex5';
    } else {
      return '.ex4';
    }
  }

  private getPeriodInfo(timeframe) {
    switch (timeframe) {
      case '1':
        return { period_type: 0, timeframe: 1 };
      case '5':
        return { period_type: 0, timeframe: 5 };
      case '15':
        return { period_type: 0, timeframe: 15 };
      case '30':
        return { period_type: 0, timeframe: 30 };
      case '60':
        return { period_type: 1, timeframe: 1 };
      case '240':
        return { period_type: 1, timeframe: 4 };
      case '1440':
        return { period_type: 2, timeframe: 1 };
      case '10080':
        return { period_type: 3, timeframe: 1 };
      case '43200':
        return { period_type: 4, timeframe: 1 };
      default:
        return { period_type: 0, timeframe: 1 };
    }
  }
  public async getSetString(configName) {
    if (
      fs.existsSync(
        MPath.getConfigPath(
          configName + '/expert' + (await this.getExpertExtension(configName)),
        ),
      )
    ) {
      let chartTemplate = fs.readFileSync(
        MPath.getResourcePath('MT5/Charts/ChartTemplate.chr'),
        {
          encoding: 'utf16le',
        },
      );
      chartTemplate = chartTemplate.replace('{{EXPERT_NAME}}', configName);
      chartTemplate = chartTemplate.replace(
        '{{EXPERT_PATH}}',
        'Experts\\TTM\\' +
          configName +
          (await this.getExpertExtension(configName)),
      );
      chartTemplate = chartTemplate.replace(
        '{{SYMBOL}}',
        await this.readData(configName, 'symbol'),
      );

      const periodInfo = this.getPeriodInfo(
        await this.readData(configName, 'timeframe'),
      );
      chartTemplate = chartTemplate.replace(
        '{{TIMEFRAME}}',
        String(periodInfo.timeframe),
      );
      chartTemplate = chartTemplate.replace(
        '{{PERIOD_TYPE}}',
        String(periodInfo.period_type),
      );

      if (fs.existsSync(MPath.getConfigPath(configName + '/set.set'))) {
        const setString = fs.readFileSync(
          MPath.getConfigPath(configName + '/set.set'),
          {
            encoding: 'utf16le',
          },
        );
        const sets = setString.split('\n');
        const inputs = [];
        for (const set of sets) {
          const modifiedSet = set.trim();
          if (
            !modifiedSet.startsWith(';') &&
            modifiedSet[0] &&
            modifiedSet[0] !== ''
          ) {
            const key = modifiedSet.split('=')[0];
            const valueString = modifiedSet.replace(key + '=', '');
            const value = valueString.split('||')[0];
            inputs.push(key + '=' + value);
          }
        }

        if (inputs.length > 0) {
          chartTemplate = chartTemplate.replace(
            '{{INPUTS}}',
            inputs.join('\n'),
          );
        }
      }
      return chartTemplate;
    }
    return '';
  }

  public async updateConfigToAccount(configName, accountName, count) {
    const setString = await this.getSetString(configName);
    fs.copyFileSync(
      MPath.getConfigPath(
        configName + '/expert' + (await this.getExpertExtension(configName)),
      ),
      MPath.getPlatformPath(
        accountName +
          '/MQL5/Experts/TTM/' +
          configName +
          (await this.getExpertExtension(configName)),
      ),
    );
    fs.writeFileSync(
      MPath.getPlatformPath(
        accountName +
          '/MQL5/Profiles/Charts/TTM/chart' +
          Global.leadingZeros(count, 2) +
          '.chr',
      ),
      setString,
    );
  }

  public async getConfigs() {
    const configs = [];
    const files = fs.readdirSync(MPath.getConfigPath(''));

    for (const file of files) {
      if (!fs.lstatSync(MPath.getConfigPath(file)).isDirectory()) {
        continue;
      }

      const data = {
        name: file,
      };
      const attributes = fs.readdirSync(MPath.getConfigPath(file) + '/Data');
      for (const attribute of attributes) {
        const formattedAttribute = attribute.replace('.txt', '');
        data[formattedAttribute] = await this.readData(
          file,
          formattedAttribute,
        );
      }

      const uploadedAttributes = [];

      if (
        fs.existsSync(MPath.getConfigPath(file) + '/expert.ex5') ||
        fs.existsSync(MPath.getConfigPath(file) + '/expert.ex4')
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

      if (fs.existsSync(MPath.getConfigPath(file) + '/set.set')) {
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
    return configs;
  }

  public async addConfig(configName, data = {}) {
    if (fs.existsSync(MPath.getConfigPath(configName))) {
      throw new Error('Config already exists');
    }

    fs.mkdirSync(MPath.getConfigPath(configName));
    fs.mkdirSync(MPath.getConfigPath(configName + '/Data'));

    for (const key of Object.keys(data)) {
      await this.writeData(configName, key, data[key]);
    }
  }

  public async deleteConfig(configName) {
    if (!fs.existsSync(MPath.getConfigPath(configName))) {
      throw new Error('Config does not exist');
    }
    fs.rmSync(MPath.getConfigPath(configName), { recursive: true });
  }

  async writeData(configName, name, value) {
    if (value) {
      const folderName = MPath.getConfigPath(
        configName + '/Data/' + name + '.txt',
      );
      fs.writeFileSync(folderName, value);
    }
  }

  async readData(file, name) {
    const dataFolderName = MPath.getConfigPath(file + '/Data/' + name + '.txt');
    return fs.existsSync(dataFolderName)
      ? fs.readFileSync(dataFolderName, { encoding: 'utf-8' })
      : '';
  }

  async zipConfig() {
    const zip = new AdmZip();
    zip.addLocalFolder(MPath.getConfigPath(''));
    zip.writeZip(MPath.getTmpPath('config.zip'));

    return fs.createReadStream(MPath.getTmpPath('config.zip'));
  }

  async downloadConfigFromURL(url) {
    const file = fs.createWriteStream(MPath.getTmpPath('newConfig.zip'));
    return new Promise((resolve, reject) => {
      const request = http.get(url, function (response) {
        response.pipe(file);
        // after download completed close filestream
        file.on('finish', () => {
          file.close();
          resolve('');
        });
      });
    });
  }

  async updateConfigFromURL(url) {
    await this.downloadConfigFromURL(url);
    fs.rmSync(MPath.getConfigPath(''), { recursive: true });
    fs.mkdirSync(MPath.getConfigPath(''));

    const zip = new AdmZip(MPath.getTmpPath('newConfig.zip'));
    zip.extractAllTo(MPath.getConfigPath(''), true);
  }
}
