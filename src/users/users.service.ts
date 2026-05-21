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

  // FLOW STEP 3 — Called by UsersController.findAll() in users.controller.ts:31
  // usersRepository is a TypeORM Repository<User> injected via @InjectRepository(User).
  // The User entity (users/entities/user.entity.ts:13) tells TypeORM which table
  // and columns exist — it translates this into: SELECT * FROM "users"
  async findAll(): Promise<Omit<User, 'password'>[]> {
    // .find() with no args → fetches every row from the "users" table.
    // Each row is hydrated into a User entity instance using user.entity.ts.
    // Go to: src/users/entities/user.entity.ts:13 to see the column definitions.
    const users = await this.usersRepository.find();

    // Strip the password from every user before returning.
    // The mapped array travels back to users.controller.ts:36 → then to NestJS
    // which JSON-serializes it and sends it as the HTTP response body.
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    const { password, ...result } = user;
    return result;
  }

  // Returns the full User including password hash — only used by AuthService.login()
  // Never expose this to a controller response directly.
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Called by GoogleStrategy.validate() via AuthService.findOrCreateGoogleUser()
  // Looks up by googleId first, falls back to email (account linking),
  // creates a new user if neither exists.
  async findOrCreateGoogleUser(data: {
    googleId: string;
    email: string;
    name: string;
  }): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: [{ googleId: data.googleId }, { email: data.email }],
    });

    if (existing) {
      // If found by email but googleId not yet set, link the Google account
      if (!existing.googleId) {
        existing.googleId = data.googleId;
        return this.usersRepository.save(existing);
      }
      return existing;
    }

    const user = this.usersRepository.create({
      email: data.email,
      name: data.name,
      googleId: data.googleId,
      password: null,
    });
    return this.usersRepository.save(user);
  }
}
