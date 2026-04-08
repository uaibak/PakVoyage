import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminLoginResponse } from './admin-auth.types';
import { AdminAuthGuard } from './admin-auth.guard';

interface AuthenticatedAdminRequest extends Request {
  admin?: {
    username: string;
  };
}

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto): Promise<AdminLoginResponse> {
    return this.adminAuthService.login(dto.username, dto.password);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  async me(@Req() request: AuthenticatedAdminRequest): Promise<{ username: string }> {
    return {
      username: request.admin?.username ?? 'admin',
    };
  }
}
