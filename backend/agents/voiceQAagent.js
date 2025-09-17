// backend/agents/voiceQAagent.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * Voice QA Agent - Generates audio reports using ElevenLabs API
 * @param {object} context - The job context containing QA results
 * @returns {object} Updated context with voice report URL
 */
async function voiceQAagent(context) {
  try {
    const { jobId, results } = context;

    // Check if we have results to report
    if (!results) {
      throw new Error("No QA results available for voice report");
    }

    // Generate the text report from results
    const reportText = generateVoiceReport(results);

    // Generate voice audio using ElevenLabs
    const audioUrl = await generateElevenLabsVoice(reportText, jobId);

    // Update context with voice report
    return {
      ...context,
      voiceReport: {
        audioUrl,
        textReport: reportText,
        generatedAt: new Date().toISOString(),
      },
      message: "Voice report generated successfully",
    };
  } catch (error) {
    console.error("Voice QA Agent Error:", error);
    throw new Error(`Voice report generation failed: ${error.message}`);
  }
}

/**
 * Generates a natural language summary from QA results
 */
function generateVoiceReport(results) {
  let report = "QA Analysis Report. ";

  if (results.testResults) {
    report += `Tests: ${results.testResults.passedTests} passed, ${results.testResults.failedTests} failed. `;
    report += `Code coverage: ${results.testResults.coveragePercentage} percent. `;
  }

  if (results.securityData) {
    report += `Security scan found ${results.securityData.vulnerabilities.high} high risk vulnerabilities. `;
    report += `Overall risk score: ${results.securityData.riskScore} out of 100. `;
  }

  if (results.analysisData) {
    report += `AI analysis identified ${results.analysisData.identifiedBugs} potential bugs. `;
    report += `Confidence level: ${Math.round(
      results.analysisData.confidence * 100
    )} percent. `;
  }

  report +=
    "Report generation complete. Review the detailed findings in your dashboard.";
  return report;
}

/**
 * Calls ElevenLabs API to generate voice audio
 */
async function generateElevenLabsVoice(text, jobId) {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Default voice: Rachel

  if (!ELEVENLABS_API_KEY) {
    throw new Error("ElevenLabs API key not configured");
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        responseType: "stream",
      }
    );

    // Save audio file locally (or upload to cloud storage)
    const audioDir = path.join(__dirname, "..", "audio-reports");
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const audioPath = path.join(audioDir, `${jobId}.mp3`);
    const writer = fs.createWriteStream(audioPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(`/audio-reports/${jobId}.mp3`));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(
      "ElevenLabs API Error:",
      error.response?.data || error.message
    );
    throw new Error(`Voice synthesis failed: ${error.message}`);
  }
}

module.exports = voiceQAagent;
