const path = require("node:path");

function getConfig() {
  return {
    appName: process.env.APP_NAME || "Husanboy",
    jwtSecret: process.env.JWT_SECRET || "dev-secret",
    dataDir: path.resolve(process.cwd(), process.env.DATA_DIR || "data"),
    blockchainMode: process.env.BLOCKCHAIN_MODE || "local",
    chainName: process.env.CHAIN_NAME || "polygon-amoy",
  };
}

module.exports = { getConfig };
