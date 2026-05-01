import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  // TypeOrmModule.forFeature([User]) registers the User repository for this module.
  // It makes Repository<User> available for injection via @InjectRepository(User).
  // Think of forRoot() as "set up the DB connection once" and
  // forFeature() as "give me the repository for this specific entity".
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  // exports: [UsersService] makes UsersService available to any module that imports UsersModule.
  // Without this, other modules cannot inject UsersService even if they import UsersModule.
  exports: [UsersService],
})
export class UsersModule {}
