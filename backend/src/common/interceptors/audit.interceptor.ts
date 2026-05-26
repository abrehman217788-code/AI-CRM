import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, params, body } = request;

    return next.handle().pipe(
      tap(() => {
        if (user && method !== 'GET') {
          const entity = url.split('/')[3] || 'unknown';
          this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action: `${method} ${url}`,
              entity,
              entityId: params.id,
              changes: method === 'POST' ? { body } : undefined,
              ipAddress: request.ip,
            },
          }).catch(() => {});
        }
      }),
    );
  }
}
