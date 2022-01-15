FROM postgres:latest

ENV POSTGRES_USER do-gether-user
ENV POSTGRES_PASSWORD do-gether-password
ENV POSTGRES_DB do-gether

ADD CreateListsTable.sql /docker-entrypoint-initdb.d/
ADD CreateUsersTable.sql /docker-entrypoint-initdb.d/
ADD CreateTasksTable.sql /docker-entrypoint-initdb.d/