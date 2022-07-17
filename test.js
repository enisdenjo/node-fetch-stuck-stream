import http from "http";

import fetch2 from "node-fetch2";
import fetch3 from "node-fetch3";

function startServer() {
  let disposed = false;
  const server = http.createServer(async (_req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.flushHeaders();

    let i = 0;
    while (!disposed) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      res.write(`data:${i}\n\n`);
      i++;
    }
  });

  // store established sockets and create disposeer
  const sockets = new Set();
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });
  const dispose = async () => {
    disposed = true;
    for (const socket of sockets) {
      socket.destroy();
    }
    await new Promise((resolve) => server.close(() => resolve()));
  };

  // start server and let the OS allocate a port
  server.listen(0);

  const addr = server.address();
  const url = `http://localhost:${addr.port}`;

  return [url, dispose];
}

describe("should report server abruptly going away in the middle of streaming", () => {
  it("node-fetch@v2", (done) => {
    const [url, dispose] = startServer();

    (async () => {
      const res = await fetch2(url);

      try {
        let i = 0;
        for await (const _chunk of res.body) {
          i++;

          if (i > 5) {
            // dispose of server after fifth emission
            await dispose();
          }
        }
      } catch {
        // noop
      } finally {
        done(); // ❌ never reached
      }
    })();
  });

  it("node-fetch@v3", (done) => {
    const [url, dispose] = startServer();

    (async () => {
      const res = await fetch3(url);

      try {
        let i = 0;
        for await (const _chunk of res.body) {
          i++;

          if (i > 5) {
            // dispose of server after fifth emission
            await dispose();
          }
        }
      } catch {
        // noop
      } finally {
        done(); // ✅ reached
      }
    })();
  });
});
