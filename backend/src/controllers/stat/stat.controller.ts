import { Controller, Get } from '@nestjs/common';
import * as disk from 'diskusage';
import * as os from 'os-utils';
import { Account } from 'src/models/account';
import { Global } from 'src/models/global';

@Controller('stat')
export class StatController {
  @Get('all')
  async getAll() {
    const diskInfo = await disk.check('/');
    const cpuInfo = await this.getCpuUsage();
    const account = new Account();
    return {
      status: 'success',
      memoryUsage: Global.roundUp((1 - os.freemem() / os.totalmem()) * 100, 2),
      cpuUsage: Global.roundUp(Number(cpuInfo) * 100, 2),
      storageUsage: Global.roundUp(
        (1 - diskInfo.free / diskInfo.total) * 100,
        2,
      ),
      terminalCount: (await account.getAccounts()).length,
    };
  }

  async getCpuUsage() {
    return new Promise((resolve, reject) => {
      os.cpuUsage((v) => {
        resolve(v);
      });
    });
  }
}
