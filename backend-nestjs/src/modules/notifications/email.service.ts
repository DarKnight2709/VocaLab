import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@/common/services/config.service';
import { MessageAttachmentDto } from '../messages/dto/messages.dto';

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
}
