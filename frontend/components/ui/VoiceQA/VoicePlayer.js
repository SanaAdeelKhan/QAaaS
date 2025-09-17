// frontend/components/VoiceQA/VoicePlayer.js
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Volume2 } from "lucide-react";
import { downloadAudioReport } from "../../utils/voiceAPI";

const VoicePlayer = ({ jobId, audioUrl, fileName = "qa-report.mp3" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = async () => {
    try {
      await downloadAudioReport(jobId, fileName);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Player Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlayback}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          title="Download audio report"
        >
          <Download className="w-5 h-5" />
        </button>

        <Volume2 className="w-5 h-5 text-gray-400" />
      </div>

      {/* Status */}
      <div className="mt-2 text-sm text-gray-600">
        {isPlaying ? "Playing..." : "Ready to play"}
      </div>
    </div>
  );
};

export default VoicePlayer;
