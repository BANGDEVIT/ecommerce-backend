import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entities';
import { apiNotFound } from 'src/shared/helpers/api-i18n';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Đánh dấu email của user là đã xác minh.
   * Nếu user đã xác minh từ trước thì bỏ qua (không update lại emailVerifiedAt).
   */
  async verifyUser(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() }, // Better Auth lưu email ở dạng chữ thường
    });

    if (!user) {
      apiNotFound('errors.common.userNotFound');
    }

    if (user.emailVerified) {
      return;
    }

    await this.userRepository.update(
      { id: user.id },
      { emailVerified: true, emailVerifiedAt: new Date() },
    );
  }

  async getUser(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
}
