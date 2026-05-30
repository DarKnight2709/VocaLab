import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '@/common/services/cloudinary.service';
import { IsProtected } from '@/common/decorators/protected.decorator';
import { ErrorCode } from '@/common/enums/error-code.enum';

@ApiTags('upload')
@Controller('upload')
@IsProtected()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @ApiOperation({ summary: 'Tải lên một file (ảnh, video, v.v...)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(ErrorCode.UPLOAD_FILE_REQUIRED);
    }

    // Fix Multer's filename encoding issues (Latin-1 to UTF-8)
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    this.logger.log(`Uploading file: ${originalName} (${file.mimetype})`);

    const result = await this.cloudinaryService.uploadFile(file, originalName);

    let type = 'file';
    if (file.mimetype.startsWith('image/')) type = 'image';
    else if (file.mimetype.startsWith('video/')) type = 'video';
    else if (file.mimetype.startsWith('audio/')) type = 'audio';

    return {
      url: result.secure_url,
      type,
      name: originalName,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
