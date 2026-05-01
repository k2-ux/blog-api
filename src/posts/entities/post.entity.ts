import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  // 'text' maps to PostgreSQL TEXT type (unlimited length).
  // Default @Column() maps to VARCHAR(255).
  @Column('text')
  content: string;

  // @Column({ default: false }) sets the DB column default value.
  @Column({ default: false })
  published: boolean;

  // @ManyToOne defines the "many" side of the relation.
  // onDelete: 'CASCADE' means if a User is deleted, all their posts are deleted too.
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'authorId' }) tells TypeORM the FK column is named "authorId".
  // Without this, TypeORM would name it "authorId" by convention anyway, but
  // being explicit is good practice.
  @JoinColumn({ name: 'authorId' })
  author: User;

  // Exposing the raw FK column lets us query/filter by authorId without joining.
  @Column()
  authorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
