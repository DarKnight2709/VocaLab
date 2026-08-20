import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3 } from '@aws-sdk/client-s3';

export const S3Provider: Provider = {
  provide: 'S3',
  useFactory: (configService: ConfigService) => {
      const region = configService.get("AWS_S3_REGION");
      const awsAccessKeyId = configService.get("AWS_ACCESS_KEY_ID");
      const awsSecretAccessKey = configService.get("AWS_SECRET_ACCESS_KEY");
    
      return new S3({
        region: region,
        credentials: {  
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
      });
  },
  inject: [ConfigService],
};
