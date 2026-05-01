# নেস্টজেএস শেখা – পৌরসভা ব্যবস্থার উদাহরণে

---

## ভূমিকা

কল্পনা করো তুমি একটি অনলাইন ব্লগ সাইট বানাতে চাও — যেখানে মানুষ অ্যাকাউন্ট তৈরি করবে, পোস্ট লিখবে, পড়বে, আপডেট করবে এবং মুছবে। এই সাধারণ কাজটা করতে গেলেও অনেক কিছু ঠিকঠাক করতে হয়: ব্যবহারকারীর তথ্য সঠিকভাবে ডেটাবেজে রাখা, ভুল তথ্য দিলে সরাসরি প্রত্যাখ্যান করা, পাসওয়ার্ড নিরাপদে সংরক্ষণ করা, এবং কেউ ভুল করলে তাকে সুন্দরভাবে জানানো।

এই প্রজেক্টটি, **blog-api**, ঠিক এই কাজগুলোই করে। এটি একটি **NestJS** দিয়ে বানানো ব্যাকএন্ড সার্ভার, যেটি ব্লগের ব্যবহারকারী এবং পোস্ট ম্যানেজ করে।

**NestJS কেন?**

সাধারণ Node.js দিয়ে বড় অ্যাপ বানাতে গেলে কোড এলোমেলো হয়ে যায় — কে কী করবে বোঝা কঠিন হয়, একই কাজ বারবার লিখতে হয়। NestJS এই সমস্যার সমাধান করে একটি **সুশৃঙ্খল কাঠামো** দিয়ে। এটি TypeScript ভাষায় লেখা, এবং **Angular**-এর মতো ডিজাইন প্যাটার্ন অনুসরণ করে — মানে প্রতিটি জিনিসের একটি নির্দিষ্ট জায়গা আছে, নির্দিষ্ট দায়িত্ব আছে।

সহজ কথায়: NestJS হলো সেই নিয়মকানুনের বই যা পুরো দলকে একভাবে কাজ করতে সাহায্য করে।

---

## NestJS-কে পৌরসভার সাথে তুলনা

একটি বড় শহরের **পৌরসভা** (মিউনিসিপালিটি) কল্পনা করো। এই পৌরসভায় অনেক বিভাগ আছে — জন্ম নিবন্ধন বিভাগ, ট্যাক্স বিভাগ, রাস্তাঘাট বিভাগ, নাগরিক সেবা বিভাগ ইত্যাদি। প্রতিটি বিভাগের নিজস্ব কাজ আছে, নিজস্ব কর্মী আছে, এবং একজন মূল পরিচালক পুরো অফিস চালান।

NestJS-এর কাঠামো ঠিক এভাবেই কাজ করে:

| পৌরসভার অংশ | NestJS-এর অংশ | কাজ |
|---|---|---|
| পুরো পৌরসভা অফিস ভবন | **অ্যাপ্লিকেশন (Application)** | পুরো সার্ভার |
| পৌরসভার প্রধান কার্যালয় | **AppModule** | সব বিভাগকে একত্রিত করে |
| প্রতিটি বিভাগ (জন্ম নিবন্ধন, ট্যাক্স) | **Feature Modules** | UsersModule, PostsModule |
| বিভাগের রিসেপশন কাউন্টার | **Controllers** | অনুরোধ গ্রহণ করে |
| ভেতরের কর্মকর্তারা | **Services** | আসল কাজ করে |
| কর্মী পরিচয়পত্র | **Decorators** | কে কী ভূমিকায় আছে তা চিহ্নিত করে |
| আবেদনপত্রের ফরম | **DTOs** | কী তথ্য লাগবে তা নির্ধারণ করে |
| ফরম যাচাইকারী | **ValidationPipe** | আবেদনপত্র ঠিকঠাক কিনা দেখে |
| প্রবেশদ্বারের নিরাপত্তারক্ষী | **Guards** | কে ঢুকতে পারবে সিদ্ধান্ত নেয় |
| অভিযোগ নিষ্পত্তি বিভাগ | **Exception Filters** | সমস্যা হলে সুন্দরভাবে জানায় |
| ডেটাবেজ রেজিস্টার | **Entities** | তথ্য কীভাবে সংরক্ষিত হবে নির্ধারণ করে |

এই পুরো অ্যানালজি মাথায় রেখে এখন প্রজেক্টের প্রতিটি অংশ বোঝা যাক।

---

## প্রজেক্ট স্ট্রাকচার ব্যাখ্যা

### ফোল্ডার কাঠামো

```
blog-api/
├── src/                          ← পৌরসভার মূল ভবন
│   ├── main.ts                   ← পৌরসভার প্রধান ফটক
│   ├── app.module.ts             ← প্রধান কার্যালয়
│   ├── app.controller.ts         ← মূল রিসেপশন
│   ├── app.service.ts            ← মূল সহকারী
│   ├── data-source.ts            ← ডেটাবেজ সংযোগ বিধি
│   ├── common/
│   │   └── filters/
│   │       └── http-exception.filter.ts  ← অভিযোগ নিষ্পত্তি অফিস
│   ├── users/                    ← নাগরিক নিবন্ধন বিভাগ
│   │   ├── dto/
│   │   │   └── create-user.dto.ts        ← নিবন্ধন আবেদনপত্র
│   │   ├── entities/
│   │   │   └── user.entity.ts            ← নাগরিক রেজিস্টার বই
│   │   ├── users.controller.ts           ← নিবন্ধন কাউন্টার
│   │   ├── users.service.ts              ← নিবন্ধন কর্মকর্তা
│   │   └── users.module.ts              ← নাগরিক বিভাগের দলিল
│   └── posts/                    ← বিজ্ঞপ্তি ও নোটিশ বিভাগ
│       ├── dto/
│       │   ├── create-post.dto.ts        ← নোটিশ প্রকাশের ফরম
│       │   └── update-post.dto.ts        ← নোটিশ সংশোধনের ফরম
│       ├── entities/
│       │   └── post.entity.ts            ← নোটিশ রেজিস্টার বই
│       ├── posts.controller.ts           ← নোটিশ বোর্ডের কাউন্টার
│       ├── posts.service.ts              ← নোটিশ বিভাগের কর্মকর্তা
│       └── posts.module.ts              ← নোটিশ বিভাগের দলিল
└── test/                         ← পরিদর্শন দল
```

### পৌরসভার বিভাগগুলোর সাথে তুলনা

আমাদের পৌরসভায় দুটি প্রধান বিভাগ আছে:

**১. নাগরিক নিবন্ধন বিভাগ (Users Module):** এখানে নতুন নাগরিকদের নিবন্ধন হয়, বিদ্যমান নাগরিকদের তথ্য দেখা যায়।

**২. বিজ্ঞপ্তি ও নোটিশ বিভাগ (Posts Module):** এখানে নোটিশ তৈরি, পড়া, সংশোধন এবং বাতিল করার কাজ হয়।

এই দুটি বিভাগকে নিয়ন্ত্রণ করে একটি **প্রধান কার্যালয় (AppModule)**, এবং পুরো পৌরসভার দরজা হলো **main.ts**।

---

## মডিউলস (Modules)

### মডিউল কী?

পৌরসভার প্রতিটি **বিভাগ** যেমন স্বয়ংসম্পূর্ণ — তার নিজের কর্মী, ফরম, এবং কাজের নিয়ম আছে — NestJS-এ **Module** ঠিক তেমনই। একটি মডিউল একটি ফিচারের সব কিছু একসাথে ধারণ করে।

### AppModule — প্রধান কার্যালয়

```typescript
// src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // সারা অফিসের নিয়মকানুন
    TypeOrmModule.forRootAsync({ ... }),         // ডেটাবেজ সংযোগ
    UsersModule,                                 // নাগরিক বিভাগ
    PostsModule,                                 // নোটিশ বিভাগ
  ],
})
export class AppModule {}
```

**পৌরসভার অ্যানালজি:** এটি হলো পৌরসভার **প্রধান কার্যালয়ের অর্গানোগ্রাম**। এখানে লেখা থাকে:
- কোন কোন বিভাগ আছে (UsersModule, PostsModule)
- ডেটাবেজের সাথে কীভাবে যোগাযোগ হবে (TypeOrmModule)
- পরিবেশ চলক (পাসওয়ার্ড, ঠিকানা) কীভাবে পড়া হবে (ConfigModule)

`isGlobal: true` মানে হলো এই নিয়মগুলো পুরো পৌরসভার সব বিভাগে প্রযোজ্য — আলাদাভাবে প্রতিটি বিভাগকে বলতে হবে না।

---

### UsersModule — নাগরিক নিবন্ধন বিভাগ

```typescript
// src/users/users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],  // নাগরিক রেজিস্টার ব্যবহারের অনুমতি
  controllers: [UsersController],               // কাউন্টারের কর্মী
  providers: [UsersService],                    // ভেতরের কর্মকর্তা
  exports: [UsersService],                      // অন্য বিভাগকে ধার দেওয়া সেবা
})
export class UsersModule {}
```

**পৌরসভার অ্যানালজি:** এটি নাগরিক নিবন্ধন বিভাগের **বিভাগীয় আদেশপত্র**। এখানে লেখা থাকে কোন কর্মী কাউন্টারে থাকবে, কোন রেজিস্টার ব্যবহার করা যাবে, এবং অন্য বিভাগ চাইলে কী সেবা পাবে।

`exports: [UsersService]` অত্যন্ত গুরুত্বপূর্ণ — এর মানে অন্য বিভাগ (যেমন নোটিশ বিভাগ) যদি কোনো নাগরিকের তথ্য যাচাই করতে চায়, সে এই সেবাটি ব্যবহার করতে পারবে।

---

### PostsModule — বিজ্ঞপ্তি ও নোটিশ বিভাগ

```typescript
// src/posts/posts.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
```

**পৌরসভার অ্যানালজি:** নোটিশ বিভাগের আদেশপত্র। এই বিভাগ তার সেবা অন্যদের দেয় না (`exports` নেই), কারণ অন্য কাউকে নোটিশ ব্যবস্থাপনায় হস্তক্ষেপ করার দরকার নেই।

---

## কন্ট্রোলার (Controllers)

### কন্ট্রোলার কী?

পৌরসভার **রিসেপশন কাউন্টার** কল্পনা করো। একজন নাগরিক এসে বলে "আমি নিবন্ধন করতে চাই" — কাউন্টারের কর্মী শোনে, কী ধরনের আবেদন সেটা বোঝে, এবং সঠিক বিভাগে পাঠায়। কাউন্টারের কর্মী নিজে কোনো সিদ্ধান্ত নেয় না — শুধু আবেদন গ্রহণ করে এবং ফরওয়ার্ড করে।

NestJS-এ **Controller** ঠিক এই কাজটাই করে — HTTP অনুরোধ গ্রহণ করে এবং সার্ভিসে পাঠায়।

---

### UsersController — নাগরিক নিবন্ধন কাউন্টার

```typescript
// src/users/users.controller.ts
@Controller('users')                         // এই কাউন্টারের পথ: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()                                    // নতুন আবেদন গ্রহণ
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()                                     // সব নাগরিকের তালিকা
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')                                // নির্দিষ্ট নাগরিকের তথ্য
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }
}
```

**পৌরসভার অ্যানালজি:**

- `@Controller('users')` → এই কাউন্টারের সাইনবোর্ড: "নাগরিক নিবন্ধন কাউন্টার, রুম নং ১০১"
- `@Post()` → "নতুন নিবন্ধন আবেদন জমা দিন"
- `@Get()` → "সকল নিবন্ধিত নাগরিকের তালিকা দেখুন"
- `@Get(':id')` → "নির্দিষ্ট নাগরিকের ফাইল দেখুন"

যখন কেউ `POST /api/users` এ অনুরোধ পাঠায়, কাউন্টার (`UsersController`) সেটা ধরে এবং ভেতরের কর্মকর্তার (`UsersService`) কাছে পাঠায়।

**`ParseUUIDPipe` কী করে?** ধরো কেউ URL-এ ভুল আইডি দিল (`abc-xyz` যেটা UUID না)। `ParseUUIDPipe` হলো সেই কর্মী যে বলে "এটা বৈধ আইডি নয়, ফিরে যান।" সার্ভিস পর্যন্ত পৌঁছানোর আগেই থামিয়ে দেয়।

---

### PostsController — নোটিশ বোর্ডের কাউন্টার

```typescript
// src/posts/posts.controller.ts
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Get()
  findAll(@Query('authorId') authorId?: string) {  // ঐচ্ছিক ফিল্টার
    return this.postsService.findAll(authorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }
}
```

**পৌরসভার অ্যানালজি:**

এই কাউন্টারটি **নোটিশ বোর্ড বিভাগ**। এখানে পাঁচটি কাজ হয়:
- নতুন নোটিশ প্রকাশ (`@Post`)
- সব নোটিশ দেখা — চাইলে কোনো লেখকের নোটিশ আলাদাভাবে (`@Get` + `@Query`)
- নির্দিষ্ট নোটিশ দেখা (`@Get(':id')`)
- নোটিশ সংশোধন করা (`@Put(':id')`)
- নোটিশ বাতিল করা (`@Delete(':id')`)

`@Query('authorId')` হলো যেন বলা: "শুধু আব্দুল সাহেবের লেখা নোটিশগুলো দেখাও।" URL হবে: `/api/posts?authorId=uuid-here`

`@HttpCode(HttpStatus.OK)` — মুছে ফেললে সাধারণত ২০৪ (কোনো কিছু নেই) পাঠানো হয়, কিন্তু এখানে ২০০ পাঠানো হয় কারণ একটি বার্তা পাঠানো হচ্ছে।

---

## সার্ভিস (Providers/Services)

### সার্ভিস কী?

কাউন্টারের কর্মী আবেদন নিয়ে ভেতরে পাঠালো। এখন কাজ করে **ভেতরের কর্মকর্তারা** — তারা ডেটাবেজ রেজিস্টার খোলে, তথ্য যাচাই করে, হিসাব করে, সিদ্ধান্ত নেয়। NestJS-এ এই কাজটা করে **Service**।

---

### UsersService — নাগরিক নিবন্ধন কর্মকর্তা

```typescript
// src/users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // ধাপ ১: ইমেইল আগে থেকে আছে কিনা দেখো
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // ধাপ ২: পাসওয়ার্ড এনক্রিপ্ট করো
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // ধাপ ৩: ডেটাবেজে সংরক্ষণ করো
    const user = this.usersRepository.create({ ...dto, password: hashedPassword });
    const saved = await this.usersRepository.save(user);

    // ধাপ ৪: পাসওয়ার্ড বাদ দিয়ে ফেরত পাঠাও
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
      throw new NotFoundException(`User #${id} not found`);
    }
    const { password, ...result } = user;
    return result;
  }
}
```

**পৌরসভার অ্যানালজি — `create()` মেথড:**

ধরো একজন নতুন নাগরিক নিবন্ধন করতে এসেছে। ভেতরের কর্মকর্তা কী করে?

১. **রেজিস্টার বই চেক করো** — এই ইমেইলে কেউ আগে নিবন্ধন করেছে কিনা দেখো। যদি করে থাকে, বলো "এই ঠিকানায় ইতিমধ্যে নিবন্ধন আছে।"
২. **পাসওয়ার্ড লকার-এ রাখো** — পাসওয়ার্ড সরাসরি না রেখে একটি বিশেষ কোডে (bcrypt) রূপান্তর করো। যদি কোনোদিন রেজিস্টার চুরি হয়, চোর পাসওয়ার্ড পড়তে পারবে না।
৩. **ডেটাবেজে সংরক্ষণ করো।**
৪. **পাসওয়ার্ড বাদ দিয়ে ফেরত দাও** — কখনোই পাসওয়ার্ড বাইরে পাঠানো উচিত নয়, এমনকি এনক্রিপ্টেড হলেও।

`Omit<User, 'password'>` — TypeScript-এর এই চমৎকার লেখাটি বলে "User টাইপ থেকে password বাদ দিয়ে যা বাকি থাকে।" এটি শুধু কোড নিরাপত্তা নিশ্চিত করে না, ডকুমেন্টেশনও হয়ে যায়।

---

### PostsService — নোটিশ বিভাগের কর্মকর্তা

```typescript
// src/posts/posts.service.ts
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(dto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create(dto);
    return this.postsRepository.save(post);
  }

  async findAll(authorId?: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: authorId ? { authorId } : {},
      relations: ['author'],          // লেখকের পুরো তথ্যসহ দেখাও
      order: { createdAt: 'DESC' },   // সর্বশেষ আগে
    });
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    Object.assign(post, dto);         // শুধু দেওয়া ক্ষেত্রগুলো আপডেট করো
    return this.postsRepository.save(post);
  }

  async remove(id: string): Promise<{ message: string }> {
    const post = await this.findOne(id);
    await this.postsRepository.remove(post);
    return { message: `Post #${id} deleted successfully` };
  }
}
```

**পৌরসভার অ্যানালজি — `findAll()` মেথড:**

কেউ জিজ্ঞেস করলো "সব নোটিশ দেখাও" — কর্মকর্তা পুরো নোটিশ বই খুলে দেয়। কিন্তু যদি বলে "শুধু রহিম সাহেবের নোটিশ দেখাও" — তাহলে শুধু সেই লেখকের নোটিশ বের করে।

`relations: ['author']` — এটি হলো নোটিশের সাথে লেখকের পূর্ণ প্রোফাইলও জুড়ে দেওয়া। শুধু লেখকের আইডি নয়, তার নাম, ইমেইল সবকিছু।

`Object.assign(post, dto)` — এটি খুবই চালাক পদ্ধতি। নোটিশের একটি ক্ষেত্র আপডেট করতে চাইলে বাকিগুলো অপরিবর্তিত থাকে। যেন পৌরসভার কোনো নোটিশের শুধু তারিখটা বদলানো — বাকি লেখা ঠিকঠাক থাকে।

---

## ডেকোরেটরস (@Module, @Controller, @Get, @Post, @Injectable ইত্যাদি)

### ডেকোরেটর কী?

পৌরসভার প্রতিটি কর্মীর গায়ে একটি **পরিচয়পত্র** থাকে — "আমি রিসেপশনিস্ট", "আমি জ্যেষ্ঠ কর্মকর্তা", "আমি নিরাপত্তারক্ষী"। NestJS-এ **Decorator** হলো সেই পরিচয়পত্র। এগুলো `@` চিহ্ন দিয়ে শুরু হয় এবং ক্লাস বা মেথডের আগে বসে।

---

### শ্রেণী-স্তরের ডেকোরেটর (Class Decorators)

| ডেকোরেটর | পৌরসভার সমতুল্য | কাজ |
|---|---|---|
| `@Module({...})` | বিভাগের অফিসিয়াল আদেশপত্র | এই ক্লাসটি একটি মডিউল বলে চিহ্নিত করে |
| `@Controller('users')` | রিসেপশন কাউন্টারের সাইনবোর্ড | এই ক্লাসটি `/users` পথের কন্ট্রোলার |
| `@Injectable()` | কর্মচারী পরিচয়পত্র | এই ক্লাসটি ইনজেক্ট করা যাবে (DI-তে অংশ নেবে) |

```typescript
@Injectable()           // "আমি একজন কর্মচারী, অন্যকে সাহায্য করতে পারি"
export class UsersService {
  // ...
}
```

---

### মেথড-স্তরের ডেকোরেটর (Method Decorators)

| ডেকোরেটর | পৌরসভার সমতুল্য | HTTP মেথড |
|---|---|---|
| `@Get()` | "তথ্য জানতে চাইলে এই লাইনে দাঁড়ান" | তথ্য পাঠানো |
| `@Post()` | "নতুন আবেদন জমা দিন এখানে" | নতুন তথ্য তৈরি |
| `@Put(':id')` | "সংশোধনী আবেদন জমা দিন" | তথ্য আপডেট |
| `@Delete(':id')` | "বাতিলের আবেদন এখানে" | তথ্য মুছে ফেলা |
| `@HttpCode(200)` | "এই কাজ হলে 'সফল' রসিদ দাও" | HTTP স্ট্যাটাস কোড নির্ধারণ |

---

### প্যারামিটার-স্তরের ডেকোরেটর (Parameter Decorators)

| ডেকোরেটর | পৌরসভার সমতুল্য | কাজ |
|---|---|---|
| `@Body()` | আবেদনপত্রের তথ্য পড়া | HTTP বডি থেকে ডেটা নেওয়া |
| `@Param('id')` | আবেদনের নম্বর পড়া | URL প্যারামিটার নেওয়া (যেমন `/users/123`) |
| `@Query('authorId')` | ফিল্টার অপশন পড়া | URL কুয়েরি স্ট্রিং নেওয়া (`?authorId=...`) |

```typescript
@Get(':id')
findOne(
  @Param('id', ParseUUIDPipe) id: string,  // URL থেকে id নাও, UUID কিনা যাচাই করো
) {
  return this.usersService.findOne(id);
}
```

**পৌরসভার অ্যানালজি:** কেউ কাউন্টারে এসে বলল "আমার নাগরিক নং ৪৫৬-এর ফাইল দরকার।" `@Param('id')` হলো সেই কর্মী যে কাগজ থেকে নম্বরটা পড়ে নেয়। `ParseUUIDPipe` নিশ্চিত করে যে নম্বরটা সঠিক ফরম্যাটে আছে।

---

### ইনজেকশন ডেকোরেটর (Injection Decorators)

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)           // "আমার User রেজিস্টার বইটা দাও"
    private readonly usersRepository: Repository<User>,
  ) {}
}
```

`@InjectRepository(User)` — এটি TypeORM-কে বলে "আমি User এন্টিটির জন্য ডেটাবেজ রিপোজিটরি চাই।" NestJS নিজেই এই জিনিসটা তৈরি করে দেয় — তোমাকে `new Repository()` লিখতে হয় না।

---

### Catch ডেকোরেটর

```typescript
@Catch(HttpException)                 // শুধু HTTP এরর ধরো
export class HttpExceptionFilter implements ExceptionFilter {
  // ...
}
```

**পৌরসভার অ্যানালজি:** "শুধু HTTP সংক্রান্ত অভিযোগ এই বিভাগে আসবে, বাকি সমস্যা অন্য জায়গায়।"

---

## ডিটিও এবং ভ্যালিডেশন পাইপ (DTOs ও Validation Pipes)

### ডিটিও কী?

পৌরসভায় কোনো কাজ করতে গেলে নির্দিষ্ট **ফরম** পূরণ করতে হয়। জন্ম নিবন্ধনের জন্য একটা ফরম, মৃত্যু সনদের জন্য আরেকটা। এই ফরমে নির্দিষ্ট ঘর থাকে — নাম অবশ্যই লিখতে হবে, জন্ম তারিখ ছাড়া আবেদন গ্রহণযোগ্য নয়।

NestJS-এ **DTO (Data Transfer Object)** হলো এই ফরমের ডিজিটাল সংস্করণ।

---

### CreateUserDto — নাগরিক নিবন্ধনের আবেদনপত্র

```typescript
// src/users/dto/create-user.dto.ts
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()            // ইমেইল ঠিকানা হতে হবে
  email: string;

  @IsString()
  @IsNotEmpty()         // খালি রাখা যাবে না
  name: string;

  @IsString()
  @MinLength(6)         // কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড
  password: string;
}
```

**পৌরসভার অ্যানালজি:**

এই ফরমে তিনটি ঘর আছে:
- **ইমেইল:** সঠিক ইমেইল ফরম্যাট হতে হবে (যেমন `abc@gmail.com`)। শুধু "abc" লিখলে গ্রহণযোগ্য নয়।
- **নাম:** অবশ্যই দিতে হবে, খালি রাখা যাবে না।
- **পাসওয়ার্ড:** কমপক্ষে ৬ অক্ষরের হতে হবে।

কেউ যদি ইমেইল ছাড়া বা ভুল ফরম্যাটে আবেদন করে, কাউন্টারেই ফিরিয়ে দেওয়া হবে।

---

### CreatePostDto — নোটিশ প্রকাশের ফরম

```typescript
// src/posts/dto/create-post.dto.ts
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;          // নোটিশের শিরোনাম (আবশ্যক)

  @IsString()
  @IsNotEmpty()
  content: string;        // নোটিশের বিষয়বস্তু (আবশ্যক)

  @IsBoolean()
  @IsOptional()
  published?: boolean;    // প্রকাশিত হবে কিনা (ঐচ্ছিক, ডিফল্ট: false)

  @IsUUID()
  authorId: string;       // লেখকের আইডি (আবশ্যক, UUID ফরম্যাট)
}
```

---

### UpdatePostDto — নোটিশ সংশোধনের ফরম

```typescript
// src/posts/dto/update-post.dto.ts
export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;         // শিরোনাম বদলাতে চাইলে দাও, না হলে রেখে দাও

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
  
  // লক্ষ্য করো: authorId নেই! নোটিশের লেখক পরিবর্তন করা যাবে না।
}
```

**পৌরসভার অ্যানালজি:** সংশোধনী আবেদনে সব ঘর পূরণ করা বাধ্যতামূলক নয়। শুধু যেটা বদলাতে চাও সেটাই লেখো। কিন্তু নোটিশের **লেখক পরিবর্তনের কোনো সুযোগ নেই** — এটা ইচ্ছাকৃতভাবে বাদ রাখা হয়েছে।

---

### ValidationPipe — ফরম যাচাইকারী

```typescript
// src/main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // ফরমের বাইরের তথ্য ফেলে দাও
    forbidNonWhitelisted: true,   // বাইরের তথ্য থাকলে এরর দাও
    transform: true,              // স্বয়ংক্রিয়ভাবে সঠিক ধরনে রূপান্তর করো
  }),
);
```

**পৌরসভার অ্যানালজি:**

`ValidationPipe` হলো সেই কর্মী যে সমস্ত আবেদন জমার আগে যাচাই করে।

- `whitelist: true` → "ফরমে যেসব ঘর নেই, সেসব তথ্য চুপচাপ ফেলে দাও।" যেন কেউ অফিসিয়াল ফরমের পাশে বাড়তি কাগজ জুড়ে দিলে সেটা আলাদা করে ফেলা হয়।
- `forbidNonWhitelisted: true` → "ফরমে নেই এমন তথ্য থাকলে সরাসরি ফিরিয়ে দাও।" আরও কড়া নিয়ম।
- `transform: true` → যদি কেউ `"true"` স্ট্রিং পাঠায় কিন্তু ডিটিওতে `boolean` চাওয়া আছে, এটি স্বয়ংক্রিয়ভাবে `true` বুলিয়ানে রূপান্তর করে।

`useGlobalPipes` — এই যাচাই প্রক্রিয়া **পুরো পৌরসভার সকল কাউন্টারে** প্রযোজ্য। আলাদাভাবে প্রতিটি কাউন্টারে বলতে হয় না।

---

## গার্ডস (Guards)

### গার্ড কী?

পৌরসভার মূল ফটকে একজন **নিরাপত্তারক্ষী** থাকে। সে সবাইকে ঢুকতে দেয় না। পরিচয়পত্র না থাকলে, বা যার পারমিশন নেই তাকে ফিরিয়ে দেয়।

NestJS-এ **Guard** হলো সেই নিরাপত্তারক্ষী। কোনো HTTP অনুরোধ কন্ট্রোলারে পৌঁছানোর আগে গার্ড সিদ্ধান্ত নেয়: "এই ব্যক্তি কি এই কাজ করার অনুমতি রাখে?"

এই প্রজেক্টে এখনো গার্ড সরাসরি ইমপ্লিমেন্ট করা হয়নি, কিন্তু প্যাকেজগুলো (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`) ইনস্টল আছে। ভবিষ্যতে JWT (JSON Web Token) ভিত্তিক গার্ড বানানোর পরিকল্পনা আছে।

### গার্ড কীভাবে কাজ করতো

```typescript
// ভবিষ্যতের কোড (এখনো বানানো হয়নি)
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // HTTP হেডার থেকে JWT টোকেন পড়ো
    // যাচাই করো টোকেন বৈধ কিনা
    // যদি বৈধ হয়, true ফেরত দাও — ঢুকতে দাও
    // না হলে false — ফিরিয়ে দাও
  }
}

// ব্যবহার
@UseGuards(JwtAuthGuard)    // এই কাউন্টারে টোকেন ছাড়া ঢোকা যাবে না
@Get(':id')
findOne(@Param('id') id: string) { ... }
```

**পৌরসভার অ্যানালজি:**

যেমন পৌরসভার কিছু বিভাগে সাধারণ মানুষ যেতে পারে (নোটিশ পড়া), কিন্তু কিছু বিভাগে শুধু কর্মকর্তারা যেতে পারে (মাইনে তোলা)। JWT গার্ড ঠিক এই পার্থক্য করে।

---

## ইন্টারসেপ্টরস ও এক্সেপশন ফিল্টার (Interceptors ও Exception Filters)

### HttpExceptionFilter — অভিযোগ নিষ্পত্তি বিভাগ

পৌরসভায় যদি কোনো সমস্যা হয় — ফাইল হারিয়ে গেছে, অনুমতি নেই, আবেদন বাতিল — একটি **অভিযোগ নিষ্পত্তি বিভাগ** থাকে যে সমস্যাটা সুন্দরভাবে জানায়।

NestJS-এ যখন কোনো `HttpException` ছোঁড়া হয় (যেমন ৪০৪ নট ফাউন্ড, ৪০৯ কনফ্লিক্ট), **HttpExceptionFilter** সেটা ধরে এবং একটি সুসজ্জিত উত্তর পাঠায়।

```typescript
// src/common/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,                      // সমস্যার কোড (404, 409, ইত্যাদি)
      timestamp: new Date().toISOString(),     // কখন সমস্যা হলো
      path: request.url,                       // কোন পথে সমস্যা হলো
      message,                                 // কী সমস্যা হলো
    });
  }
}
```

**পৌরসভার অ্যানালজি:**

ধরো কেউ এমন নাগরিকের ফাইল চাইলো যে নেই। ভেতরের কর্মকর্তা বললো "এই আইডিতে কেউ নেই।" এই বার্তাটা কাউন্টারে এসে বলা হয়:

```json
{
  "statusCode": 404,
  "timestamp": "2026-05-01T10:30:00.000Z",
  "path": "/api/users/abc-123",
  "message": "User #abc-123 not found"
}
```

এরকম সুশৃঙ্খল উত্তর ছাড়া ব্যবহারকারী বুঝবে না কী সমস্যা হলো।

### যেসব এক্সেপশন ব্যবহার হয়েছে

```typescript
// নাগরিক বিভাগে
throw new ConflictException('Email already in use');  // ৪০৯ — ইতিমধ্যে আছে
throw new NotFoundException(`User #${id} not found`); // ৪০৪ — পাওয়া যায়নি

// নোটিশ বিভাগে
throw new NotFoundException(`Post #${id} not found`); // ৪০৪ — পাওয়া যায়নি
```

**পৌরসভার অ্যানালজি:**
- `ConflictException` → "এই ঠিকানায় ইতিমধ্যে নিবন্ধন আছে।" — দ্বৈত নিবন্ধন প্রতিরোধ
- `NotFoundException` → "এই ফাইলটি আমাদের কাছে নেই।" — অনুপস্থিত তথ্য

---

## এন্টিটি (Entities) — ডেটাবেজ রেজিস্টার বই

### এন্টিটি কী?

পৌরসভার প্রতিটি বিভাগে একটি **রেজিস্টার বই** থাকে। নাগরিক নিবন্ধন বিভাগে আছে নাগরিক রেজিস্টার — কে কোন পাতায় আছে, কোন কলামে কী তথ্য। TypeORM-এর **Entity** হলো সেই রেজিস্টার বইয়ের নকশা।

---

### User Entity — নাগরিক রেজিস্টার

```typescript
// src/users/entities/user.entity.ts
@Entity('users')                        // ডেটাবেজে টেবিলের নাম 'users'
export class User {
  @PrimaryGeneratedColumn('uuid')       // স্বয়ংক্রিয় অনন্য আইডি (UUID)
  id: string;

  @Column({ unique: true })             // ইমেইল অনন্য হতে হবে
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @OneToMany(() => Post, (post) => post.author)  // একজন নাগরিক অনেক নোটিশ লিখতে পারে
  posts: Post[];

  @CreateDateColumn()                   // স্বয়ংক্রিয়ভাবে তৈরির তারিখ
  createdAt: Date;

  @UpdateDateColumn()                   // স্বয়ংক্রিয়ভাবে আপডেটের তারিখ
  updatedAt: Date;
}
```

**পৌরসভার অ্যানালজি:**

নাগরিক রেজিস্টার বইয়ের প্রতিটি পাতায় কলাম:
- `id` → নাগরিক নম্বর (UUID — যেমন `a3f2-bc4d-...`)
- `email` → নিবন্ধিত ঠিকানা (দুজনের একই হতে পারবে না)
- `name` → পুরো নাম
- `password` → গোপন পিন (এনক্রিপ্টেড)
- `posts` → এই নাগরিক কতগুলো নোটিশ লিখেছে তার তালিকা
- `createdAt` → কবে নিবন্ধন হয়েছিল (সিস্টেম নিজেই লেখে)
- `updatedAt` → সর্বশেষ কবে পরিবর্তন হয়েছে (সিস্টেম নিজেই লেখে)

`@OneToMany` → এক নাগরিক অনেক নোটিশ লিখতে পারে। এই সম্পর্কটা ডেটাবেজে লিপিবদ্ধ।

---

### Post Entity — নোটিশ রেজিস্টার

```typescript
// src/posts/entities/post.entity.ts
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')                       // লম্বা টেক্সটের জন্য 'text' টাইপ
  content: string;

  @Column({ default: false })           // ডিফল্টে প্রকাশিত নয়
  published: boolean;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;                     // সরাসরি FK কলাম

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**পৌরসভার অ্যানালজি:**

নোটিশ রেজিস্টার বইয়ের কলাম:
- `published: false` → নোটিশ লেখা হলেই বোর্ডে লাগানো হয় না। প্রথমে ড্রাফট থাকে।
- `@ManyToOne` → অনেক নোটিশ একজন নাগরিকের। `onDelete: 'CASCADE'` মানে নাগরিক মুছে গেলে তার সব নোটিশও মুছে যাবে।
- `authorId` → নোটিশের পাশে লেখকের নম্বর আলাদাভাবে থাকে, যাতে লেখক ছাড়াও নম্বর দিয়ে ফিল্টার করা যায়।

---

## ডিপেন্ডেন্সি ইনজেকশন (Dependency Injection)

### DI কী?

পৌরসভার একজন কর্মকর্তা কাজ করতে গেলে নিজেই রেজিস্টার বই কিনতে যান না। অফিস তাকে বলে: "তোমার কাজের জন্য এই রেজিস্টারটা লাগবে, এই নাও।" কর্মকর্তা কেবল কাজ করে — জিনিসপত্র যোগাড়ের চিন্তা করে না।

NestJS-এর **Dependency Injection** এই কাজটাই করে।

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,  // NestJS নিজেই এটা দেয়
  ) {}
}
```

**পৌরসভার অ্যানালজি:**

`UsersService` একজন কর্মকর্তা। সে বলে: "আমার User রেজিস্টার লাগবে।" NestJS (পৌরসভার সরবরাহ বিভাগ) বলে: "ঠিক আছে, এই নাও।" সে নিজে তৈরি করতে যায় না — NestJS তৈরি করে দেয়।

এর ফায়দা: কর্মকর্তা বদলালে বা পরীক্ষার সময় নকল রেজিস্টার দিলেও কোনো সমস্যা নেই।

---

## প্রজেক্টের মূল ফিচারসমূহ

### ফিচার ১ — নাগরিক নিবন্ধন ব্যবস্থা

**পৌরসভার সমতুল্য:** নতুন নাগরিকের জন্ম নিবন্ধন বা পরিচয়পত্র তৈরি।

```
POST /api/users
Body: { "email": "rahim@gmail.com", "name": "রহিম", "password": "123456" }
```

**কী হয় ধাপে ধাপে:**
১. `ValidationPipe` যাচাই করে — ইমেইল ঠিক আছে? নাম আছে? পাসওয়ার্ড ৬ অক্ষর?
২. `UsersController` অনুরোধ পায় এবং `UsersService`-এ পাঠায়।
৩. `UsersService` চেক করে এই ইমেইলে আগে কেউ নেই।
৪. `bcrypt` দিয়ে পাসওয়ার্ড এনক্রিপ্ট করে।
৫. ডেটাবেজে সংরক্ষণ করে।
৬. পাসওয়ার্ড বাদ দিয়ে নাগরিকের তথ্য ফেরত পাঠায়।

---

### ফিচার ২ — নাগরিক তালিকা ও অনুসন্ধান

**পৌরসভার সমতুল্য:** ভোটার তালিকা দেখা বা নির্দিষ্ট নাগরিকের ফাইল খোঁজা।

```
GET /api/users          → সব নাগরিকের তালিকা
GET /api/users/:id      → নির্দিষ্ট নাগরিকের তথ্য
```

---

### ফিচার ৩ — নোটিশ প্রকাশ ব্যবস্থা

**পৌরসভার সমতুল্য:** বোর্ডে নতুন বিজ্ঞপ্তি লাগানো। প্রথমে ড্রাফট তৈরি হয়, পরে প্রকাশিত করা হয়।

```
POST /api/posts
Body: {
  "title": "জলকর মওকুফ বিজ্ঞপ্তি",
  "content": "এই মাসে জলকর মওকুফ করা হয়েছে...",
  "published": true,
  "authorId": "uuid-of-user"
}
```

---

### ফিচার ৪ — নোটিশ অনুসন্ধান ও ফিল্টার

**পৌরসভার সমতুল্য:** নির্দিষ্ট কর্মকর্তার জারি করা সব নোটিশ দেখা।

```
GET /api/posts                        → সব নোটিশ (নতুন থেকে পুরনো)
GET /api/posts?authorId=uuid          → নির্দিষ্ট লেখকের নোটিশ
GET /api/posts/:id                    → নির্দিষ্ট নোটিশ (লেখকের তথ্যসহ)
```

---

### ফিচার ৫ — নোটিশ সংশোধন

**পৌরসভার সমতুল্য:** প্রকাশিত বিজ্ঞপ্তি সংশোধনী জারি করা।

```
PUT /api/posts/:id
Body: { "published": true }    → শুধু প্রকাশনার স্ট্যাটাস বদলানো
```

---

### ফিচার ৬ — নোটিশ বাতিল

**পৌরসভার সমতুল্য:** বোর্ড থেকে মেয়াদ উত্তীর্ণ বিজ্ঞপ্তি সরানো।

```
DELETE /api/posts/:id
```

ফলাফল: `{ "message": "Post #uuid deleted successfully" }`

---

### ফিচার ৭ — স্বয়ংক্রিয় এরর হ্যান্ডলিং

**পৌরসভার সমতুল্য:** সমস্ত কাউন্টারে একই ধরনের ত্রুটি সংবাদ পদ্ধতি।

ভুল ইউইউআইডি দিলে:
```json
{
  "statusCode": 400,
  "timestamp": "2026-05-01T10:00:00.000Z",
  "path": "/api/users/not-a-uuid",
  "message": "Validation failed (uuid is expected)"
}
```

অনুপস্থিত নাগরিক চাইলে:
```json
{
  "statusCode": 404,
  "timestamp": "2026-05-01T10:00:00.000Z",
  "path": "/api/users/abc-123",
  "message": "User #abc-123 not found"
}
```

---

## main.ts — পৌরসভার প্রধান ফটক

```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);     // পৌরসভা তৈরি করো
  
  app.setGlobalPrefix('api');                          // সব পথ /api দিয়ে শুরু

  app.useGlobalPipes(new ValidationPipe({...}));       // সব কাউন্টারে ফরম যাচাই
  app.useGlobalFilters(new HttpExceptionFilter());     // সব অভিযোগ একভাবে পরিচালনা

  await app.listen(process.env.PORT ?? 3000);          // পৌরসভা খোলো, লোক আসতে শুরু করুক
}
bootstrap();
```

**পৌরসভার অ্যানালজি:**

এটি হলো **পৌরসভার উদ্বোধন অনুষ্ঠান**। এখানে:
- সব বিভাগ খুলে দেওয়া হয় (`AppModule`)
- সব কাউন্টারে আবেদনপত্র যাচাইয়ের নির্দেশ দেওয়া হয় (`useGlobalPipes`)
- অভিযোগ নিষ্পত্তির নির্দেশনা দেওয়া হয় (`useGlobalFilters`)
- ফটক খোলা হয় পোর্ট ৩০০০-এ

`setGlobalPrefix('api')` → পৌরসভার সব কাজ `/api` রাস্তা দিয়ে আসবে। যেমন `/api/users`, `/api/posts`।

---

## data-source.ts — মাইগ্রেশন বিভাগের নির্দেশনা

```typescript
// src/data-source.ts
const AppDataSource = new DataSource({
  type: 'postgres',
  entities: ['src/**/*.entity.ts'],        // কোন কোন রেজিস্টার ব্যবহার হবে
  migrations: ['src/migrations/*.ts'],     // কোন কোন পরিবর্তন লগ আছে
  synchronize: false,                      // রেজিস্টার নিজে নিজে বদলাবে না
});
```

**পৌরসভার অ্যানালজি:**

`synchronize: false` অত্যন্ত গুরুত্বপূর্ণ। যদি `true` রাখা হয়, কোড পরিবর্তন করলেই ডেটাবেজ বদলে যাবে — এটা বিপজ্জনক কারণ আসল ডেটা মুছে যেতে পারে।

`false` রাখার মানে হলো: "রেজিস্টার বই বদলাতে হলে আলাদা Migration লিখো এবং সেটা অনুমোদন করে চালাও।" এটা পৌরসভার আনুষ্ঠানিক রেকর্ড পরিবর্তনের মতো — স্বেচ্ছাচারী পরিবর্তন করা যাবে না।

---

## শেখার পথ (Learning Path)

এই প্রজেক্টটি দেখে ধাপে ধাপে NestJS শেখার পরামর্শ:

### ধাপ ১ — ভিত্তি বোঝো

**প্রথমে পড়ো:** `main.ts` → `app.module.ts` → `app.controller.ts` → `app.service.ts`

এই চারটি ফাইল পড়লে বুঝবে: NestJS অ্যাপ কীভাবে শুরু হয়, মডিউল কী, কন্ট্রোলার কী, সার্ভিস কী।

**শেখার প্রশ্ন:**
- `NestFactory.create(AppModule)` — কে কী তৈরি করছে?
- `@Module`, `@Controller`, `@Injectable` এই তিনটির পার্থক্য কী?

---

### ধাপ ২ — ফিচার মডিউল বোঝো

**এরপর পড়ো:** `users/users.module.ts` → `users/users.controller.ts` → `users/users.service.ts`

**শেখার প্রশ্ন:**
- `imports`, `controllers`, `providers`, `exports` — এই চারটির ভূমিকা কী?
- সার্ভিস কীভাবে কন্ট্রোলারে ইনজেক্ট হয়?

---

### ধাপ ৩ — ডিটিও এবং ভ্যালিডেশন বোঝো

**এরপর পড়ো:** `users/dto/create-user.dto.ts` → `ValidationPipe` কনফিগারেশন

**শেখার প্রশ্ন:**
- `@IsEmail()`, `@IsString()`, `@IsNotEmpty()` কীভাবে কাজ করে?
- `whitelist: true` আর `forbidNonWhitelisted: true`-এর মধ্যে পার্থক্য?

---

### ধাপ ৪ — এন্টিটি এবং ডেটাবেজ বোঝো

**এরপর পড়ো:** `users/entities/user.entity.ts` → `posts/entities/post.entity.ts`

**শেখার প্রশ্ন:**
- `@Entity`, `@Column`, `@PrimaryGeneratedColumn` কী?
- `@OneToMany` আর `@ManyToOne` সম্পর্ক কীভাবে কাজ করে?
- `@JoinColumn` কী করে?

---

### ধাপ ৫ — রিপোজিটরি প্যাটার্ন বোঝো

**এরপর গভীরভাবে পড়ো:** `users/users.service.ts` → `posts/posts.service.ts`

**শেখার প্রশ্ন:**
- `usersRepository.findOne()`, `find()`, `create()`, `save()`, `remove()` — এরা কী করে?
- `relations: ['author']` কেন লাগে?
- `Object.assign()` partial update-এ কেন ব্যবহার হয়?

---

### ধাপ ৬ — এরর হ্যান্ডলিং বোঝো

**এরপর পড়ো:** `common/filters/http-exception.filter.ts`

**শেখার প্রশ্ন:**
- `@Catch(HttpException)` কীভাবে কাজ করে?
- `ConflictException`, `NotFoundException` কোথা থেকে আসে?

---

### ধাপ ৭ — মাইগ্রেশন বোঝো

**শেষে পড়ো:** `data-source.ts` এবং `package.json`-এর মাইগ্রেশন স্ক্রিপ্ট

**শেখার প্রশ্ন:**
- `migration:generate` কী করে?
- `migration:run` কী করে?
- কেন `synchronize: false` রাখা উচিত?

---

### বাস্তব অনুশীলন

এই প্রজেক্টে হাত দিয়ে শেখার জন্য কিছু কাজ:

১. একটি নতুন নাগরিক তৈরি করো (`POST /api/users`) এবং দেখো সার্ভার কী বলে।
২. ভুল ইমেইল দিয়ে চেষ্টা করো — `ValidationPipe` কী বার্তা দেয়?
৩. একই ইমেইলে দুবার চেষ্টা করো — `ConflictException` কীভাবে দেখায়?
৪. নতুন একটি পোস্ট তৈরি করো এবং `?authorId=` দিয়ে ফিল্টার করো।
৫. একটি পোস্টের `published: true` করো `PUT` দিয়ে।

---

## উপসংহার

এই ব্লগ API প্রজেক্টটি NestJS-এর মূল ধারণাগুলো সুন্দরভাবে একসাথে দেখায়। পৌরসভার অ্যানালজিতে বলতে গেলে:

- **AppModule** হলো পৌরসভার প্রধান কার্যালয় যেখানে সব বিভাগ নথিভুক্ত।
- **UsersModule ও PostsModule** হলো দুটি স্বয়ংসম্পূর্ণ বিভাগ।
- **Controllers** হলো রিসেপশন কাউন্টার — অনুরোধ গ্রহণ করে, কাজ করে না।
- **Services** হলো কর্মকর্তারা — আসল সিদ্ধান্ত নেয়, ডেটাবেজে কাজ করে।
- **DTOs** হলো আবেদনপত্রের ফরম — কী তথ্য লাগবে নির্ধারণ করে।
- **ValidationPipe** হলো ফরম পরীক্ষক — ভুল তথ্য আসলে প্রত্যাখ্যান করে।
- **Entities** হলো রেজিস্টার বইয়ের ডিজাইন — ডেটাবেজ টেবিলের নকশা।
- **HttpExceptionFilter** হলো অভিযোগ নিষ্পত্তি বিভাগ — সমস্যা সুন্দরভাবে জানায়।
- **Decorators** হলো পরিচয়পত্র — প্রতিটি ক্লাস বা মেথডের ভূমিকা চিহ্নিত করে।

NestJS শেখার সবচেয়ে বড় চাবিকাঠি হলো: **প্রতিটি জিনিসের একটি নির্দিষ্ট জায়গা আছে, নির্দিষ্ট দায়িত্ব আছে।** এই নিয়ম মেনে চললে বড় প্রজেক্টেও কোড পরিষ্কার ও বোধগম্য থাকে।

---

*এই গাইডটি তৈরি করা হয়েছে `blog-api` প্রজেক্টের সম্পূর্ণ সোর্স কোড বিশ্লেষণ করে। NestJS v11, TypeORM v0.3, PostgreSQL ব্যবহার করা হয়েছে।*
