import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VoiceInput({ onTranscript, label = "הקלט קולי" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("🎤 ההקלטה החלה - דבר בבקשה");
    } catch (error) {
      toast.error("❌ לא ניתן לגשת למיקרופון. נא לבדוק את ההרשאות.");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      // Simulate processing - in production, integrate with speech-to-text API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.info("💡 תכונת המרת דיבור לטקסט תהיה זמינה בקרוב. בינתיים, נא להקליד ידנית.");
      onTranscript("");
    } catch (error) {
      toast.error("❌ שגיאה בעיבוד ההקלטה");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {!isRecording && !isProcessing && (
        <Button
          type="button"
          onClick={startRecording}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl transition-all duration-300"
          size="lg"
        >
          <Mic className="w-5 h-5 ml-2" />
          {label}
        </Button>
      )}
      
      {isRecording && (
        <Button
          type="button"
          onClick={stopRecording}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-xl animate-pulse"
          size="lg"
        >
          <Square className="w-5 h-5 ml-2" />
          עצור הקלטה
        </Button>
      )}
      
      {isProcessing && (
        <Button
          disabled
          className="bg-gray-600 text-white cursor-not-allowed"
          size="lg"
        >
          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
          מעבד הקלטה...
        </Button>
      )}
    </div>
  );
}