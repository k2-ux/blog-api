# Docker Guide for This Project

## How Docker is used here

This project uses Docker only for **PostgreSQL**. The NestJS app itself runs normally on your machine with `npm run start:dev`. Docker just replaces installing PostgreSQL directly on your system.

```
Your Machine
├── NestJS app (npm run start:dev) → port 3000
└── Docker
    └── blog-api-postgres container → port 5433
```

---

## Daily workflow

### Start the database
```bash
docker compose up -d
```
Starts the postgres container in the background. Run this before `npm run start:dev`.

### Stop the database
```bash
docker compose down
```
Stops and removes the container. Your data is safe — it lives in the volume, not the container.

### Check if it's running
```bash
docker compose ps
```
Shows the status of containers defined in docker-compose.yml.

---

## Seeing what's happening

### See container logs (postgres output)
```bash
docker compose logs postgres
```

### Follow logs in real time
```bash
docker compose logs -f postgres
```
`-f` means follow — streams new log lines as they appear. Ctrl+C to stop.

### See all running containers on your machine
```bash
docker ps
```

### See all containers including stopped ones
```bash
docker ps -a
```

---

## Getting inside the database

### Open a psql shell inside the container
```bash
docker exec -it blog-api-postgres psql -U blog_user -d blog_api
```
This drops you into a PostgreSQL prompt where you can run raw SQL.

```sql
-- some useful commands once inside psql
\dt                          -- list all tables
SELECT * FROM users;         -- see all users
SELECT * FROM posts;         -- see all posts
\q                           -- quit
```

---

## Nuclear options (careful)

### Stop everything and delete containers
```bash
docker compose down
```
Containers gone, but **data volume survives**.

### Stop everything AND delete data (full reset)
```bash
docker compose down -v
```
`-v` deletes the volume too. Your database is completely wiped.
Use this when you want a fresh start (e.g. migration issues, corrupt data).
After this you need to run `npm run migration:run` again.

### Kill a specific container immediately
```bash
docker kill blog-api-postgres
```
Force stops the container without a graceful shutdown. Use `docker compose down` normally — only use `kill` if the container is frozen.

---

## Images

### See all downloaded images and their sizes
```bash
docker images
```

### Delete an image you no longer need
```bash
docker rmi postgres:16-alpine
```
Only works if no container is using it. Frees up disk space.

### Delete all unused images (cleanup)
```bash
docker image prune
```

---

## Volumes (where your data lives)

### List all volumes
```bash
docker volume ls
```

### Inspect where the blog-api volume is stored
```bash
docker volume inspect blog-api_blog_api_pgdata
```

### Delete the blog-api data volume manually
```bash
docker volume rm blog-api_blog_api_pgdata
```
Same effect as `docker compose down -v` but done manually.

---

## Quick reference

| Command | What it does |
|---|---|
| `docker compose up -d` | Start containers in background |
| `docker compose down` | Stop and remove containers (data safe) |
| `docker compose down -v` | Stop, remove containers AND data |
| `docker compose ps` | Status of this project's containers |
| `docker compose logs -f postgres` | Stream postgres logs |
| `docker ps` | All running containers on machine |
| `docker ps -a` | All containers including stopped |
| `docker images` | All downloaded images and sizes |
| `docker exec -it blog-api-postgres psql -U blog_user -d blog_api` | Open psql shell |
| `docker kill blog-api-postgres` | Force stop a container |
| `docker image prune` | Delete unused images |
