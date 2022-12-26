import { Controller, Post, Body, Get } from '@nestjs/common';
import { Global } from 'src/models/global';

export class LoginDto {
  username: string;
  password: string;
}
export class RegisterDto {
  username: string;
  password: string;
}

@Controller('main')
export class MainController {
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const token = await Global.login(loginDto.username, loginDto.password);
      return { status: 'success', token: token };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Get('data')
  async getData() {
    try {
      await Global.getData();
      return { status: 'success' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      await Global.register(registerDto.username, registerDto.password);
      return { status: 'success' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }
}
