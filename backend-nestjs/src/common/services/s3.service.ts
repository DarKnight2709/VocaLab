import { PutObjectCommand, S3 as S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from './config.service';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  constructor(
    private readonly configService: ConfigService,
    @Inject("S3")
    private readonly s3Client: S3Client,
  ) {}

  async uploadFile(file: Express.Multer.File, fileName?: string) {
    const bucketName = this.configService.get("AWS_BUCKET_NAME");
    const region = this.configService.get("AWS_S3_REGION");
    const uniqueFileName = `${Date.now()}-${fileName || file.originalname}`;
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueFileName}`;
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: uniqueFileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return { secure_url: fileUrl };
    } catch (error) {
      this.logger.error('Error uploading file', error);
    }
  }
}