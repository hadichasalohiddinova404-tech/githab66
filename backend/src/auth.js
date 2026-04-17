const crypto = require("node:crypto");

function createAuth(config) {
  function sign(payload) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
      .createHmac("sha256", config.jwtSecret)
      .update(encoded)
      .digest("base64url");
    return `${encoded}.${signature}`;
  }

  function verify(token) {
    if (!token || !token.includes(".")) {
      return null;
    }
    const [encoded, signature] = token.split(".");
    const expected = crypto
      .createHmac("sha256", config.jwtSecret)
      .update(encoded)
      .digest("base64url");
    if (expected !== signature) {
      return null;
    }
    try {
      return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    } catch (error) {
      return null;
    }
  }

  function getUserFromRequest(req) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    return verify(token);
  }

  return { sign, verify, getUserFromRequest };
}

module.exports = { createAuth };
