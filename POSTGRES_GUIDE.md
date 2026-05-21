# PostgreSQL + NestJS + TypeORM + Docker — সম্পূর্ণ গাইড (বাংলায়)

এই গাইডটি এই blog API প্রজেক্টের উদাহরণ ব্যবহার করে শুরু থেকে সব কিছু ব্যাখ্যা করবে।
শুধু "কী করতে হবে" না, "কেন করতে হবে" সেটাও বুঝবে।

---

## সূচিপত্র

1. [PostgreSQL কী এবং কেন ব্যবহার করব?](#১-postgresql-কী-এবং-কেন-ব্যবহার-করব)
2. [Docker দিয়ে PostgreSQL চালানো](#২-docker-দিয়ে-postgresql-চালানো)
3. [NestJS-কে PostgreSQL-এর সাথে যুক্ত করা](#৩-nestjs-কে-postgresql-এর-সাথে-যুক্ত-করা)
4. [TypeORM কী?](#৪-typeorm-কী)
5. [Entity — ক্লাসকে টেবিলে রূপান্তর](#৫-entity--ক্লাসকে-টেবিলে-রূপান্তর)
6. [Relation — টেবিলগুলো কীভাবে একে অপরের সাথে যুক্ত](#৬-relation--টেবিলগুলো-কীভাবে-একে-অপরের-সাথে-যুক্ত)
7. [Repository — ডেটাবেজে কথা বলার উপায়](#৭-repository--ডেটাবেজে-কথা-বলার-উপায়)
8. [Migration — Schema পরিবর্তনের সঠিক পদ্ধতি](#৮-migration--schema-পরিবর্তনের-সঠিক-পদ্ধতি)
9. [DTO এবং Validation](#৯-dto-এবং-validation)
10. [সাধারণ প্যাটার্ন ও সতর্কতা](#১০-সাধারণ-প্যাটার্ন-ও-সতর্কতা)
11. [Quick Reference](#১১-quick-reference)

---

## ১. PostgreSQL কী এবং কেন ব্যবহার করব?

PostgreSQL (সংক্ষেপে "Postgres") হলো একটি **relational database**। মানে ডেটা **টেবিলে** থাকে — অনেকটা Excel spreadsheet-এর মতো — এবং টেবিলগুলো **foreign key** দিয়ে একে অপরের সাথে যুক্ত থাকতে পারে।

এই প্রজেক্টে দুইটি টেবিল আছে: `users` এবং `posts`।

```
┌─────────────── users টেবিল ───────────────┐
│                                             │
│  id (UUID)          │ name    │ email       │
│ ────────────────────┼─────────┼─────────── │
│  uuid-alice-001     │ Alice   │ a@mail.com  │
│  uuid-bob-002       │ Bob     │ b@mail.com  │
│                                             │
└─────────────────────────────────────────────┘
           ▲                  ▲
           │                  │
           │ authorId         │ authorId
           │ (foreign key)    │ (foreign key)
           │                  │
┌──────────┴──────────────────┴──── posts টেবিল ─────────────────────┐
│                                                                       │
│  id (UUID)     │ title            │ authorId        │ published      │
│ ───────────────┼──────────────────┼─────────────────┼────────────── │
│  uuid-post-1   │ "Hello World"    │ uuid-alice-001  │ true           │
│  uuid-post-2   │ "TypeORM 101"    │ uuid-alice-001  │ false          │
│  uuid-post-3   │ "Docker Tips"    │ uuid-bob-002    │ true           │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

`posts` টেবিলের `authorId` কলামটি `users` টেবিলের `id`-কে **নির্দেশ করে**।
এই কারণে বলা যায়: Alice-এর দুইটি পোস্ট আছে, Bob-এর একটি।

**Postgres কেন বেছে নেওয়া হলো?**
- JSON সাপোর্ট, full-text search, এবং advanced data types আছে
- Node.js production app-এর জন্য industry standard
- TypeORM-এর সাথে দারুণ কাজ করে
- বিনামূল্যে এবং open source

---

## ২. Docker দিয়ে PostgreSQL চালানো

### Docker কেন দরকার?

Docker ছাড়া প্রতিটি developer-কে নিজের মেশিনে Postgres install করতে হতো, একই ভাবে configure করতে হতো, অন্য প্রজেক্টের সাথে conflict এড়াতে হতো।

Docker এই সমস্যা সমাধান করে: এটি Postgres-কে একটি **container**-এর ভেতরে চালায় — একটি বিচ্ছিন্ন, হালকা পরিবেশ।

### তোমার `docker-compose.yml` ব্যাখ্যা

```yaml
services:
  postgres:
    image: postgres:16-alpine          # Postgres version 16, alpine = ছোট সাইজের image
    container_name: blog-api-postgres  # container-এর নাম
    environment:
      POSTGRES_USER: blog_user         # DB username
      POSTGRES_PASSWORD: blog_pass     # DB password
      POSTGRES_DB: blog_api            # DB নাম (স্বয়ংক্রিয়ভাবে তৈরি হয়)
    ports:
      - "5433:5432"                    # host_port:container_port
    volumes:
      - blog_api_pgdata:/var/lib/postgresql/data  # ডেটা persist করার জন্য

volumes:
  blog_api_pgdata:                     # Docker এই volume পরিচালনা করে
```

### Port Mapping বোঝা

`5433:5432` মানে কী? এটাই সবচেয়ে গুরুত্বপূর্ণ অংশ।

```
তোমার মেশিন (Host)          Docker Container
┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │
│  NestJS App      │         │   PostgreSQL      │
│  (port 3000)     │         │   (port 5432)    │
│                  │         │                  │
│  port 5433 ──────┼────────►│  port 5432       │
│                  │  mapping│                  │
└──────────────────┘         └──────────────────┘
```

- Docker container-এর ভেতরে Postgres সবসময় `5432`-এ থাকে
- তোমার মেশিনে এটি `5433`-এ exposed হয়
- এতে তোমার মেশিনে যদি আগে থেকে Postgres `5432`-এ চলে, conflict হয় না
- `.env`-এ `DB_PORT=5433` আছে কারণ app host port দিয়ে connect করে

### সাধারণ Docker কমান্ড

```bash
# ডেটাবেজ চালু করো (প্রজেক্ট root থেকে)
docker compose up -d

# বন্ধ করো (ডেটা volume-এ থাকবে)
docker compose down

# বন্ধ করো এবং সব ডেটা মুছে ফেলো (fresh start)
docker compose down -v

# চলছে কিনা দেখো
docker compose ps

# Postgres logs দেখো
docker compose logs postgres

# Container-এর ভেতরে psql shell খোলো
docker exec -it blog-api-postgres psql -U blog_user -d blog_api
```

### psql — Postgres CLI

`psql`-এ ঢুকে সরাসরি SQL চালানো যায়:

```sql
-- সব টেবিল দেখো
\dt

-- users টেবিলের structure দেখো
\d users

-- সব user দেখো
SELECT * FROM users;

-- পোস্ট এবং লেখকের নাম একসাথে দেখো
SELECT p.title, u.name AS author
FROM posts p
JOIN users u ON p."authorId" = u.id;

-- বের হও
\q
```

---

## ৩. NestJS-কে PostgreSQL-এর সাথে যুক্ত করা

### Environment Variables

`.env` ফাইলে connection-এর বিস্তারিত থাকে:

```
DB_HOST=localhost
DB_PORT=5433
DB_USER=blog_user
DB_PASS=blog_pass
DB_NAME=blog_api
```

এই মান গুলো কখনো সরাসরি source file-এ লিখবে না। `.env` ফাইল `.gitignore`-এ থাকা আবশ্যক, নাহলে credentials GitHub-এ উন্মুক্ত হয়ে যায়।

### ConfigModule — .env লোড করা

[src/app.module.ts](src/app.module.ts)-এ `ConfigModule.forRoot({ isGlobal: true })` `.env` পড়ে এবং সব variable-কে পুরো app-এ `ConfigService`-এর মাধ্যমে পাওয়া যায়।

```typescript
ConfigModule.forRoot({ isGlobal: true })
// isGlobal: true মানে প্রতিটি module-এ আলাদা import করতে হবে না
```

### TypeOrmModule.forRootAsync — DB Connection

এটি app-এর সবচেয়ে গুরুত্বপূর্ণ configuration:

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get('DB_HOST'),        // .env থেকে DB_HOST পড়ে
    port: config.get<number>('DB_PORT'),
    username: config.get('DB_USER'),
    password: config.get('DB_PASS'),
    database: config.get('DB_NAME'),
    autoLoadEntities: true,             // সব .entity.ts ফাইল স্বয়ংক্রিয়ভাবে খোঁজে
    synchronize: false,                 // production-এ এটি কখনো true করবে না
  }),
  inject: [ConfigService],
})
```

**`forRootAsync` কেন, `forRoot` কেন নয়?**

`forRoot` তাৎক্ষণিকভাবে config চায়। কিন্তু `ConfigService` (যেটি `.env` পড়ে) NestJS-এর dependency injection system চালু হওয়ার পরে ready হয়। `forRootAsync` `ConfigService` inject হওয়া পর্যন্ত অপেক্ষা করে।

**`synchronize: false` কেন?**

`synchronize: true` হলে app চালু হওয়ার সময় TypeORM নিজে থেকে DB টেবিল পরিবর্তন করে entity-র সাথে মেলানোর চেষ্টা করে। এটি বিপজ্জনক কারণ:

```
তুমি entity-তে  name  ফিল্ড rename করলে  fullName  তে
                              ↓
TypeORM ভাবে:  name  কলাম নেই, নতুন  fullName  কলাম লাগবে
                              ↓
DB থেকে  name  কলাম DROP করে দেয় — সব ডেটা শেষ!
                              ↓
নতুন ফাঁকা  fullName  কলাম তৈরি করে
```

এই সমস্যার সমাধান হলো **Migration** (section ৮-এ বিস্তারিত)।

---

## ৪. TypeORM কী?

TypeORM হলো একটি **Object-Relational Mapper (ORM)**। এটি তোমাকে DB row-কে JavaScript/TypeScript **class instance** হিসেবে কাজ করতে দেয় — raw SQL লিখতে হয় না।

```
TypeORM ছাড়া (raw SQL):
──────────────────────────────────────────────────────────────────────
const result = await pool.query(
  'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING *',
  [dto.email, dto.name, hashedPassword]
);
const user = result.rows[0];
──────────────────────────────────────────────────────────────────────
সমস্যা: type safety নেই, typo হলে runtime-এ ভাঙে, refactor কঠিন


TypeORM সহ:
──────────────────────────────────────────────────────────────────────
const user = this.usersRepo.create({ email: dto.email, name: dto.name, password: hashed });
await this.usersRepo.save(user);
──────────────────────────────────────────────────────────────────────
সুবিধা: type-safe, IDE autocomplete পাওয়া যায়, SQL TypeORM নিজে লেখে
```

TypeORM দ্বিতীয় উদাহরণটিকে প্রথমটিতে রূপান্তরিত করে নিজে থেকে।

---

## ৫. Entity — ক্লাসকে টেবিলে রূপান্তর

**Entity** হলো TypeScript class যেটিতে TypeORM decorator ব্যবহার করা হয়। প্রতিটি class একটি টেবিলের সাথে মেলে, প্রতিটি property একটি কলামের সাথে মেলে।

### User Entity

```typescript
// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('users')       // এই class-টি "users" টেবিলের সাথে মেলে
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;
  // PostgreSQL নিজে UUID তৈরি করে INSERT-এর সময়
  // UUID দেখতে এরকম: "550e8400-e29b-41d4-a716-446655440000"
  // Auto-increment integer (1, 2, 3...) থেকে নিরাপদ কারণ guess করা যায় না

  @Column({ unique: true })
  email: string;
  // unique: true মানে DB level-এ duplicate email reject হবে

  @Column()
  name: string;

  @Column()
  password: string;
  // এখানে সবসময় HASHED password থাকে, কখনো plain text না

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
  // এটি real কলাম না — TypeORM relation বোঝার জন্য ব্যবহার করে

  @CreateDateColumn()
  createdAt: Date;
  // row প্রথম INSERT-এর সময় স্বয়ংক্রিয়ভাবে NOW() সেট হয়

  @UpdateDateColumn()
  updatedAt: Date;
  // প্রতিবার save() করলে স্বয়ংক্রিয়ভাবে NOW()-এ আপডেট হয়
}
```

### Post Entity

```typescript
// src/posts/entities/post.entity.ts
@Entity('posts')
export class Post {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;
  // type: 'text' = সীমাহীন দৈর্ঘ্য
  // default 'varchar' সর্বোচ্চ ২৫৫ character নেয়

  @Column({ default: false })
  published: boolean;
  // নতুন পোস্ট default-এ draft থাকে

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  author: User;
  // অনেক পোস্ট → একজন user
  // onDelete: 'CASCADE' মানে user delete হলে তার সব পোস্টও delete হবে

  @Column()
  authorId: string;
  // DB-তে actual FK কলাম
  // এটি explicitly রাখা হয়েছে যাতে author object load না করেও filter করা যায়

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Entity থেকে কোন SQL তৈরি হয়

```sql
-- TypeORM এই SQL তৈরি করে (migration-এর মাধ্যমে apply হয়)

CREATE TABLE "users" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email"     VARCHAR NOT NULL UNIQUE,
  "name"      VARCHAR NOT NULL,
  "password"  VARCHAR NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "posts" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title"     VARCHAR NOT NULL,
  "content"   TEXT NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "authorId"  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Decorator সারসংক্ষেপ

| Decorator | কী করে |
|---|---|
| `@Entity('tableName')` | class-কে DB টেবিল হিসেবে চিহ্নিত করে |
| `@PrimaryGeneratedColumn('uuid')` | Auto-generated UUID primary key |
| `@Column()` | সাধারণ NOT NULL কলাম |
| `@Column({ nullable: true })` | NULL রাখা যাবে এমন কলাম |
| `@Column({ unique: true })` | UNIQUE constraint-সহ কলাম |
| `@Column({ default: value })` | Default মান-সহ কলাম |
| `@Column({ type: 'text' })` | নির্দিষ্ট Postgres type |
| `@CreateDateColumn()` | INSERT-এ স্বয়ংক্রিয়ভাবে সেট হয় |
| `@UpdateDateColumn()` | প্রতিটি UPDATE-এ স্বয়ংক্রিয়ভাবে সেট হয় |
| `@OneToMany(...)` | One-to-many relation (কলাম তৈরি হয় না) |
| `@ManyToOne(...)` | Many-to-one relation (FK কলাম তৈরি হয়) |

---

## ৬. Relation — টেবিলগুলো কীভাবে একে অপরের সাথে যুক্ত

এটি প্রায়ই সবচেয়ে confusing অংশ। ধাপে ধাপে বুঝি।

### সম্পর্কটা কেমন: User ↔ Posts

```
একজন User   লিখতে পারে   অনেক Post
অনেক Post   belong করে   একজন User-এর কাছে
```

এটাকে বলে **One-to-Many / Many-to-One** সম্পর্ক।

DB-তে এটি implement হয় **foreign key** দিয়ে:

```
users টেবিল                          posts টেবিল
┌──────────────────────────┐         ┌──────────────────────────────────────┐
│ id           │ name      │         │ id           │ title      │ authorId  │
│ ─────────────┼────────── │         │ ─────────────┼────────────┼───────── │
│ uuid-alice   │ Alice     │◄──┬─────│ uuid-post-1  │ Hello      │ uuid-alice│
│ uuid-bob     │ Bob       │   └─────│ uuid-post-2  │ TypeORM    │ uuid-alice│
└──────────────────────────┘    ┌────│ uuid-post-3  │ Docker     │ uuid-bob  │
                                 │   └──────────────────────────────────────┘
                 uuid-bob ◄──────┘

posts.authorId কলামটি users.id-কে নির্দেশ করে
```

### TypeORM-এ Relation declare করা

**User side (the "one" — একজন user)-এ:**
```typescript
@OneToMany(() => Post, (post) => post.author)
posts: Post[];
// () => Post   → related entity class
// (post) => post.author  → Post-এ কোন property-টি inverse side
```

**Post side (the "many" — অনেক post)-এ:**
```typescript
@ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
author: User;
// { onDelete: 'CASCADE' } → user delete হলে তার সব post delete হয়

@Column()
authorId: string;
// Postgres-এ actual FK কলাম
```

### Query-তে Relation load করা

Relation **স্বয়ংক্রিয়ভাবে load হয় না** — explicitly বলতে হয়:

```typescript
// PostsService.findAll() — প্রতিটি পোস্টের জন্য author load করে
return this.postsRepo.find({
  relations: ['author'],           // users টেবিল JOIN করে
  order: { createdAt: 'DESC' },
});

// PostsService.findOne() — একটি পোস্টের জন্য author load করে
return this.postsRepo.findOne({
  where: { id },
  relations: ['author'],
});
```

এটি নিচের SQL তৈরি করে:
```sql
SELECT post.*, user.*
FROM posts post
LEFT JOIN users user ON user.id = post."authorId"
ORDER BY post."createdAt" DESC;
```

**সবসময় Relation load করবে না কেন?**

Relation load মানে extra JOIN query। `GET /api/users`-এ শুধু user list দরকার — প্রতিটি user-এর সব পোস্ট দরকার নেই। শুধু যা দরকার তাই load করো।

---

## ৭. Repository — ডেটাবেজে কথা বলার উপায়

**Repository** হলো TypeORM-এর interface যা দিয়ে নির্দিষ্ট টেবিলে query করা যায়। প্রতিটি entity-র নিজস্ব repository থাকে।

### Repository Inject করা

NestJS-এ প্রথমে module-এ register করতে হয়:

```typescript
// src/users/users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],  // User entity register করো
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

তারপর service-এ inject করো:

```typescript
// src/users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}
}
```

### সাধারণ Repository Method

```typescript
// CREATE — entity instance তৈরি করো (DB-তে save হয় না এখনই)
const user = this.usersRepo.create({ email, name, password });

// SAVE — INSERT বা UPDATE (entity-তে id থাকলে UPDATE, না থাকলে INSERT)
const savedUser = await this.usersRepo.save(user);

// FIND MANY — optional condition-সহ
const users = await this.usersRepo.find();
const posts = await this.postsRepo.find({
  where: { published: true },
  order: { createdAt: 'DESC' },
  relations: ['author'],
});

// FIND ONE — না পেলে null return করে
const user = await this.usersRepo.findOne({ where: { id } });

// UPDATE — পরিবর্তন করে save করো
const post = await this.postsRepo.findOne({ where: { id } });
Object.assign(post, updateDto);        // entity-তে পরিবর্তন merge করো
await this.postsRepo.save(post);       // save করলে updatedAt স্বয়ংক্রিয়ভাবে আপডেট হয়

// DELETE
await this.postsRepo.delete({ id });

// COUNT
const count = await this.postsRepo.count({ where: { authorId } });
```

### বাস্তব উদাহরণ: নিরাপদে User তৈরি

```typescript
// src/users/users.service.ts
async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
  // ১. email আগে থেকে আছে কিনা দেখো
  const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
  if (existing) {
    throw new ConflictException('Email already in use');
  }

  // ২. password hash করো (কখনো plain text store করো না)
  const hashed = await bcrypt.hash(dto.password, 10);

  // ৩. entity তৈরি করো (এখনো save হয়নি)
  const user = this.usersRepo.create({
    email: dto.email,
    name: dto.name,
    password: hashed,
  });

  // ৪. DB-তে save করো
  const saved = await this.usersRepo.save(user);

  // ৫. password বাদ দিয়ে return করো
  const { password, ...result } = saved;
  return result;
}
```

### বাস্তব উদাহরণ: Author দিয়ে Post filter করা

```typescript
// src/posts/posts.service.ts
async findAll(authorId?: string): Promise<Post[]> {
  return this.postsRepo.find({
    where: authorId ? { authorId } : {},   // authorId দিলে filter করো
    relations: ['author'],                  // author data সবসময় load করো
    order: { createdAt: 'DESC' },          // নতুন আগে
  });
}
```

এই একটি method দুটি URL handle করে:
- `GET /api/posts` — সব পোস্ট
- `GET /api/posts?authorId=some-uuid` — শুধু সেই user-এর পোস্ট

---

## ৮. Migration — Schema পরিবর্তনের সঠিক পদ্ধতি

Migration হলো এই পুরো গাইডের সবচেয়ে গুরুত্বপূর্ণ বিষয়গুলোর একটি। অনেকে এটি এড়িয়ে যায় এবং পরে ডেটা হারায়।

### সমস্যাটা কী?

ধরো তুমি `User` entity-তে `name` ফিল্ডটির নাম পরিবর্তন করে `fullName` করলে।

**`synchronize: true` হলে কী হবে:**

```
তুমি entity পরিবর্তন করলে:   name → fullName
                                    ↓
App restart হলে TypeORM DB check করে:
"name কলাম আছে, কিন্তু entity-তে fullName — এরা আলাদা!"
                                    ↓
TypeORM সিদ্ধান্ত নেয়:
  ✗  name কলাম DROP করে দাও (সব নাম মুছে গেল!)
  ✓  fullName কলাম তৈরি করো (ফাঁকা)
                                    ↓
Production DB থেকে সব user-এর নাম চিরতরে মুছে গেল
```

এটি একটি বিপর্যয়। **Migration এই সমস্যার সমাধান।**

### Migration কীভাবে কাজ করে?

Migration হলো TypeScript ফাইল যেটিতে দুটি method থাকে:

```
┌─────────────────────────────────────────────────────────────┐
│                   Migration ফাইল                            │
│                                                             │
│   up()   → পরিবর্তন apply করো  (e.g., কলাম যোগ করো)      │
│   down()  → পরিবর্তন undo করো   (e.g., কলাম সরিয়ে দাও)   │
│                                                             │
│   TypeORM track রাখে কোন migration চলেছে                    │
│   (migrations টেবিলে)                                       │
└─────────────────────────────────────────────────────────────┘
```

```typescript
// একটি migration ফাইল এরকম দেখতে
export class AddBioToUsers1700000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'bio',
      type: 'text',
      isNullable: true,  // nullable কারণ পুরানো user-দের bio নেই
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'bio');
  }
}
```

### data-source.ts ফাইলটি কেন আলাদা?

TypeORM CLI-কে পুরো NestJS app চালু না করে DB-তে connect করতে হয়। এজন্য [src/data-source.ts](src/data-source.ts) আলাদা আছে:

```typescript
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();   // .env manually load করো (NestJS ConfigModule ছাড়া)

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PASS ?? '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],       // সব entity ফাইল
  migrations: ['src/migrations/*.ts'],    // সব migration ফাইল
});
```

```
app.module.ts  → চলমান NestJS app ব্যবহার করে (ConfigService দিয়ে)
data-source.ts → CLI ব্যবহার করে (dotenv দিয়ে সরাসরি)

দুটো আলাদা কারণ CLI NestJS boot করে না
```

### Migration Command (package.json থেকে)

```bash
# ১. Entity-র সাথে current DB তুলনা করে migration তৈরি করো
npm run migration:generate -- src/migrations/CreateUsersAndPosts

# ২. সব pending migration apply করো
npm run migration:run

# ৩. সর্বশেষ migration undo করো
npm run migration:revert

# ৪. কোন কোন migration চলেছে দেখো
npm run migration:show
```

### Migration-এর পুরো চিত্র

```
Migration History (migrations টেবিল):
┌────────────────────────────────────────────────────┐
│ name                              │ timestamp       │
│ ──────────────────────────────────┼──────────────── │
│ CreateUsersAndPosts1700000000000  │ 2024-01-10      │  ← চলে গেছে ✓
│ AddBioToUsers1700000001000        │ 2024-02-15      │  ← চলে গেছে ✓
│ AddIndexOnEmail1700000002000      │ (pending)       │  ← এখনো চলেনি
└────────────────────────────────────────────────────┘

npm run migration:run চালালে:
  → শুধু "pending" migration গুলো চলবে
  → চলে যাওয়া গুলো আবার চলবে না
```

### Entity পরিবর্তনের পর Workflow

```
ধাপ ১: Entity ফাইল পরিবর্তন করো
        (e.g., User-এ bio: string যোগ করো)
              ↓
ধাপ ২: Migration generate করো
        npm run migration:generate -- src/migrations/AddBioToUser
              ↓
ধাপ ৩: Generated ফাইলটি review করো
        src/migrations/1700000000000-AddBioToUser.ts
        দেখো TypeORM কী SQL লিখেছে — ঠিক আছে কিনা নিশ্চিত করো
              ↓
ধাপ ৪: Migration apply করো
        npm run migration:run
              ↓
ধাপ ৫: Entity change এবং migration ফাইল একসাথে commit করো
        git add src/users/entities/user.entity.ts
        git add src/migrations/1700000000000-AddBioToUser.ts
        git commit -m "feat: add bio field to users"
```

### সাধারণ Migration ভুল

**ভুল ১: `synchronize: true` রেখে deploy করা**
```
Development-এ convenient মনে হয়, কিন্তু production-এ ডেটা হারানোর ঝুঁকি।
সবসময় false রাখো এবং migration ব্যবহার করো।
```

**ভুল ২: Migration run না করে নতুন কলাম use করা**
```
Entity-তে bio যোগ করলে কিন্তু migration run না করলে:
  → DB-তে bio কলাম নেই
  → App crash করবে: column "bio" does not exist
```

**ভুল ৩: Migration ফাইল commit না করা**
```
Migration শুধু তোমার মেশিনে চললে হবে না।
টিমের বাকিরা এবং production server-এও চালাতে হবে।
Migration ফাইল সবসময় git-এ commit করো।
```

**ভুল ৪: Production-এ revert করতে ভয় পাওয়া**
```
down() method সঠিকভাবে লেখা থাকলে revert নিরাপদ।
কিন্তু data DROP করে এমন revert-এ সতর্ক থাকো।
```

### শূন্য থেকে শুরু করার পদ্ধতি (First Time Setup)

```bash
# ১. Docker চালু করো
docker compose up -d

# ২. Dependencies install করো
npm install

# ৩. Migration generate করো (প্রথমবার — সব entity থেকে)
npm run migration:generate -- src/migrations/InitialSchema

# ৪. Migration চালাও (টেবিল তৈরি হবে)
npm run migration:run

# ৫. App চালু করো
npm run start:dev
```

---

## ৯. DTO এবং Validation

**DTO** (Data Transfer Object) হলো class যেটি incoming request data-র shape বর্ণনা করে। Validation এখানেই থাকে।

### DTO কেন দরকার?

DTO ছাড়া client যা পাঠায় তাই বিশ্বাস করতে হয়। কেউ `{ email: null, password: "" }` পাঠালে app crash বা DB corrupt হতে পারে।

### CreateUserDto উদাহরণ

```typescript
// src/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;       // valid email format হতে হবে

  @IsString()
  name: string;        // string হতে হবে

  @IsString()
  @MinLength(6)
  password: string;    // কমপক্ষে ৬ character হতে হবে
}
```

### Validation কীভাবে কাজ করে

[src/main.ts](src/main.ts)-এ:
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,            // DTO-তে নেই এমন property বাদ দাও
  forbidNonWhitelisted: true, // অজানা property পাঠালে 400 error
  transform: true,            // string-কে number/boolean-এ convert করো যেখানে দরকার
}));
```

Invalid request এলে NestJS স্বয়ংক্রিয়ভাবে return করে:
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than 6 characters"],
  "error": "Bad Request"
}
```

Service code চলেই না। এটি **validation layer**।

### UpdatePostDto — Partial Update

```typescript
// src/posts/dto/update-post.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {}
```

`PartialType` `CreatePostDto`-র সব field optional করে দেয়। তাই `PUT /api/posts/:id`-এ শুধু `{ published: true }` পাঠালেই হয় — পুরো object লাগে না।

---

## ১০. সাধারণ প্যাটার্ন ও সতর্কতা

### প্যাটার্ন ১: Not Found Error handle করা

```typescript
async findOne(id: string): Promise<Post> {
  const post = await this.postsRepo.findOne({
    where: { id },
    relations: ['author'],
  });

  if (!post) {
    throw new NotFoundException(`Post #${id} not found`);
  }

  return post;
}
// NotFoundException স্বয়ংক্রিয়ভাবে 404 response পাঠায়
// controller-এ কখনো null return করো না — সঠিক HTTP exception throw করো
```

### প্যাটার্ন ২: কখনো Password return করবে না

```typescript
// পদ্ধতি ১: destructuring
const { password, ...safeUser } = await this.usersRepo.save(user);
return safeUser;

// পদ্ধতি ২: select দিয়ে নির্দিষ্ট কলাম
return this.usersRepo.find({
  select: ['id', 'email', 'name', 'createdAt'],
});
```

### প্যাটার্ন ৩: Optional Parameter দিয়ে Filter

```typescript
// Controller
@Get()
findAll(@Query('authorId') authorId?: string) {
  return this.postsService.findAll(authorId);
}

// Service
findAll(authorId?: string) {
  return this.postsRepo.find({
    where: authorId ? { authorId } : {},
  });
}
```

### সতর্কতা ১: `create()` vs `save()` ভিন্ন জিনিস

```typescript
// create() — শুধু object তৈরি করে, DB-তে যায় না
const user = this.usersRepo.create({ email, name });

// save() — DB-তে লেখে (INSERT বা UPDATE)
const saved = await this.usersRepo.save(user);

// এটি এড়াও — save()-এ plain object দিলে TypeScript validation হারিয়ে যায়
const saved = await this.usersRepo.save({ email, name }); // ভালো না
```

### সতর্কতা ২: Relation স্বয়ংক্রিয়ভাবে load হয় না

```typescript
// ভুল — author undefined হবে
const post = await this.postsRepo.findOne({ where: { id } });
console.log(post.author); // undefined!

// সঠিক — explicitly বলো
const post = await this.postsRepo.findOne({
  where: { id },
  relations: ['author'],  // এখন author populated
});
console.log(post.author); // { id: '...', name: 'Alice', ... }
```

### সতর্কতা ৩: Migration না চালালে App ভাঙে

```
Entity-তে নতুন কলাম যোগ করলে কিন্তু migration run না করলে:

DB error: column "bio" of relation "users" does not exist

সমাধান: সবসময় entity পরিবর্তনের পর migration:generate এবং migration:run চালাও
```

### সতর্কতা ৪: UUID Extension

Postgres-এ UUID generate করতে `uuid-ossp` extension লাগে। TypeORM সাধারণত migration-এ এটি enable করে। যদি error আসে:

```
function uuid_generate_v4() does not exist
```

তাহলে psql-এ চালাও:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## ১১. Quick Reference

### Request-এর সম্পূর্ণ পথ

```
HTTP Request আসে
      ↓
Controller (route matching, @Query/@Param extract করে)
      ↓
Service (business logic, validation, error handling)
      ↓
Repository (TypeORM query তৈরি করে)
      ↓
PostgreSQL (actual DB query চলে, result আসে)
      ↓
Repository (result entity-তে রূপান্তর করে)
      ↓
Service (password বাদ দেওয়া ইত্যাদি)
      ↓
Controller (response return করে)
      ↓
HTTP Response পাঠানো হয়
```

### ফাইল পরিচিতি

| ফাইল | কী কাজ করে |
|---|---|
| `docker-compose.yml` | Postgres container চালায় |
| `.env` | DB credentials (git-এ commit করো না) |
| `app.module.ts` | ConfigService দিয়ে TypeORM-কে NestJS-এর সাথে যুক্ত করে |
| `data-source.ts` | TypeORM CLI-র জন্য আলাদা config (migration-এর জন্য) |
| `*.entity.ts` | DB টেবিলের structure TypeScript class হিসেবে |
| `*.module.ts` | Module কোন entity ব্যবহার করে সেটি register করে |
| `*.service.ts` | Business logic + Repository দিয়ে DB query |
| `*.controller.ts` | HTTP routes — service method call করে |
| `*.dto.ts` | Incoming request data validate করে |
| `src/migrations/` | Versioned টেবিল পরিবর্তনের TypeScript ফাইল |

### .env থেকে Connection পর্যন্ত পথ

```
.env ফাইল
┌──────────────────────────┐
│  DB_HOST=localhost        │
│  DB_PORT=5433             │──► ConfigService ──► TypeOrmModule ──► Docker Container
│  DB_USER=blog_user        │                                         (host:5433 → container:5432)
│  DB_PASS=blog_pass        │
│  DB_NAME=blog_api         │
└──────────────────────────┘
```

### Fresh Start Checklist

```bash
# ১. ডেটাবেজ চালু করো
docker compose up -d

# ২. Dependencies install করো
npm install

# ৩. Migration চালাও (টেবিল তৈরি হবে)
npm run migration:run

# ৪. API চালু করো
npm run start:dev

# ৫. Test করো
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","name":"Alice","password":"secret123"}'

curl http://localhost:3000/api/users
```

### Migration Quick Reference

```bash
# Entity পরিবর্তনের পর:
npm run migration:generate -- src/migrations/WhatYouChanged
npm run migration:run

# কোন migration চলেছে দেখতে:
npm run migration:show

# শেষ migration undo করতে:
npm run migration:revert

# সব data মুছে fresh start করতে:
docker compose down -v
docker compose up -d
npm run migration:run
```
