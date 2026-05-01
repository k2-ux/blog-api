import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  // @IsOptional() means the field may be absent entirely.
  // If present, @IsBoolean() still validates it.
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  // @IsUUID() validates that the string is a valid UUID v4.
  // This ensures the client sends a real user ID, not garbage.
  @IsUUID()
  authorId: string;
}
