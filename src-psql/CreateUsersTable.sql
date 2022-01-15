CREATE TABLE users (
    id VARCHAR(20) NOT NULL PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    password TEXT NOT NULL,
    friends VARCHAR(20)[] NOT NULL,
    outgoing_req VARCHAR(20)[] NOT NULL,
    incoming_req VARCHAR(20)[] NOT NULL
);