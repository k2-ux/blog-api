# NestJS Blog API — Learning Guide

This document explains every concept used in this project, in the order you encounter them when reading the code. Use it as a reference while exploring the codebase.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Decorators — What They Actually Are](#2-decorators--what-they-actually-are)
3. [Bootstrap & main.ts](#3-bootstrap--maints)
4. [Modules — The Building Blocks](#4-modules--the-building-blocks)
5. [Controllers & Routing](#5-controllers--routing)
6. [Providers, Services & Dependency Injection](#6-providers-services--dependency-injection)
7. [DTOs & Validation with class-validator](#7-dtos--validation-with-class-validator)
8. [Pipes — Transforming & Validating Input](#8-pipes--transforming--validating-input)
9. [Environment Variables with ConfigModule](#9-environment-variables-with-configmodule)
10. [TypeORM — Entities & Columns](#10-typeorm--entities--columns)
11. [TypeORM — Relations (OneToMany / ManyToOne)](#11-typeorm--relations-onetomany--manytoone)
12. [TypeORM — The Repository Pattern](#12-typeorm--the-repository-pattern)
13. [Migrations — The Right Way to Manage Schema](#13-migrations--the-right-way-to-manage-schema)
14. [Error Handling — Exceptions & Global Filters](#14-error-handling--exceptions--global-filters)
15. [Request Lifecycle — Putting It All Together](#15-request-lifecycle--putting-it-all-together)
16. [API Reference — Testing with curl](#16-api-reference--testing-with-curl)
17. [Common Pitfalls](#17-common-pitfalls)

---

## 1. Project Structure

```
src/
├── main.ts                          ← app entry point (bootstrap)
├── app.module.ts                    ← root module (imports everything)
├── data-source.ts                   ← TypeORM CLI config (only for migrations)
│
├── common/
│   └── filters/
│       └── http-exception.filter.ts ← shapes all error responses
│
├── users/                           ← self-contained feature module
│   ├── entities/user.entity.ts      ← maps to the "users" DB table
│   ├── dto/create-user.dto.ts       ← validated input shape for creating a user
│   ├── users.service.ts             ← business logic (talks to DB)
│   ├── users.controller.ts          ← HTTP layer (routes → service calls)
│   └── users.module.ts              ← wires controller + service + repository
│
├── posts/                           ← same structure as users
│   ├── entities/post.entity.ts
│   ├── dto/create-post.dto.ts
│   ├── dto/update-post.dto.ts
│   ├── posts.service.ts
│   ├── posts.controller.ts
│   └── posts.module.ts
│
└── migrations/                      ← generated SQL migration files live here
```

**The rule of thumb:** every feature gets its own folder with an entity, DTO(s), service, controller, and module. This is called a **feature module** pattern. Each folder is self-contained — you can almost understand any feature just by reading its folder.

---

## 2. Decorators — What They Actually Are

Decorators are TypeScript's way of attaching metadata to a class, method, property, or parameter. They look like `@Something` and they run at class definition time (not at request time).

```typescript
@Controller('users')   // attaches metadata: "this class handles /users routes"
export class UsersController {

  @Get(':id')          // attaches metadata: "this method handles GET /:id"
  findOne(
    @Param('id') id: string   // attaches metadata: "extract :id from URL params"
  ) { ... }
}
```

NestJS reads all that metadata at startup and builds a routing table, a DI container, and everything else from it. You never manually wire routes or instantiate services — decorators carry all the instructions.

**Key decorator categories in this project:**

| Category | Decorators |
|---|---|
| Module | `@Module` |
| HTTP routing | `@Controller`, `@Get`, `@Post`, `@Put`, `@Delete` |
| Parameter extraction | `@Body`, `@Param`, `@Query` |
| Response control | `@HttpCode` |
| DI / providers | `@Injectable`, `@InjectRepository` |
| TypeORM entities | `@Entity`, `@Column`, `@PrimaryGeneratedColumn`, `@CreateDateColumn`, `@UpdateDateColumn` |
| TypeORM relations | `@OneToMany`, `@ManyToOne`, `@JoinColumn` |
| Validation | `@IsEmail`, `@IsString`, `@IsNotEmpty`, `@MinLength`, `@IsUUID`, `@IsOptional`, `@IsBoolean` |
| Error handling | `@Catch` |

---

## 3. Bootstrap & main.ts

`main.ts` is the single file that starts the app. NestJS doesn't have any magic config file — everything goes through here.

```typescript
const app = await NestFactory.create(AppModule);
```

`NestFactory.create()` reads `AppModule`, scans all its imports, builds the DI container, registers all routes, and returns an application instance.

### Global Prefix

```typescript
app.setGlobalPrefix('api');
```

Every route in the app is now prefixed with `/api`. A controller at `@Controller('users')` with `@Get()` becomes `GET /api/users`.

### Global ValidationPipe

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

This single line enables automatic DTO validation on **every** endpoint. The three options matter:

- **`whitelist: true`** — strips any property from the request body that isn't declared in the DTO. If you send `{ email, name, password, isAdmin }` but the DTO only has `email`, `name`, `password`, then `isAdmin` is silently removed before the controller sees it. Prevents mass-assignment attacks.
- **`forbidNonWhitelisted: true`** — instead of silently stripping, it throws a `400 Bad Request`. Useful in dev to catch mistakes.
- **`transform: true`** — automatically converts the plain JSON body into an instance of the DTO class. Also converts URL params to their declared types (e.g., `@Param('id') id: string` stays a string, but `@Param('page') page: number` would be coerced from the URL string `"2"` to the number `2`).

### Global Exception Filter

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

Every unhandled `HttpException` in the app flows through this filter, which formats the response consistently. Explained in detail in section 14.

---

## 4. Modules — The Building Blocks

Every NestJS app is a tree of modules. The root is `AppModule`. Everything else is a branch.

```typescript
@Module({
  imports: [],       // other modules whose exports this module uses
  controllers: [],   // classes that handle HTTP requests
  providers: [],     // classes that can be injected (services, repositories, etc.)
  exports: [],       // subset of providers that other modules can inject
})
export class SomeModule {}
```

### The four arrays explained

**`imports`** — pull in other modules. When you import `TypeOrmModule.forFeature([User])`, you're telling NestJS "give me the repository for User so my service can inject it."

**`controllers`** — NestJS registers these as route handlers. A controller listed here is instantiated once and its decorated methods become HTTP endpoints.

**`providers`** — anything that can be injected via the DI container. Usually services, but can be guards, interceptors, custom factories, etc. Providers are scoped to their module by default.

**`exports`** — makes a provider available to modules that import this one. Without `exports`, a service is private to its module. Example: `UsersModule` exports `UsersService` so if another module ever needs it, it just imports `UsersModule`.

### forRoot vs forFeature

You'll see this pattern with `TypeOrmModule` and other library modules:

- **`TypeOrmModule.forRoot()`** — called once in `AppModule`. Sets up the database connection pool shared by the whole app.
- **`TypeOrmModule.forFeature([User])`** — called in each feature module. Registers the `Repository<User>` for that module so services in that module can inject it.

The same pattern exists in `ConfigModule` (`forRoot` once, available globally), and in `JwtModule`, `PassportModule`, etc.

---

## 5. Controllers & Routing

A controller's only job is to: receive an HTTP request, hand it to the right service method, and return the result.

```typescript
@Controller('users')   // base path: /api/users
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Post()                          // POST /api/users
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()                           // GET /api/users
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')                      // GET /api/users/:id
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }
}
```

### Parameter decorators

| Decorator | Extracts |
|---|---|
| `@Body()` | The entire request body (parsed JSON) |
| `@Body('email')` | A single field from the request body |
| `@Param('id')` | A URL path parameter (`:id` in the route) |
| `@Query('page')` | A query string parameter (`?page=2`) |
| `@Query()` | The entire query string as an object |

### Return values

Whatever you `return` from a controller method, NestJS serializes to JSON and sends it. You don't call `res.json()` yourself. If you return a Promise, NestJS awaits it automatically.

### Route conflicts

NestJS matches routes in the order they're defined. If you have both `@Get('profile')` and `@Get(':id')` in the same controller, put `profile` first — otherwise `:id` matches the string `"profile"` first.

---

## 6. Providers, Services & Dependency Injection

### What is DI?

Dependency Injection means: instead of a class creating its own dependencies with `new`, it declares what it needs and the framework provides them.

```typescript
// Without DI — tightly coupled, hard to test:
class PostsService {
  private repo = new Repository();  // hardcoded
}

// With DI — loosely coupled, easily mockable in tests:
@Injectable()
class PostsService {
  constructor(private readonly repo: Repository<Post>) {}  // injected
}
```

### How NestJS DI works

1. You mark a class `@Injectable()`.
2. You list it in a module's `providers` array.
3. NestJS reads the constructor's TypeScript type annotations at startup.
4. When something needs `PostsService`, NestJS instantiates it once (singleton by default) and injects it.

This is why `emitDecoratorMetadata: true` is in `tsconfig.json` — it emits type information at runtime so NestJS can read it.

### @InjectRepository

`Repository<User>` is a generic type. At runtime, TypeScript generics are erased — the actual runtime type is just `Repository`. NestJS can't tell `Repository<User>` from `Repository<Post>` using type reflection alone. So you add:

```typescript
@InjectRepository(User)
private readonly usersRepository: Repository<User>
```

The decorator explicitly tells NestJS: "inject the repository registered for the `User` entity."

### Singleton scope

By default, every provider is a singleton — NestJS creates it once and shares the same instance everywhere it's injected. This means you can safely store state in a service property (though usually you don't need to).

---

## 7. DTOs & Validation with class-validator

### What is a DTO?

A **Data Transfer Object** defines the shape and rules for data entering the API. It is:
- ✅ What the client sends in the request body
- ❌ Not a database entity
- ❌ Not what the service returns to the client

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### How validation works end-to-end

1. Client sends `POST /api/users` with `{ "email": "notanemail", "name": "", "password": "abc" }`.
2. `ValidationPipe` intercepts the body before the controller method runs.
3. It instantiates `CreateUserDto` and runs all the decorators.
4. Three violations found: `email` is invalid, `name` is empty, `password` is too short.
5. NestJS throws a `400 Bad Request` with a `message` array listing all failures.
6. The controller method **never executes**.

### Common class-validator decorators

| Decorator | Rule |
|---|---|
| `@IsString()` | Must be a string |
| `@IsEmail()` | Must be a valid email format |
| `@IsNotEmpty()` | String must not be empty (`""` fails) |
| `@MinLength(n)` | String must be at least n characters |
| `@IsUUID()` | Must be a valid UUID |
| `@IsBoolean()` | Must be true or false |
| `@IsOptional()` | Field may be absent; if present, other decorators still run |
| `@IsInt()` | Must be an integer |
| `@Min(n)` / `@Max(n)` | Numeric range check |

### DTO vs Entity — the most important distinction

| DTO | Entity |
|---|---|
| Describes incoming request data | Describes a database table |
| Decorated with `class-validator` | Decorated with TypeORM decorators |
| Thrown away after the request | Persisted to DB |
| Can omit sensitive fields | Has all columns |
| Can have `@IsOptional()` fields | Columns are required unless `nullable: true` |

**Never use your entity directly as a DTO.** If you do, you'd be exposing `id`, `createdAt`, `updatedAt`, and `password` to the client to set — a security hole.

---

## 8. Pipes — Transforming & Validating Input

A **Pipe** is a class that transforms or validates data flowing into a controller. Pipes run after guards but before the controller method.

### ValidationPipe (global)

Already explained in sections 3 and 7. Applied globally in `main.ts` so you don't need to add it to every route.

### ParseUUIDPipe (built-in)

```typescript
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) { ... }
```

`ParseUUIDPipe` validates that the `:id` URL parameter is a valid UUID. If not, it throws a `400 Bad Request` before the controller method runs. This prevents your service from even attempting a DB query with garbage input.

### How to read `@Param('id', ParseUUIDPipe)`

The second argument to `@Param` is a pipe to apply to just that parameter. You can chain multiple pipes. Pipes are applied left-to-right.

### Built-in pipes

| Pipe | What it does |
|---|---|
| `ValidationPipe` | Validates DTOs using class-validator |
| `ParseIntPipe` | Converts `"42"` → `42`, throws 400 if not a number |
| `ParseUUIDPipe` | Validates UUID format |
| `ParseBoolPipe` | Converts `"true"` / `"false"` → boolean |
| `DefaultValuePipe(x)` | Returns `x` if the value is `undefined` |

---

## 9. Environment Variables with ConfigModule

Never hardcode secrets (DB passwords, API keys) in source code. Use environment variables instead.

### How it works

1. `.env` file at project root holds the variables.
2. `ConfigModule.forRoot({ isGlobal: true })` in `AppModule` reads the file on startup.
3. `ConfigService` is injectable anywhere in the app to read values.

```typescript
// Reading a value in a factory function:
useFactory: (config: ConfigService) => ({
  host: config.get<string>('DB_HOST'),
  port: config.get<number>('DB_PORT'),
})

// Reading a value in a service:
constructor(private config: ConfigService) {}
someMethod() {
  const secret = this.config.get<string>('JWT_SECRET');
}
```

### `isGlobal: true`

Without this, you'd have to import `ConfigModule` in every module that uses `ConfigService`. With it, you import once in `AppModule` and it's available everywhere.

### Why not just use `process.env` directly?

You can, and `data-source.ts` does exactly that (because it runs outside NestJS). Inside the app, `ConfigService` is preferred because:
- It's injectable and therefore mockable in tests.
- It can have validation/schema on startup (with `@hapi/joi` or `zod`).
- It provides type safety via generics.

---

## 10. TypeORM — Entities & Columns

An **entity** is a TypeScript class that maps to a database table. TypeORM reads the decorators and knows how to create/query/update that table.

```typescript
@Entity('users')   // table name
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column('text')        // explicit column type
  bio: string;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()    // auto-set on INSERT
  createdAt: Date;

  @UpdateDateColumn()    // auto-set on UPDATE
  updatedAt: Date;
}
```

### Column options

```typescript
@Column({
  type: 'varchar',      // DB type (inferred from TS type by default)
  length: 100,          // VARCHAR(100)
  nullable: true,       // allows NULL
  unique: true,         // UNIQUE constraint
  default: 'active',    // DB-level default value
  name: 'email_addr',   // custom column name (otherwise uses property name)
})
email: string;
```

### @PrimaryGeneratedColumn options

| Value | Result |
|---|---|
| `'uuid'` | Auto-generated UUID v4 string |
| `'increment'` | Auto-incrementing integer (1, 2, 3…) |

UUIDs are preferred for distributed systems and for hiding row counts from users.

### Why `synchronize: false`?

`synchronize: true` would have TypeORM auto-update your DB schema on every app start to match your entities. This sounds convenient but it's dangerous:
- It can **drop columns** if you rename a property.
- It runs in production without a review step.
- It's not repeatable — two developers might get different results.

Use migrations instead (section 13). They are explicit, reversible, and version-controlled.

---

## 11. TypeORM — Relations (OneToMany / ManyToOne)

This project has a **one-to-many** relationship: one User has many Posts.

### On the User entity (the "one" side)

```typescript
@OneToMany(() => Post, (post) => post.author)
posts: Post[];
```

- First argument: a function returning the related entity class. Using a function (not the class directly) avoids circular import issues.
- Second argument: a function pointing to the inverse property on `Post`.
- This does **not** create a column in the `users` table. It only enables TypeORM to JOIN posts when you request the relation.

### On the Post entity (the "many" side)

```typescript
@ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'authorId' })
author: User;

@Column()
authorId: string;
```

- `@ManyToOne` creates the foreign key column (`authorId`) in the `posts` table.
- `{ onDelete: 'CASCADE' }` — if the user is deleted, all their posts are deleted automatically at DB level.
- `@JoinColumn({ name: 'authorId' })` names the FK column explicitly.
- We also expose `authorId` as a plain `@Column()` so we can query/filter by it without joining.

### Loading relations

TypeORM uses **lazy loading off by default**. You must explicitly request relations:

```typescript
// Eager: load author along with each post
this.postsRepository.find({
  relations: ['author'],
});

// Or using query builder:
this.postsRepository
  .createQueryBuilder('post')
  .leftJoinAndSelect('post.author', 'user')
  .getMany();
```

If you access `post.author` without loading it, you get `undefined` — not an error, just silently missing data. Always load what you need.

---

## 12. TypeORM — The Repository Pattern

The **repository** is the object you use to interact with a DB table. TypeORM's `Repository<Entity>` gives you a standard set of methods without writing SQL.

### Getting a repository

In a module: `TypeOrmModule.forFeature([User])` registers it.  
In a service: `@InjectRepository(User) private repo: Repository<User>` injects it.

### Key repository methods

```typescript
// Build entity in memory (does NOT hit DB)
const user = this.usersRepository.create({ email, name, password });

// INSERT or UPDATE (if entity has an id, it UPDATEs; otherwise INSERTs)
const saved = await this.usersRepository.save(user);

// SELECT * WHERE conditions
const user = await this.usersRepository.findOne({ where: { email } });
const users = await this.usersRepository.find({ where: { isActive: true } });

// DELETE — loads entity first, then deletes (triggers hooks if any)
await this.usersRepository.remove(user);

// DELETE — skips loading, goes straight to DELETE SQL (faster)
await this.usersRepository.delete({ id });

// UPDATE — skips loading (faster, but doesn't return updated entity)
await this.usersRepository.update({ id }, { name: 'New Name' });

// COUNT
const total = await this.usersRepository.count({ where: { isActive: true } });
```

### create() vs save()

```typescript
// create() only allocates memory — nothing persisted yet
const post = this.postsRepository.create(dto);

// save() runs the INSERT and returns the entity with id + timestamps
const saved = await this.postsRepository.save(post);

// You can also do it in one call if you don't need the intermediate object:
const saved = await this.postsRepository.save(this.postsRepository.create(dto));
```

### Partial update pattern

```typescript
async update(id: string, dto: UpdatePostDto): Promise<Post> {
  const post = await this.findOne(id);  // load current state (throws 404 if missing)
  Object.assign(post, dto);             // merge only the changed fields
  return this.postsRepository.save(post); // UPDATE with new values
}
```

`Object.assign` only overwrites properties that exist in `dto`. So if `dto = { title: 'New' }`, only `title` changes — `content` and `published` stay the same.

---

## 13. Migrations — The Right Way to Manage Schema

### Why migrations?

A migration is a versioned SQL script that transforms your database schema in a controlled way. Instead of `synchronize: true` silently changing tables, you have:
- An explicit file showing exactly what SQL will run.
- The ability to run it, test it, and revert it.
- A history in git of every schema change.

### The two config files

| File | Purpose |
|---|---|
| `app.module.ts` → `TypeOrmModule.forRootAsync()` | Runtime DB connection for the NestJS app |
| `src/data-source.ts` | DB connection for the TypeORM CLI (migration commands) |

They share the same DB credentials but are separate because the CLI runs outside NestJS.

### Migration workflow

**Step 1 — Write or update your entities**

Change a property in an entity, add a new entity, etc.

**Step 2 — Generate a migration**

```bash
npm run migration:generate -- src/migrations/InitDb
```

TypeORM compares your entity definitions against the current DB schema and generates a migration file with the SQL `ALTER TABLE` / `CREATE TABLE` / `DROP COLUMN` statements needed to make them match.

The generated file looks like:

```typescript
export class InitDb1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        ...
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
```

- **`up()`** — what to do to apply this migration (move forward).
- **`down()`** — what to do to undo it (move backward).

**Step 3 — Review the generated SQL**

Always read the generated file before running it. TypeORM is good at generating migrations but check for anything unexpected (e.g., a column being dropped when you only renamed it in TypeScript).

**Step 4 — Run the migration**

```bash
npm run migration:run
```

TypeORM runs all pending migrations in order. It tracks which migrations have run in a `migrations` table in your DB.

**Step 5 — Revert if needed**

```bash
npm run migration:revert
```

Runs the `down()` method of the most recently applied migration. Run it multiple times to revert multiple migrations.

**Step 6 — Check status**

```bash
npm run migration:show
```

Lists all migrations and whether each has been run (`[X]`) or not (`[ ]`).

### First-time setup

When you run `migration:run` on a fresh database:
1. TypeORM creates a `migrations` table to track history.
2. It runs every pending migration in chronological order (by timestamp in filename).
3. Your `users` and `posts` tables are created.

### Naming convention

TypeORM appends a timestamp to migration filenames automatically:
```
src/migrations/1700000000000-InitDb.ts
```

This ensures migrations always run in the order they were created, regardless of alphabetical sorting.

---

## 14. Error Handling — Exceptions & Global Filters

### Built-in HTTP exceptions

NestJS ships exceptions for every common HTTP status code. Throw them from services or controllers:

```typescript
throw new NotFoundException('User not found');       // 404
throw new ConflictException('Email already in use'); // 409
throw new BadRequestException('Invalid input');      // 400
throw new UnauthorizedException('Login required');   // 401
throw new ForbiddenException('No access');           // 403
throw new InternalServerErrorException('Oops');      // 500
```

Any uncaught exception that isn't an `HttpException` automatically becomes a 500.

### The global exception filter

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message,
    });
  }
}
```

Without this filter, NestJS's default error format looks like:
```json
{ "message": "User not found", "error": "Not Found", "statusCode": 404 }
```

With our filter, every error is shaped the same:
```json
{
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users/bad-id",
  "message": "User not found"
}
```

`@Catch(HttpException)` — the decorator says "intercept this exception type." You can catch `Error` to intercept everything, or a specific exception class to handle only that type.

`ArgumentsHost` is a context wrapper. `.switchToHttp()` gives you the Express `req`/`res` objects. The same filter mechanism works for WebSockets and gRPC, which is why the abstraction exists.

---

## 15. Request Lifecycle — Putting It All Together

Here's what happens for a `POST /api/users` request:

```
1. Express receives the HTTP request
        ↓
2. NestJS middleware runs (none in this app)
        ↓
3. Guards run (none on this route)
        ↓
4. ValidationPipe runs:
   - Parses JSON body
   - Instantiates CreateUserDto
   - Runs @IsEmail(), @IsString(), @MinLength(6)
   - If any fail → throws BadRequestException → HttpExceptionFilter formats it → 400 response
        ↓
5. UsersController.create(@Body() dto) is called
   - dto is now a validated CreateUserDto instance
        ↓
6. UsersService.create(dto) is called
   - Checks for duplicate email → throws ConflictException if found
   - Hashes password with bcrypt
   - usersRepository.create(dto) builds entity in memory
   - usersRepository.save(entity) runs INSERT, returns saved user
   - Strips password from result
        ↓
7. Controller returns the result object
        ↓
8. NestJS serializes it to JSON
        ↓
9. Express sends HTTP 201 response
```

---

## 16. API Reference — Testing with curl

Make sure the app is running: `npm run start:dev`

### Users

**Create a user**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "name": "Alice", "password": "secret123"}'
```

**Get all users**
```bash
curl http://localhost:3000/api/users
```

**Get a user by ID**
```bash
curl http://localhost:3000/api/users/<uuid>
```

### Posts

**Create a post** (use a real user UUID from above)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello World", "content": "My first post", "authorId": "<user-uuid>"}'
```

**Get all posts**
```bash
curl http://localhost:3000/api/posts
```

**Get posts by a specific author**
```bash
curl "http://localhost:3000/api/posts?authorId=<user-uuid>"
```

**Get a post by ID**
```bash
curl http://localhost:3000/api/posts/<post-uuid>
```

**Update a post**
```bash
curl -X PUT http://localhost:3000/api/posts/<post-uuid> \
  -H "Content-Type: application/json" \
  -d '{"published": true}'
```

**Delete a post**
```bash
curl -X DELETE http://localhost:3000/api/posts/<post-uuid>
```

### Validation error example

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "notanemail", "password": "abc"}'
```

Response:
```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users",
  "message": [
    "email must be an email",
    "name should not be empty",
    "password must be longer than or equal to 6 characters"
  ]
}
```

---

## 17. Common Pitfalls

### 1. Forgetting `forFeature` in the module

```typescript
// ❌ This will crash at startup with "No metadata found for Entity"
@Module({
  providers: [UsersService],  // repo not registered!
})

// ✅ Always import forFeature alongside the entity
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
})
```

### 2. Using `synchronize: true` in production

```typescript
// ❌ Can silently drop columns if you rename a property
synchronize: true

// ✅ Always false in production — use migrations
synchronize: false
```

### 3. Not awaiting async service calls

```typescript
// ❌ Returns a Promise, not the resolved value
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);  // this actually works — NestJS awaits it
}

// ✅ Or be explicit
async create(@Body() dto: CreateUserDto) {
  return await this.usersService.create(dto);
}
```

Actually, NestJS handles both — it detects Promises and awaits them. But being explicit with `async/await` in services avoids subtle bugs.

### 4. Circular dependency between modules

If `UsersModule` imports `PostsModule` AND `PostsModule` imports `UsersModule`, you get a circular dependency crash. Solutions:
- Refactor to break the cycle (usually one module doesn't really need the other).
- Use `forwardRef(() => UsersModule)` as a last resort.

### 5. Accessing a relation that wasn't loaded

```typescript
const post = await this.postsRepository.findOne({ where: { id } });
console.log(post.author.name); // ❌ post.author is undefined — wasn't loaded!

const post = await this.postsRepository.findOne({
  where: { id },
  relations: ['author'],         // ✅ now post.author is populated
});
```

### 6. Returning passwords in responses

```typescript
// ❌ The entire user object including password goes to the client
return this.usersRepository.save(user);

// ✅ Destructure the password out before returning
const { password, ...result } = await this.usersRepository.save(user);
return result;
```

### 7. Not exporting a service when another module needs it

```typescript
// Module A wants to use ServiceB
// ❌ ServiceB is private to ModuleB — NestJS throws "Unknown dependency" error
@Module({ providers: [ServiceB] })

// ✅ Export it so importing modules can inject it
@Module({ providers: [ServiceB], exports: [ServiceB] })
```
