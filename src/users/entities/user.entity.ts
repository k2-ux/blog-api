import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';

// FLOW STEP 4 — TypeORM uses this class as a blueprint when executing queries.
// When usersRepository.find() runs (users.service.ts:56), TypeORM reads the
// decorators here to know: which table to query, which columns exist, and how
// to map each DB row back into a User object that JavaScript can work with.
// After mapping, the result flows back to users.service.ts:60 → controller → response.
//
// @Entity('users') tells TypeORM: this class maps to a DB table named "users".
@Entity('users')
export class User {
  // ! (definite assignment assertion) — TypeORM sets these values after construction,
  // not in a constructor, so we tell TypeScript to trust that they will be assigned.

  // @PrimaryGeneratedColumn('uuid') creates an auto-generated UUID primary key.
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @Column() maps a class property to a table column.
  // unique: true adds a UNIQUE constraint at the DB level.
  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  // nullable: true — Google-authenticated users don't have a password
  @Column({ nullable: true })
  password!: string | null;

  // Stores the Google account ID for users who sign in via Google OAuth.
  // null for users who registered with email/password.
  @Column({ nullable: true, unique: true })
  googleId!: string | null;

  // @OneToMany defines the "one" side of a one-to-many relation.
  // First arg: () => Post  — the related entity (arrow fn avoids circular import issues).
  // Second arg: (post) => post.author  — the inverse side on the Post entity.
  // This does NOT create a column here; TypeORM uses it for JOIN queries only.
  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  // @CreateDateColumn auto-sets this to NOW() on INSERT.
  @CreateDateColumn()
  createdAt!: Date;

  // @UpdateDateColumn auto-sets this to NOW() on every UPDATE.
  @UpdateDateColumn()
  updatedAt!: Date;
}
