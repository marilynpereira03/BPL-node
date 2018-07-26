BEGIN;

CREATE TABLE IF NOT EXISTS "polls"(
  "name" VARCHAR(50) NOT NULL,
  "address" VARCHAR(50) UNIQUE NOT NULL,
  "startTimestamp" INT NOT NULL,
  "endTimestamp" INT NOT NULL,
  "intentions" VARCHAR(50) NOT NULL,
  "transactionId" VARCHAR(64) NOT NULL,
  FOREIGN KEY("transactionId") REFERENCES transactions(id) ON DELETE CASCADE
);

COMMIT;
