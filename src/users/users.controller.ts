import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

// @Controller('users') sets the base route prefix for all methods in this class.
// So @Get() here means GET /api/users, and @Get(':id') means GET /api/users/:id.
// (The /api prefix comes from app.setGlobalPrefix('api') in main.ts.)
@Controller('users')
export class UsersController {
  // NestJS injects UsersService automatically because it is listed in
  // the providers array of UsersModule. This is constructor injection.
  constructor(private readonly usersService: UsersService) {}

  // @Post() handles POST /api/users
  // @Body() extracts the JSON request body and maps it to CreateUserDto.
  // The ValidationPipe (global) validates the DTO before this method runs.
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // @Get() handles GET /api/users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // @Get(':id') handles GET /api/users/:id  (e.g. /api/users/some-uuid)
  // @Param('id') extracts the :id segment from the URL.
  // ParseUUIDPipe validates that the value is a valid UUID before it reaches the service.
  // If it's not a UUID, NestJS throws a 400 automatically.
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }
}
