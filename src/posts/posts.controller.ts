import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

// @Controller('posts') — base route is /api/posts
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // POST /api/posts
  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  // GET /api/posts
  // GET /api/posts?authorId=<uuid>   ← optional filter
  // @Query('authorId') extracts the ?authorId= query string parameter.
  // It's typed as string | undefined — if not provided, it's undefined.
  @Get()
  findAll(@Query('authorId') authorId?: string) {
    return this.postsService.findAll(authorId);
  }

  // GET /api/posts/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  // PUT /api/posts/:id
  // PUT replaces the resource; we use it here as a partial update for simplicity.
  // In stricter REST you'd use PATCH for partial updates.
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto);
  }

  // DELETE /api/posts/:id
  // @HttpCode(HttpStatus.OK) sets the success response code to 200.
  // By default @Delete() returns 200, but being explicit is clearer.
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }
}
