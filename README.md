# Do-gether

Name: Lee Jia Wei

Matric Number: A0235256E

---

Do-gether is a self-host task management application that seeks to spice things up your to-do list a little bit with friends!

## Features

- Create accounts and login from anywhere to view your tasks
- Create custom lists to group your tasks
- Create, edit or delete tasks
- Introduce tags to your tasks for ease of organisation, search and filter
- Prioritise tasks with 3 levels of priority
- Drag to sort and reorder tasks to your liking
- Include due dates, planned start and end dates to stay ahead of deadlines
- Add friends and complete tasks together
- View friends' tasks to peek into their schedule
- Fully open-source and self-hosted

## Getting started

Clone the repository and you may choose to run it via docker or on bare metal.

### Docker

Simply run

``` bash
docker-compose up --build
```

in the directory with the `docker-compose.yml`.

### Bare Metal

You would need the following 3 services:

1. PostgreSQL database
2. Go backend
3. React frontend

#### PostgreSQL database

Download and initiate a PostgreSQL database from [their webpage](https://www.postgresql.org/download/).

By default, Do-gether backend connects to the PostgreSQL database as `do-gether-user` with password `do-gether-password`.

``` sql
CREATE USER do-gether-user WITH PASSWORD 'do-gether-password';`
```

A database `do-gether` in PostgreSQL is required for Do-gether to work properly as all data will be stored in that database.

``` sql
CREATE DATABASE do-gether;
```

The following 3 tables will be used to store all data accordingly: `lists`, `tasks`, `users`.

To create the `lists` table:

``` sql
CREATE TABLE lists (
    id VARCHAR(20) NOT NULL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    owner VARCHAR(20) NOT NULL,
    private BOOLEAN NOT NULL,
    members VARCHAR(20)[] NOT NULL
);
```

To create the `tasks` table:

``` sql
CREATE TABLE tasks (
    id VARCHAR(20) NOT NULL PRIMARY KEY,
    owner VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    tags VARCHAR(20)[] NOT NULL,
    "listId" VARCHAR(20) NOT NULL,
    "listOrder" INTEGER NOT NULL,
    priority SMALLINT NOT NULL,
    due BIGINT NOT NULL,
    "plannedStart" BIGINT NOT NULL,
    "plannedEnd" BIGINT NOT NULL,
    completed BOOLEAN NOT NULL
);
```

To create the `users` table:

``` sql
CREATE TABLE users (
    id VARCHAR(20) NOT NULL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    friends VARCHAR(20)[] NOT NULL,
    outgoing_req VARCHAR(20)[] NOT NULL,
    incoming_req VARCHAR(20)[] NOT NULL
);
```

#### Go Backend

Ensure you have [Go](https://go.dev/dl/) installed. Navigate to `./src` where the backend code resides. Then compile the source code.

``` bash
go build
```

Spin up the backend server by running the compiled binary.

Alternatively, you may run

``` bash
go run main.go
```

#### React Frontend

Ensure you have [Node](https://nodejs.org/en/download/) installed. Navigate to `./src-ui` where the frontend code resides. Then run

``` bash
npm start
```

## Contributing

Do-gether is far from finished. Any contribution is greatly appreciated. Please submit an [issue](https://github.com/beebeeoii/do-gether/issues) or fork this repo and submit a [pull request](https://github.com/beebeeoii/do-gether/pulls) if necessary.
