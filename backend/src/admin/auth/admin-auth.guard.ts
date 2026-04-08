import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';

interface AuthenticatedAdminRequest extends Request {
  admin?: {
    username: string;
  };
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedAdminRequest>();
    const headerValueRaw = request.headers.authorization;
    const headerValue = Array.isArray(headerValueRaw)
      ? headerValueRaw[0]
      : headerValueRaw;

    if (!headerValue) {
      throw new UnauthorizedException('Missing admin authorization header.');
    }

    const [scheme, token] = headerValue.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid admin authorization format.');
    }

    const payload = this.adminAuthService.verifyToken(token);
    request.admin = { username: payload.username };
    return true;
  }
}
