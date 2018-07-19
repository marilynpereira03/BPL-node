BEGIN;

CREATE TABLE IF NOT EXISTS "poll"(
  "pollName" VARCHAR(50) NOT NULL UNIQUE,
  "pollAddress" VARCHAR(50) NOT NULL,
  "pollStartDate" INT NOT NULL,
  "pollEndDate" INT NOT NULL,
  "intentions" VARCHAR(50) NOT NULL,
  "transactionId" VARCHAR(64) NOT NULL,
  FOREIGN KEY("transactionId") REFERENCES transactions(id) ON DELETE CASCADE
);

COMMIT;
