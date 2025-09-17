// frontend/utils/voiceAPI.js
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Fetches the voice report for a specific job
 */
export const getVoiceReport = async (jobId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/jobs/${jobId}/voice-report`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching voice report:", error);
    throw new Error("Failed to fetch voice report");
  }
};

/**
 * Streams audio from the backend
 */
export const streamAudio = async (audioUrl) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${audioUrl}`, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error streaming audio:", error);
    throw new Error("Failed to stream audio");
  }
};

/**
 * Downloads audio report
 */
export const downloadAudioReport = async (
  jobId,
  filename = "qa-report.mp3"
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/jobs/${jobId}/download-voice`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading audio:", error);
    throw new Error("Failed to download audio report");
  }
};

/**
 * Gets available voices from ElevenLabs
 */
export const getAvailableVoices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/voices`);
    return response.data;
  } catch (error) {
    console.error("Error fetching voices:", error);
    return [];
  }
};
