import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@/common/services/config.service';
import { MessageAttachmentDto } from '@/modules/messages/dto/messages.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // This shortcut is the most reliable way to connect to Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  /**
   * Formats and delivers a notification email when a direct message is received offline.
   */
  async sendDirectMessageEmail(
    to: string,
    senderName: string,
    content: string,
    attachments: MessageAttachmentDto[],
  ): Promise<void> {
    const from = this.configService.get('EMAIL_FROM');
    const clientUrl = this.configService.get('CLIENT_URL');

    try {
      const attachmentListHtml =
        attachments && attachments.length > 0
          ? `
          <div style="margin-top: 15px; padding: 10px; background: #f9fafb; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; font-weight: bold;">Attachments:</p>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${attachments
                .map(
                  (att) => `
                <li style="margin-bottom: 5px;">
                  <a href="${att.url}" style="color: #4f46e5; text-decoration: none; font-size: 14px;">
                    📎 ${att.name || 'View Attachment'}
                  </a>
                </li>
              `,
                )
                .join('')}
            </ul>
          </div>
        `
          : '';

      const mailOptions = {
        from: `"VocaLab" <${from}>`,
        to,
        subject: `New message from ${senderName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #333;">You received a new message</h2>
            <p><strong>${senderName}</strong> sent you a message:</p>
            <blockquote style="background: #fdfdfd; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0; font-style: italic; color: #555;">
              ${content || (attachments?.length > 0 ? 'Sent an attachment' : 'No content')}
            </blockquote>
            
            ${attachmentListHtml}

            <p style="margin-top: 25px;">
              <a href="${clientUrl}/chat" 
                 style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                 Open VocaLab to Reply
              </a>
            </p>
          </div>
        `,
        attachments: attachments?.map((att) => ({
          filename: att.name || 'attachment',
          path: att.url,
          contentType: att.mimeType,
        })),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email successfully dispatched to ${to}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send email notification to ${to}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Formats and delivers a notification email when a group message is received offline.
   */
  async sendGroupMessageEmail(
    to: string,
    senderName: string,
    groupName: string,
    content: string,
    attachments: MessageAttachmentDto[],
  ): Promise<void> {
    const from = this.configService.get('EMAIL_FROM');
    const clientUrl = this.configService.get('CLIENT_URL');

    try {
      const attachmentListHtml =
        attachments && attachments.length > 0
          ? `
          <div style="margin-top: 15px; padding: 10px; background: #f9fafb; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; font-weight: bold;">Attachments:</p>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${attachments
                .map(
                  (att) => `
                <li style="margin-bottom: 5px;">
                  <a href="${att.url}" style="color: #4f46e5; text-decoration: none; font-size: 14px;">
                    📎 ${att.name || 'View Attachment'}
                  </a>
                </li>
              `,
                )
                .join('')}
            </ul>
          </div>
        `
          : '';

      const mailOptions = {
        from: `"VocaLab" <${from}>`,
        to,
        subject: `New message from ${senderName} in ${groupName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #333;">New message in ${groupName}</h2>
            <p><strong>${senderName}</strong> sent a message to the group:</p>
            <blockquote style="background: #fdfdfd; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0; font-style: italic; color: #555;">
              ${content || (attachments?.length > 0 ? 'Sent an attachment' : 'No content')}
            </blockquote>
            
            ${attachmentListHtml}

            <p style="margin-top: 25px;">
              <a href="${clientUrl}/chat" 
                 style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                 Open Group Chat
              </a>
            </p>
          </div>
        `,
        attachments: attachments?.map((att) => {
          let extension = att.url.split('.').pop()?.split(/[?#]/)[0];
          const mimeMap: Record<string, string> = {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-excel': 'xls',
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'text/csv': 'csv',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'audio/mpeg': 'mp3',
            'video/mp4': 'mp4',
          };
          if (!extension || extension.length > 4 || !/^[a-z0-9]+$/i.test(extension)) {
            extension = mimeMap[att.mimeType || ''] || '';
          }
          let filename = att.name || `attachment-${Date.now()}`;
          if (extension && !filename.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) {
            filename = `${filename}.${extension}`;
          }
          return {
            filename,
            path: att.url,
            contentType: att.mimeType,
          };
        }),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Group email dispatched to ${to} for group ${groupName}`);
    } catch (error: any) {
      this.logger.error(`Failed to send group email to ${to}`, error.stack);
      throw error;
    }
  }

  /**
   * Formats and delivers a notification email for blog activities (comments, replies, upvotes).
   */
  async sendActivityNotificationEmail(
    to: string,
    senderName: string,
    activityType: string,
    content: string,
    postTitle?: string,
    blogId?: string,
    senderUsername?: string,
  ): Promise<void> {
    const from = this.configService.get('EMAIL_FROM');
    const clientUrl = this.configService.get('CLIENT_URL');

    try {
      const isNewPost = activityType === 'posted new content';
      const subject = isNewPost
        ? `${senderName} published a new post: ${postTitle}`
        : postTitle
          ? `${senderName} ${activityType} on your post: ${postTitle}`
          : `${senderName} ${activityType}`;

      const title = isNewPost
        ? 'New post from someone you follow'
        : 'New activity on VocaLab';

      const bodyPrefix = isNewPost
        ? `<strong>${senderName}</strong> published a new post`
        : `<strong>${senderName}</strong> ${activityType}${postTitle ? ` on <strong>${postTitle}</strong>` : ''}`;

      const viewUrl = blogId 
        ? `${clientUrl}/blogs/${blogId}` 
        : senderUsername
          ? `${clientUrl}/profile/${senderUsername}`
          : `${clientUrl}/blog`;

      const mailOptions = {
        from: `"VocaLab" <${from}>`,
        to,
        subject,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #333;">${title}</h2>
            <p>${bodyPrefix}:</p>
            <blockquote style="background: #fdfdfd; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0; font-style: italic; color: #555;">
              ${content}
            </blockquote>
            
            <p style="margin-top: 25px;">
              <a href="${viewUrl}" 
                 style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                 View Activity
              </a>
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Activity email successfully dispatched to ${to}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send activity email notification to ${to}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Formats and delivers a notification email when a new follower is gained.
   */
  async sendFollowNotificationEmail(
    to: string,
    senderName: string,
    activityType: string,
    senderUsername?: string,
  ): Promise<void> {
    const from = this.configService.get('EMAIL_FROM');
    const clientUrl = this.configService.get('CLIENT_URL');

    try {
      const mailOptions = {
        from: `"VocaLab" <${from}>`,
        to,
        subject: `${senderName} ${activityType}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #333;">New follower on VocaLab</h2>
            <p><strong>${senderName}</strong> ${activityType}!</p>
            
            <p style="margin-top: 25px;">
              <a href="${clientUrl}/profile/${senderUsername || senderName}" 
                 style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                 View Profile
              </a>
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Follow email successfully dispatched to ${to}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send follow email notification to ${to}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Dispatches an urgent security alert email when multiple failed 2FA attempts are detected.
   */
  async sendSecurityAlertEmail(
    to: string,
    recipientName: string,
    details: {
      ipAddress?: string;
      userAgent?: string;
      attemptCount: number;
      time: Date;
    },
  ): Promise<void> {
    const from = this.configService.get('EMAIL_FROM');
    const clientUrl = this.configService.get('CLIENT_URL');

    const formattedTime = new Date(details.time).toUTCString();
    const changePasswordUrl = `${clientUrl}/setting/me/account`;

    try {
      const mailOptions = {
        from: `"VocaLab Security" <${from}>`,
        to,
        subject: `🚨 Security Alert: Failed 2FA Login Attempts on Your VocaLab Account`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; max-width: 600px; margin: auto; border: 1px solid #fee2e2; border-radius: 12px; background-color: #ffffff;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <h2 style="color: #dc2626; margin: 0; font-size: 20px;">⚠️ Urgent Security Notification</h2>
            </div>
            
            <p style="color: #374151; font-size: 15px; line-height: 1.5;">
              Hi <strong>${recipientName}</strong>,
            </p>

            <p style="color: #374151; font-size: 15px; line-height: 1.5;">
              We detected <strong>${details.attemptCount} consecutive failed two-factor authentication (2FA) attempts</strong> for your account following a successful password entry.
            </p>

            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="color: #991b1b; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Incident Details</h3>
              <table style="width: 100%; font-size: 14px; color: #4b5563; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; width: 120px; font-weight: 600;">Time:</td>
                  <td style="padding: 4px 0; color: #1f2937;">${formattedTime}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 600;">IP Address:</td>
                  <td style="padding: 4px 0; color: #1f2937;">${details.ipAddress || 'Unknown'}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 600;">Device / Agent:</td>
                  <td style="padding: 4px 0; color: #1f2937;">${details.userAgent || 'Unknown'}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.4;">
                <strong>⚠️ Why are you receiving this?</strong><br/>
                Your correct password was entered, but the second factor verification failed. If this was not you, someone may have compromised your password.
              </p>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${changePasswordUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
                 Secure Account & Change Password
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
              If this was you, you can safely ignore this email. However, we recommend checking your authenticator app to ensure your device time is synchronized.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Security alert email successfully dispatched to ${to}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send security alert email to ${to}`,
        error.stack,
      );
      throw error;
    }
  }
}
