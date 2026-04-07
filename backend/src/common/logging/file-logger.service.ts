import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FileLogger extends ConsoleLogger {
  private readonly logsDirectory = join(process.cwd(), 'logs');

  constructor(context?: string) {
    super(context ?? 'Application');
    this.ensureLogsDirectory();
  }

  override log(message: unknown, context?: string): void {
    super.log(message, context);
    this.writeLog('log', message, context);
  }

  override error(message: unknown, stack?: string, context?: string): void {
    super.error(message, stack, context);
    this.writeLog('error', message, context, stack);
  }

  override warn(message: unknown, context?: string): void {
    super.warn(message, context);
    this.writeLog('warn', message, context);
  }

  override debug(message: unknown, context?: string): void {
    super.debug(message, context);
    this.writeLog('debug', message, context);
  }

  override verbose(message: unknown, context?: string): void {
    super.verbose(message, context);
    this.writeLog('verbose', message, context);
  }

  override fatal(message: unknown, stack?: string, context?: string): void {
    super.fatal(message, stack, context);
    this.writeLog('fatal', message, context, stack);
  }

  private ensureLogsDirectory(): void {
    if (!existsSync(this.logsDirectory)) {
      mkdirSync(this.logsDirectory, { recursive: true });
    }
  }

  private writeLog(
    level: LogLevel | 'fatal',
    message: unknown,
    context?: string,
    stack?: string,
  ): void {
    const timestamp = new Date().toISOString();
    const renderedMessage = this.renderMessage(message);
    const renderedContext = context ?? this.context ?? 'Application';
    const line = `[${timestamp}] [${level.toUpperCase()}] [${renderedContext}] ${renderedMessage}${stack ? `\n${stack}` : ''}\n`;

    appendFileSync(this.resolveDailyLogFile('application'), line, 'utf8');

    if (level === 'error' || level === 'fatal') {
      appendFileSync(this.resolveDailyLogFile('error'), line, 'utf8');
    }
  }

  private resolveDailyLogFile(prefix: 'application' | 'error'): string {
    const dateStamp = new Date().toISOString().slice(0, 10);
    return join(this.logsDirectory, `${prefix}-${dateStamp}.log`);
  }

  private renderMessage(message: unknown): string {
    if (typeof message === 'string') {
      return message;
    }

    if (message instanceof Error) {
      return message.message;
    }

    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
}
