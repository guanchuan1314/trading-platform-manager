import { Controller, Get, Post, Body } from '@nestjs/common';
import { Account } from 'src/models/account';
import { Config } from 'src/models/config';

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

export class ConfigAccountDto {
  name: string;
  configs: string[];
}

@Controller('account')
export class AccountController {
  @Post('add')
  async addAccount(@Body() createAccountDto: CreateAccountDto) {
    const account = new Account();
    try {
      await account.addAccount(
        createAccountDto.name,
        createAccountDto.account,
        createAccountDto.password,
        createAccountDto.broker,
        {
          platform: createAccountDto.platform,
        },
      );
      return { status: 'success', message: 'Account added' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Get('list')
  async listAccounts() {
    const account = new Account();
    try {
      const accounts = await account.getAccounts();
      return {
        status: 'success',
        message: 'Accounts listed',
        accounts: accounts,
      };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('delete')
  async deleteAccount(@Body() deleteAccountDto: DeleteAccountDto) {
    const account = new Account();
    try {
      await account.deleteAccount(deleteAccountDto.name);
      return { status: 'success', message: 'Account deleted' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('start')
  async startAccount(@Body() startAccountDto: StartAccountDto) {
    const config = new Config();
    const account = new Account();
    try {
      await account.initAccount(startAccountDto.name);
      const configNames = await account.getConfigs(startAccountDto.name);
      for (const configName of configNames) {
        await config.updateConfigToAccount(
          configName,
          startAccountDto.name,
          await account.getChartCount(startAccountDto.name),
        );
      }
      await account.startAccount(startAccountDto.name);
      return { status: 'success', message: 'Account started' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('stop')
  async stopAccount(@Body() stopAccountDto: StopAccountDto) {
    const account = new Account();
    try {
      await account.stopAccount(stopAccountDto.name);
      return { status: 'success', message: 'Account stopped' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('configs')
  async configAccount(@Body() configAccountDto: ConfigAccountDto) {
    const account = new Account();
    try {
      await account.updateConfigs(
        configAccountDto.name,
        configAccountDto.configs,
      );
      return { status: 'success', message: 'Account configured' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }
}
