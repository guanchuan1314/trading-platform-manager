import { MPath } from './mpath';
import * as fs from 'fs';
import { Global } from './global';

export class Config {
  public async getExpertExtension(configName) {
    const platform = await this.readData(configName, 'platform');
    if (platform === 'mt5') {
      return '.ex5';
    } else {
      return '.ex4';
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
      chartTemplate = chartTemplate.replace(
        '{{TIMEFRAME}}',
        await this.readData(configName, 'timeframe'),
      );
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
}
