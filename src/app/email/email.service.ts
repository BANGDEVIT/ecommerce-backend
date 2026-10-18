import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/** Dữ liệu để dựng 1 email giao dịch (xác minh, đặt lại mật khẩu, ...) */
interface EmailLayoutOptions {
  preheader: string; // dòng xem trước hiện cạnh tiêu đề trong hộp thư (Gmail, Outlook)
  heading: string;
  name: string;
  paragraphs: string[];
  buttonText: string;
  buttonColor: string;
  url: string;
  expiryNote: string;
  ignoreNote: string;
}

/** Tên cửa hàng hiển thị trong email */
const BRAND_NAME = 'Ecommerce Store';

/**
 * Thời hạn của link — PHẢI khớp với cấu hình Better Auth ở frontend (auth.ts):
 * - emailVerification.expiresIn = 24 * 60 * 60  → 24 giờ
 * - resetPasswordTokenExpiresIn mặc định = 3600  → 1 giờ
 */
const VERIFY_LINK_EXPIRY = '24 giờ';
const RESET_LINK_EXPIRY = '1 giờ';

/**
 * Escape ký tự HTML đặc biệt.
 * Tên user do người dùng tự nhập lúc đăng ký, nếu chèn thẳng vào HTML
 * thì có thể bị chèn thẻ <a>, <img>... giả mạo vào email (HTML injection).
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter; // một đối tượng vận chuyển có khả năng gửi mail

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(EmailService.name);
    this.createTransporter(); // tạo transporter ngay lúc vừa mới khởi tạo Email Service
  }

  private createTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    // Biết là Promise nhưng không cần chờ, nếu nó thành công thì xong thôi còn thất bại thì báo logger
    void this.verifyConnection(); // dùng void để hàm tự chạy ngầm mà không cần dùng await (vì không cần chờ)
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify(); // nodemailer xác minh xem có đăng nhập SMTP đúng không
      this.logger.info({ msg: 'Email.smtp.connected' });
      return true;
    } catch (error) {
      this.logger.error({
        msg: 'Email.smtp.connectedFailed',
        error: (error as Error).message,
      });
      return false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || this.configService.get<string>('SMTP_FROM'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = (await this.transporter.sendMail(
        mailOptions,
      )) as unknown as {
        messageId: string;
      };

      this.logger.info({
        msg: 'email.sent',
        messageId: info.messageId,
        subject: options.subject,
      });

      return true;
    } catch (error) {
      this.logger.error({
        msg: 'email.sendFailed',
        subject: options.subject,
        error: (error as Error).message,
      });
      return false;
    }
  }

  async sendVerificationEmail(
    to: string, // email người nhận
    name: string, // tên người dùng
    url: string, // đường dẫn xác minh tài khoản
  ): Promise<boolean> {
    const subject = `Xác thực email tài khoản ${BRAND_NAME}`;
    const layout: EmailLayoutOptions = {
      preheader: 'Chỉ còn một bước nữa để kích hoạt tài khoản của bạn.',
      heading: 'Xác thực địa chỉ email',
      name,
      paragraphs: [
        `Cảm ơn bạn đã đăng ký tài khoản tại ${BRAND_NAME}!`,
        'Vui lòng bấm nút bên dưới để xác thực email và hoàn tất quá trình đăng ký. Sau khi xác thực, bạn có thể đăng nhập và bắt đầu mua sắm.',
      ],
      buttonText: 'Xác thực email',
      buttonColor: '#16a34a',
      url,
      expiryNote: `Link xác thực có hiệu lực trong ${VERIFY_LINK_EXPIRY}. Nếu link hết hạn, bạn có thể yêu cầu gửi lại email xác thực từ trang đăng nhập.`,
      ignoreNote:
        'Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email. Sẽ không có tài khoản nào được kích hoạt.',
    };

    return this.sendEmail({
      to,
      subject,
      html: this.renderLayout(layout),
      text: this.renderText(layout),
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    url: string, // đường dẫn đặt lại mật khẩu
  ): Promise<boolean> {
    const subject = `Đặt lại mật khẩu ${BRAND_NAME}`;
    const layout: EmailLayoutOptions = {
      preheader:
        'Bạn vừa yêu cầu đặt lại mật khẩu. Link có hiệu lực trong 1 giờ.',
      heading: 'Đặt lại mật khẩu',
      name,
      paragraphs: [
        'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.',
        'Bấm nút bên dưới để tạo mật khẩu mới.',
      ],
      buttonText: 'Đặt lại mật khẩu',
      buttonColor: '#2563eb',
      url,
      expiryNote: `Vì lý do bảo mật, link chỉ có hiệu lực trong ${RESET_LINK_EXPIRY} và chỉ dùng được một lần.`,
      ignoreNote:
        'Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu hiện tại của bạn vẫn giữ nguyên. Nếu bạn nhận được nhiều email như thế này mà không yêu cầu, hãy đổi mật khẩu để bảo vệ tài khoản.',
    };

    return this.sendEmail({
      to,
      subject,
      html: this.renderLayout(layout),
      text: this.renderText(layout),
    });
  }

  /**
   * Dựng HTML email theo bố cục dùng chung.
   * Dùng <table> + style inline vì nhiều trình đọc mail (Gmail, Outlook)
   * không hỗ trợ flexbox, grid hay thẻ <style> đầy đủ.
   */
  private renderLayout(o: EmailLayoutOptions): string {
    const safeName = escapeHtml(o.name || 'bạn');
    const safeUrl = escapeHtml(o.url);
    const year = new Date().getFullYear();

    const paragraphs = o.paragraphs
      .map(
        (p) =>
          `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#374151;">${escapeHtml(p)}</p>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(o.heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <!-- Preheader: dòng xem trước trong hộp thư, ẩn khi mở email -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#f3f4f6;">
    ${escapeHtml(o.preheader)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td style="background-color:#111827;padding:24px 32px;">
              <span style="font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">${BRAND_NAME}</span>
            </td>
          </tr>

          <!-- Nội dung -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 24px;font-size:22px;line-height:30px;color:#111827;">${escapeHtml(o.heading)}</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#374151;">Xin chào <strong>${safeName}</strong>,</p>
              ${paragraphs}

              <!-- Nút bấm -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px auto 24px;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:${o.buttonColor};">
                    <a href="${safeUrl}" target="_blank"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">
                      ${escapeHtml(o.buttonText)}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Lưu ý thời hạn -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#fef9c3;border-left:4px solid #eab308;border-radius:6px;padding:12px 16px;font-size:14px;line-height:22px;color:#713f12;">
                    ⏱ ${escapeHtml(o.expiryNote)}
                  </td>
                </tr>
              </table>

              <!-- Link dự phòng khi nút không bấm được -->
              <p style="margin:0 0 8px;font-size:13px;line-height:20px;color:#6b7280;">
                Nếu nút không hoạt động, hãy sao chép đường dẫn sau và dán vào trình duyệt:
              </p>
              <p style="margin:0 0 24px;font-size:13px;line-height:20px;word-break:break-all;">
                <a href="${safeUrl}" target="_blank" style="color:#2563eb;text-decoration:underline;">${safeUrl}</a>
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <p style="margin:0 0 24px;font-size:13px;line-height:20px;color:#6b7280;">${escapeHtml(o.ignoreNote)}</p>

              <p style="margin:0;font-size:15px;line-height:24px;color:#374151;">
                Trân trọng,<br />
                <strong>Đội ngũ ${BRAND_NAME}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:12px;line-height:18px;color:#9ca3af;text-align:center;">
                Đây là email tự động, vui lòng không trả lời email này.
              </p>
              <p style="margin:0;font-size:12px;line-height:18px;color:#9ca3af;text-align:center;">
                © ${year} ${BRAND_NAME}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Bản text thuần đi kèm HTML.
   * Trình đọc mail không hiển thị được HTML sẽ dùng bản này,
   * và có bản text giúp email ít bị đánh dấu spam hơn.
   */
  private renderText(o: EmailLayoutOptions): string {
    return [
      `Xin chào ${o.name || 'bạn'},`,
      '',
      ...o.paragraphs,
      '',
      `${o.buttonText}: ${o.url}`,
      '',
      o.expiryNote,
      '',
      o.ignoreNote,
      '',
      'Trân trọng,',
      `Đội ngũ ${BRAND_NAME}`,
      '',
      'Đây là email tự động, vui lòng không trả lời email này.',
    ].join('\n');
  }
}
