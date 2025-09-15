
// 2. **backend/server.js**
//```javascript

const express = require("express");
const cors = require("cors");
const { EventEmitter } = require("events");

const app = express();
const PORT = 4000;
const jobEvents = new EventEmitter();

app.use(cors());
app.use(express.json());

// Example SSE endpoint for job updates
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  jobEvents.on("update", (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
});

// Trigger a sample QA pipeline run
app.post("/run-tests", (req, res) => {
  const { repoUrl } = req.body;
  jobEvents.emit("update", { status: "started", repoUrl });

  setTimeout(() => {
    jobEvents.emit("update", { status: "completed", result: "All tests passed ✅" });
  }, 3000);

  res.json({ message: "QA pipeline started." });
});

app.listen(PORT, () => {
  console.log(`QAaaS backend running on http://localhost:${PORT}`);
});
