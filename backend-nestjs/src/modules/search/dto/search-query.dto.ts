import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  IsArray,
} from 'class-validator';
import {
  SEARCH_SORT,
  SEARCH_TIME,
  SEARCH_PROFILE_SORT,
  SEARCH_GROUP_FILTER,
  type SearchSort,
  type SearchTime,
  type SearchProfileSort,
  type SearchGroupFilter,
} from '../search.types';

export class SearchQueryDto {
  @ApiProperty({ description: 'Search keyword' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  query!: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 10;
}

export class SideBarSearchQueryDto {
  @ApiProperty({ description: 'Search keyword' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  query!: string;

  @ApiPropertyOptional({ enum: SEARCH_SORT, default: SEARCH_SORT.NEWEST })
  @IsOptional()
  @IsEnum(SEARCH_SORT)
  sort: SearchSort = SEARCH_SORT.NEWEST;

  @ApiPropertyOptional({ enum: SEARCH_TIME, default: SEARCH_TIME.ALL })
  @IsOptional()
  @IsEnum(SEARCH_TIME)
  time: SearchTime = SEARCH_TIME.ALL;
}

export class PostSearchQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: SEARCH_SORT, default: SEARCH_SORT.NEWEST })
  @IsOptional()
  @IsEnum(SEARCH_SORT)
  sort: SearchSort = SEARCH_SORT.NEWEST;

  @ApiPropertyOptional({ enum: SEARCH_TIME, default: SEARCH_TIME.ALL })
  @IsOptional()
  @IsEnum(SEARCH_TIME)
  time: SearchTime = SEARCH_TIME.ALL;
}

export class ProfileSearchQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: SEARCH_PROFILE_SORT, default: SEARCH_PROFILE_SORT.ALL })
  @IsOptional()
  @IsEnum(SEARCH_PROFILE_SORT)
  profileSort: SearchProfileSort = SEARCH_PROFILE_SORT.ALL;
}

export class GroupSearchQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: SEARCH_GROUP_FILTER, default: SEARCH_GROUP_FILTER.ALL })
  @IsOptional()
  @IsEnum(SEARCH_GROUP_FILTER)
  filter: SearchGroupFilter = SEARCH_GROUP_FILTER.ALL;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : []))
  languages?: string[];
}
