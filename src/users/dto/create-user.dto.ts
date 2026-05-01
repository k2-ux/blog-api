import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

// A DTO (Data Transfer Object) defines the shape of data coming INTO the API.
// It is NOT a database entity — it's a contract for what the client must send.
//
// class-validator decorators declare rules. The global ValidationPipe (set up
// in main.ts) runs these rules automatically before the controller method fires.
// If any rule fails, NestJS throws a 400 Bad Request with clear error messages.
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  // @MinLength(6) means the string must be at least 6 characters.
  @IsString()
  @MinLength(6)
  password: string;
}
