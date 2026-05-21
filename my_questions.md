how the local data traverses to online database?
how jwt works? 
how the backend decides how to write the headers in the frontend?
when a user registers through google sdk vs when he registers via plain email password, how is he saved in the database in each case?
what happens step by step when I call fetch() or axios.get() and the backend receives it?
what is CORS and why does the browser block my requests but Postman doesn't?
how does the backend know which user is logged in without asking for password every time?
what is the difference between authentication and authorization?
how does hashing a password work — and how does the backend check it if it can't reverse it?
what is a DTO and why can't I just send any object from the frontend?
what is middleware in NestJS and how is it different from an interceptor or a guard?
when I send a request, what is the exact order NestJS processes it (middleware → guard → pipe → controller → service)?
what is an ORM and why use TypeORM instead of writing raw SQL?
how does a database "connection" work — is it open the whole time the server is running?
what happens when two users send a request at the exact same time?
how does the backend send errors to the frontend in a consistent format?
what is the difference between a 401 and a 403 status code?
how does pagination work on the backend — why not just send all the data?
how does file upload work — where does the file actually go?
what is an environment variable and why can't I just hardcode the database password?
what is the difference between cookies and localStorage for storing a JWT, and which should I use?
how does a refresh token work — why do we need two tokens?
what is rate limiting and how does it protect the backend?
what is a webhook — how is it different from a normal API call?
how does the backend validate that the data coming from the frontend is correct (e.g. email format, required fields)?
what is the difference between REST and GraphQL from a backend perspective?

// database migrations
what is a database migration and why can't I just edit the database schema directly?
what is the difference between synchronize:true in TypeORM and running actual migrations?
why is synchronize:true dangerous in production?
what happens to the existing data in a table when I add a new required column via migration?
how do I undo a migration if something goes wrong — what is a rollback?
if two developers change the schema at the same time, how do migrations handle that conflict?
what is the difference between a migration and a seed?
where do migration files live and should I commit them to git?
how does TypeORM know which migrations have already run and which haven't?
if I delete a migration file, what happens — does the database change?
what is the correct order of steps: write entity → generate migration → run migration?
how do I rename a column safely without losing data?
what happens to foreign keys and relations when I run a migration that drops a table?
when I deploy to production, how and when do migrations run — manually or automatically?