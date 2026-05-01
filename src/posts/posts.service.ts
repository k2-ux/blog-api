import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(dto: CreatePostDto): Promise<Post> {
    // postsRepository.create() builds the entity in memory.
    // The authorId FK column will be set from dto.authorId.
    // TypeORM will raise a FK violation at DB level if the user doesn't exist.
    const post = this.postsRepository.create(dto);
    return this.postsRepository.save(post);
  }

  async findAll(authorId?: string): Promise<Post[]> {
    return this.postsRepository.find({
      // If authorId is provided (from ?authorId= query param), filter by it.
      // Otherwise `where: {}` returns all posts.
      where: authorId ? { authorId } : {},
      // relations: ['author'] tells TypeORM to JOIN the users table and
      // populate the `author` property on each Post object.
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return post;
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    // findOne already throws 404 if not found, so we reuse it.
    const post = await this.findOne(id);
    // Object.assign merges only the fields present in dto onto the entity.
    // Then save() issues an UPDATE for just this record.
    Object.assign(post, dto);
    return this.postsRepository.save(post);
  }

  async remove(id: string): Promise<{ message: string }> {
    const post = await this.findOne(id);
    // remove() deletes the entity. An alternative is delete({ id }) which
    // skips loading the entity first — faster but won't trigger TypeORM hooks.
    await this.postsRepository.remove(post);
    return { message: `Post #${id} deleted successfully` };
  }
}
