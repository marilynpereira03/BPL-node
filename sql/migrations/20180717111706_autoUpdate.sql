/* Create Schema
 *
 */

BEGIN;

/* Tables */
CREATE TABLE IF NOT EXISTS "autoupdates"(
  "id" SERIAL PRIMARY KEY,
  "transactionId" VARCHAR(64) NOT NULL,
  "versionLabel" VARCHAR(100) NOT NULL,
  "triggerHeight" INT NOT NULL,
  "ipfsHash" VARCHAR(46) NOT NULL,
  "ipfsPath" VARCHAR(100) NOT NULL,
  "verifyingTransactionId" VARCHAR(64),
  FOREIGN KEY("transactionId") REFERENCES "transactions"("id"),
  FOREIGN KEY("verifyingTransactionId") REFERENCES "transactions"("id") ON DELETE CASCADE
);

COMMIT;
