import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { Repository } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { UserService } from '../user/user.service';
import { apiBadRequest } from 'src/shared/helpers/api-i18n';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly logger: PinoLogger,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /**
   * Xác minh email bằng token trong bảng verification.
   * Lưu ý: apiBadRequest phải THROW (kiểu trả về `never`),
   * nếu không code sẽ chạy tiếp và crash ở record.expiresAt khi record = null.
   */
  async verifyEmailCustomer(token: string, email: string) {
    const record = await this.verificationRepository.findOne({
      where: { value: token },
    });

    if (!record) {
      this.logger.warn({ msg: 'auth.verify.tokenNotFound', email });
      apiBadRequest('errors.auth.verificationFailed');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      // phải await, nếu không lệnh xoá chạy ngầm và lỗi (nếu có) bị nuốt mất
      await this.verificationRepository.delete({ id: record.id });
      this.logger.warn({ msg: 'auth.verify.tokenExpired', email });
      apiBadRequest('errors.auth.tokenExpired');
    }

    if (record.identifier.toLowerCase() !== email.toLowerCase()) {
      this.logger.warn({
        msg: 'auth.verify.emailMismatch',
        tokenEmail: record.identifier,
        providedEmail: email,
      });
      apiBadRequest('errors.auth.emailMismatch');
    }

    // Xác minh user TRƯỚC, xoá token SAU:
    // nếu verifyUser lỗi (vd không tìm thấy user) thì token vẫn còn để thử lại
    await this.userService.verifyUser(email);
    await this.verificationRepository.delete({ id: record.id });

    this.logger.info({ msg: 'auth.email.verified', email });

    return {
      success: true,
      message: 'Xác thực email thành công',
    };
  }
}
