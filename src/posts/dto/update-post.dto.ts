import { IsString, IsBoolean, IsOptional } from 'class-validator';

// UpdatePostDto only allows updating title, content, and published status.
// authorId is intentionally excluded — you shouldn't be able to reassign a post
// to a different author via a PATCH/PUT request.
//
// All fields are @IsOptional() so the client can send only what changed.
export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
