// frontend/components/VoiceQA/VoiceRecorder.js
import React, { useState, useRef } from "react";
import { Mic, Square, Trash2 } from "lucide-react";

const VoiceRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        onRecordingComplete?.(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      audioChunksRef.current = [];
    } catch (error) {
      console.error("Recording failed:", error);
      alert("Microphone access denied or unavailable");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    audioChunksRef.current = [];
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex items-center space-x-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-full ${
            isRecording
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isRecording ? (
            <Square className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            {isRecording
              ? "Recording..."
              : audioBlob
              ? "Recording ready"
              : "Ready to record"}
          </div>
          <div className="text-xs text-gray-600">
            {isRecording ? "Click square to stop" : "Click microphone to start"}
          </div>
        </div>

        {audioBlob && (
          <button
            onClick={clearRecording}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            title="Delete recording"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isRecording && (
        <div className="mt-3">
          <div className="w-full bg-red-200 rounded-full h-1">
            <div className="bg-red-500 h-1 rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
