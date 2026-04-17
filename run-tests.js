const assert = require("node:assert/strict");
const { createLocalBlockchain } = require("./backend/src/blockchain");
const { createStorage } = require("./backend/src/storage");
const { sha256 } = require("./backend/src/utils");

function run(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack);
    process.exitCode = 1;
  }
}

run("storage seeds demo data", () => {
  const storage = createStorage({ dataDir: "./data-test-storage" });
  const db = storage.load();
  assert.equal(db.users.length >= 3, true);
  assert.equal(db.patients.length >= 1, true);
});

run("local blockchain appends verifiable block", () => {
  const blockchain = createLocalBlockchain({ dataDir: "./data-test-ledger" });
  const payload = { type: "DRUG_BATCH", batchHash: sha256("demo") };
  const block = blockchain.appendBlock(payload);
  assert.equal(block.payload.type, "DRUG_BATCH");
  assert.equal(blockchain.verifyPayload(payload).id, block.id);
});

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}
