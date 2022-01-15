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