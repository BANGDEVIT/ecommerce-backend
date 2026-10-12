import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { Repository } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Verification)
    private readonly vertificationRepository: Repository<Verification>,
    private readonly logger: PinoLogger,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async verifyEmailCustomer(token: string, email: string) {
    const record = await this.vertificationRepository.findOne({
      where: { value: token },
    });

    if (!record) {
      this.logger.warn({ msg: 'auth.verify.tokenNotFound', email });
      throw new BadRequestException('Token xác minh không hợp lệ');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      this.vertificationRepository.delete({ id: record.id });
      this.logger.warn({ msg: 'auth.verify.tokenExpired', email });
      throw new BadRequestException('Token xác minh đã hết hạn');
    }

    if (record.identifier.toLowerCase() !== email.toLowerCase()) {
      this.logger.warn({
        msg: 'auth.verify.emailMismatch',
        TokenEmail: record.identifier,
        providedEmail: email,
      });
      throw new BadRequestException('Email không khớp với token xác minh');
    }

    await this.vertificationRepository.delete({ id: record.id });
    await this.userService.verifyUser(email);

    this.logger.info({ msg: 'auth.email.verify', email });

    return {
      success: true,
      message: 'Xác thực email thành công',
      user: null,
    };
  }
}
