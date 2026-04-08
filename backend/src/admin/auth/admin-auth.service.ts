import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { AdminLoginResponse, AdminTokenPayload } from './admin-auth.types';

@Injectable()
export class AdminAuthService {
  private readonly tokenTtlSeconds = 60 * 60 * 12;

  login(username: string, password: string): AdminLoginResponse {
    this.validateCredentials(username, password);

    const exp = Math.floor(Date.now() / 1000) + this.tokenTtlSeconds;
    const token = this.signToken({ username, exp });

    return {
      token,
      expires_at: new Date(exp * 1000).toISOString(),
      admin: {
        username,
      },
    };
  }

  verifyToken(token: string): AdminTokenPayload {
    const [encodedPayload, signature] = token.split('.');

    if (!encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid admin token format.');
    }

    const expectedSignature = this.signSegment(encodedPayload);
    const provided = Buffer.from(signature, 'utf8');
    const expected = Buffer.from(expectedSignature, 'utf8');

    if (
      provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)
    ) {
      throw new UnauthorizedException('Invalid admin token signature.');
    }

    const payload = this.decodePayload(encodedPayload);

    if (!payload.username || !payload.exp) {
      throw new UnauthorizedException('Invalid admin token payload.');
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Admin token has expired.');
    }

    return payload;
  }

  getTokenTtlSeconds(): number {
    return this.tokenTtlSeconds;
  }

  private validateCredentials(username: string, password: string): void {
    const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      throw new UnauthorizedException('Invalid admin credentials.');
    }
  }

  private signToken(payload: AdminTokenPayload): string {
    const encodedPayload = this.encodePayload(payload);
    return `${encodedPayload}.${this.signSegment(encodedPayload)}`;
  }

  private signSegment(encodedPayload: string): string {
    return createHmac('sha256', this.getSecret())
      .update(encodedPayload)
      .digest('base64url');
  }

  private encodePayload(payload: AdminTokenPayload): string {
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  }

  private decodePayload(encodedPayload: string): AdminTokenPayload {
    try {
      return JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as AdminTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid admin token payload encoding.');
    }
  }

  private getSecret(): string {
    return process.env.ADMIN_TOKEN_SECRET ?? 'pakvoyage-admin-secret';
  }
}
