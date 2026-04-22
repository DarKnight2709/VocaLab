import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class CreateBlogDto {
  @ApiProperty({ example: 'Cách dùng Present Perfect' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: '<p>Nội dung bài viết...</p>' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ example: 'Tóm tắt ngắn...', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ example: 'https://image.url', required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateBlogDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Bài viết rất hay!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}

export class UpdateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}

export class ReplyCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  reply!: string;
}


export class VoteBlogDto {
  @ApiProperty({ enum: VoteType, example: 'UPVOTE' })
  @IsEnum(VoteType)
  type!: VoteType;
}
