import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { SessionAuthService } from './session-auth/session-auth.service';
import { User } from '../user/entities/user.entities';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { AuthService } from './auth.service';
import { ResEx } from 'src/swagger/response-example';

@ApiTags('Xác thực (Auth)')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userServices: UserService,
    private readonly sessionAuth: SessionAuthService,
    private readonly authService: AuthService,
  ) {}

  private mapUserResponse(user: User) {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  private async sessionFromRequest(req: { headers: any }) {
    const ctx = await this.sessionAuth.resolveSessionContext(req.headers);
    if (!ctx) return null;

    return {
      user: this.mapUserResponse(ctx.user),
      session: {
        token: ctx.session.token,
        expiresAt: ctx.session.expiresAt,
      },
    };
  }

  @Get('verify-email')
  @ApiOperation({
    summary: 'Xác minh email qua Token (query)',
    operationId: 'auth_verify_email',
  })
  @ApiOkResponse({
    description: 'Ví dụ phản hồi',
    schema: { example: ResEx.auth.verifyEmail },
  })
  @ApiBadRequestResponse({
    description: 'Token không hợp lệ hoặc đã hết hạn',
    schema: { example: ResEx.auth.verifyEmailBadRequest },
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy người dùng',
    schema: { example: ResEx.auth.verifyEmailNotFound },
  })
  async verifyEmail(
    @Query('email') email: string,
    @Query('token') token: string,
  ) {
    return await this.authService.verifyEmailCustomer(token, email);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Lấy thông tin user hiện tại (Bearer hoặc cookie session)',
    operationId: 'auth_get_me',
  })
  @ApiOkResponse({
    description:
      'Ví dụ khi đã đăng nhập; khi không có session trả authenticated: false',
    schema: { example: ResEx.auth.me },
  })
  @ApiBearerAuth()
  async getCurrentUser(@Req() req: any) {
    const session = await this.sessionFromRequest(req);

    if (!session?.user) {
      return {
        success: false,
        authenticated: false,
        message: 'Not authenticated',
        user: null,
      };
    }

    const fullUser = await this.userServices.getUser(session.user.id);

    return {
      success: true,
      authenticated: true,
      user: fullUser ? this.mapUserResponse(fullUser) : session.user,
    };
  }

  @Get('session')
  @ApiOperation({
    summary: 'Lấy session (token, hết hạn, user)',
    operationId: 'auth_get_session',
  })
  @ApiOkResponse({
    description: 'Ví dụ khi có session',
    schema: { example: ResEx.auth.session },
  })
  @ApiBearerAuth()
  async getSession(@Req() req: any) {
    const session = await this.sessionFromRequest(req);

    if (!session?.session) {
      return {
        success: false,
        authenticated: false,
      };
    }

    return {
      success: true,
      authenticated: true,
      session: {
        token: session.session.token,
        expiresAt: session.session.expiresAt,
      },
      user: session.user,
    };
  }

  @Get('check')
  @ApiOperation({
    summary: 'Kiểm tra đã đăng nhập hay chưa',
    operationId: 'auth_check',
  })
  @ApiOkResponse({
    description: 'Ví dụ phản hồi',
    schema: { example: ResEx.auth.check },
  })
  @ApiBearerAuth()
  async checkAuth(@Req() req: any) {
    const session = await this.sessionFromRequest(req);
    if (!session?.user) {
      return {
        authenticated: false,
        user: null,
      };
    }
    return {
      authenticated: true,
      user: session.user,
    };
  }
}
