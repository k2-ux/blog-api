import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';

// @Entity('users') tells TypeORM: this class maps to a DB table named "users".
// Without the argument it would use the class name lowercased.
@Entity('users')
export class User {
  // @PrimaryGeneratedColumn('uuid') creates an auto-generated UUID primary key.
  // Alternatives: 'increment' for integer IDs (1, 2, 3…).
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column() maps a class property to a table column.
  // unique: true adds a UNIQUE constraint at the DB level.
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  // The password is stored hashed. We exclude it from responses in the service.
  @Column()
  password: string;

  // @OneToMany defines the "one" side of a one-to-many relation.
  // First arg: () => Post  — the related entity (arrow fn avoids circular import issues).
  // Second arg: (post) => post.author  — the inverse side on the Post entity.
  // This does NOT create a column here; TypeORM uses it for JOIN queries only.
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  // @CreateDateColumn auto-sets this to NOW() on INSERT.
  @CreateDateColumn()
  createdAt: Date;

  // @UpdateDateColumn auto-sets this to NOW() on every UPDATE.
  @UpdateDateColumn()
  updatedAt: Date;
}
