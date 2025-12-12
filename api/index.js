import "dotenv/config";
import http from "http";

const host = "0.0.0.0";
const port = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok" }));
});

server.listen(port, host, () => {
  console.log(`API server listening on http://${host}:${port}`);
});
