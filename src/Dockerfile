FROM golang:latest

LABEL author="Jia Wei <b33b33o11@gmail.com>"

WORKDIR /app

COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD postgres-test-password
ENV POSTGRES_HOST localhost
ENV POSTGRES_PORT 5432
ENV PASSWORD_SECRET dOgEtHeRpW123!@#
ENV JWT_SECRET dOgEtHeRjWt123!@#
ENV PORT 8080

RUN go build

CMD ["./do-gether"]