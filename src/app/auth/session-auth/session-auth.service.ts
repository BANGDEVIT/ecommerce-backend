import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncomingHttpHeaders } from 'http';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { extractSessionTokenFromHeaders } from 'src/shared/utils/request-session.util';

@Injectable()
export class SessionAuthService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  /**
   * Lấy session + user từ headers của request.
   * Trả về null nếu không có token, token không tồn tại, session hết hạn
   * hoặc user không còn (đã bị xoá).
   *
   * @param headers truyền thẳng req.headers
   */
  async resolveSessionContext(headers: IncomingHttpHeaders) {
    const token = extractSessionTokenFromHeaders(headers);
    if (!token) {
      return null;
    }

    const row = await this.sessionRepo.findOne({
      where: { token },
      relations: {
        user: true,
      },
    });

    if (row && row.expiresAt > new Date() && row.user) {
      return {
        session: {
          id: row.id,
          token: row.token,
          expiresAt: row.expiresAt,
        },
        user: row.user,
      };
    }
    return null;
  }

  /** Chỉ lấy user hiện tại (hoặc null nếu chưa đăng nhập). */
  async resolveAuthenticateUser(headers: IncomingHttpHeaders) {
    const ctx = await this.resolveSessionContext(headers);
    return ctx?.user ?? null;
  }
}
