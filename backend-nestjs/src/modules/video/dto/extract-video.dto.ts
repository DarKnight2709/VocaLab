import { IsNotEmpty, IsUrl } from 'class-validator';

export class ExtractVideoDto {
  @IsNotEmpty()
  @IsUrl()
  url!: string;
}
