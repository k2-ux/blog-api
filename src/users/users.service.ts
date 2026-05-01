import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

// @Injectable() marks this class as a provider that NestJS's DI container
// can instantiate and inject elsewhere. Without it, the class cannot be injected.
@Injectable()
export class UsersService {
  // Constructor injection: NestJS sees the type annotation `Repository<User>`
  // and knows to inject the TypeORM repository for the User entity.
  // @InjectRepository(User) is required because Repository<User> is a generic
  // type — at runtime generics are erased, so we need the decorator to tell
  // NestJS which entity's repository to inject.
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Check for duplicate email before trying to insert.
    // findOne returns null if not found — no exception thrown.
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      // ConflictException maps to HTTP 409.
      // NestJS has built-in exceptions for every common HTTP status code.
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // .create() builds an entity instance from a plain object (does NOT hit DB).
    // .save() persists it and returns the saved entity (with id, timestamps, etc.).
    const user = this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });
    const saved = await this.usersRepository.save(user);

    // Never return the password — destructure it out.
    const { password, ...result } = saved;
    return result;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find();
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      // NotFoundException maps to HTTP 404.
      throw new NotFoundException(`User #${id} not found`);
    }
    const { password, ...result } = user;
    return result;
  }
}
