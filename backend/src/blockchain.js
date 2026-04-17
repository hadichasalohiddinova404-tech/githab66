const path = require("node:path");
const { readJson, writeJson, sha256, createId } = require("./utils");

function createLocalBlockchain(config) {
  const ledgerFile = path.join(config.dataDir, "ledger.json");

  function readLedger() {
    const ledger = readJson(ledgerFile, null);
    if (ledger) {
      return ledger;
    }
    const genesis = {
      chain: [
        {
          id: "block_genesis",
          previousHash: "0",
          payloadHash: sha256("genesis"),
          hash: sha256("0:genesis"),
          createdAt: new Date().toISOString(),
          payload: { type: "GENESIS" },
        },
      ],
    };
    writeJson(ledgerFile, genesis);
    return genesis;
  }

  function appendBlock(payload) {
    const ledger = readLedger();
    const previous = ledger.chain[ledger.chain.length - 1];
    const createdAt = new Date().toISOString();
    const payloadHash = sha256(JSON.stringify(payload));
    const hash = sha256(`${previous.hash}:${payloadHash}:${createdAt}`);
    const block = {
      id: createId("block"),
      previousHash: previous.hash,
      payloadHash,
      hash,
      createdAt,
      payload,
    };
    ledger.chain.push(block);
    writeJson(ledgerFile, ledger);
    return block;
  }

  function verifyPayload(payload) {
    const ledger = readLedger();
    const payloadHash = sha256(JSON.stringify(payload));
    return ledger.chain.find((item) => item.payloadHash === payloadHash) || null;
  }

  return {
    readLedger,
    appendBlock,
    verifyPayload,
  };
}

module.exports = { createLocalBlockchain };
