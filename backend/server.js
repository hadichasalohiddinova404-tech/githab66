const http = require("node:http");
const { createApp } = require("./src/app");

const app = createApp();
const port = Number(process.env.PORT || 3000);

http.createServer((req, res) => app.handle(req, res)).listen(port, () => {
  console.log(`Polyclinic EMR server running on http://localhost:${port}`);
});
