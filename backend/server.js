// backend/server.js

const express = require("express");
const cors = require("cors");
const { EventEmitter } = require("events");
const { Coral, Agent } = require("@coral-ai/core");
const {
  RepoClonerAgent,
  UnitTestAgent,
  SecurityAgent,
  MistralBugReasoningAgent,
  AggregatorAgent,
} = require("./agents");

const app = express();
const PORT = 4000;
const jobEvents = new EventEmitter();

app.use(cors());
app.use(express.json());

// Initialize Coral instance
const coral = new Coral();

// SSE endpoint for job updates
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const onUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  jobEvents.on("update", onUpdate);

  // Clean up listener when client disconnects
  req.on("close", () => {
    jobEvents.removeListener("update", onUpdate);
  });
});

// Main orchestration endpoint with Coral
app.post("/api/start-qa", async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: "repoUrl is required" });
    }

    const jobId = `job-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Emit initial status to connected clients
    jobEvents.emit("update", {
      jobId,
      status: "started",
      message: "QA pipeline started.",
      repoUrl,
    });

    const initialContext = {
      jobId,
      repoUrl,
      results: {},
    };

    // Define the agent execution sequence
    const agents = [
      new RepoClonerAgent(),
      new UnitTestAgent(),
      new SecurityAgent(),
      new MistralBugReasoningAgent(),
      new AggregatorAgent(),
    ];

    // Execute the agent sequence using Coral
    const finalContext = await coral.execute(initialContext, agents);

    // Emit completion status to connected clients
    jobEvents.emit("update", {
      jobId,
      status: "completed",
      message: "QA pipeline completed.",
      finalResults: finalContext.results,
    });

    // Return a response to the client immediately
    res.status(200).json({
      jobId: finalContext.jobId,
      message: "QA pipeline started. Check /events for real-time updates.",
    });
  } catch (error) {
    console.error("Error during QA process:", error);
    jobEvents.emit("update", {
      status: "error",
      message: `Error: ${error.message}`,
    });
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`QAaaS backend running on http://localhost:${PORT}`);
});
