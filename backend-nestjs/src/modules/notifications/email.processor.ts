import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService } from './email.service';
import { EmailJobNames } from '@/common/enums/email-job-names.enum';
import { MessageAttachmentDto } from '../messages/dto/messages.dto';

/**
 * Data structure for the direct message email job
 */
export interface SendDirectMessageJobData {
  recipientEmail: string;
  senderName: string;
  content: string;
  attachments: MessageAttachmentDto[];
}

/**
 * Data structure for the group message email job
 */
export interface SendGroupMessageJobData {
  recipientEmail: string;
  senderName: string;
  groupName: string;
  content: string;
  attachments: MessageAttachmentDto[];
}

/**
 * Data structure for the comment/reply notification email job
 */
export interface CommentNotificationJobData {
  recipientEmail: string;
  senderName: string;
  senderUsername?: string;
  activityType: string;
  content: string;
  postTitle?: string;
  blogId?: string;
}

@Processor('email-notification')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);

    try {
      switch (job.name) {
        case EmailJobNames.SEND_DIRECT_MESSAGE_EMAIL: {
          const data: SendDirectMessageJobData = job.data;
          await this.emailService.sendDirectMessageEmail(
            data.recipientEmail,
            data.senderName,
            data.content,
            data.attachments,
          );
          break;
        }

        case EmailJobNames.SEND_GROUP_MESSAGE_EMAIL: {
          const data: SendGroupMessageJobData = job.data;
          await this.emailService.sendGroupMessageEmail(
            data.recipientEmail,
            data.senderName,
            data.groupName,
            data.content,
            data.attachments,
          );
          break;
        }

        case EmailJobNames.COMMENT_ON_POST_EMAIL:
        case EmailJobNames.REPLY_ON_COMMENT_EMAIL:
        case EmailJobNames.UPVOTE_ON_POST_EMAIL:
        case EmailJobNames.UPVOTE_ON_COMMENT_EMAIL:
        case EmailJobNames.NEW_BLOG_POST_EMAIL: {
          const data: CommentNotificationJobData = job.data;
          await this.emailService.sendActivityNotificationEmail(
            data.recipientEmail,
            data.senderName,
            data.activityType,
            data.content,
            data.postTitle,
            data.blogId,
            data.senderUsername,
          );
          break;
        }

        case EmailJobNames.NEW_FOLLOWER_EMAIL: {
          const data: CommentNotificationJobData = job.data;
          await this.emailService.sendFollowNotificationEmail(
            data.recipientEmail,
            data.senderName,
            data.activityType,
            data.senderUsername,
          );
          break;
        }

        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to process job ${job.id} (${job.name}): ${error.message}`, error.stack);
      throw error; // Rethrow to allow BullMQ to handle retries
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} (${job.name}) failed: ${error.message}`);
  }
}
