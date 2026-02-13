import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput = ({ onTranscript, disabled }: VoiceInputProps) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to use a supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        if (audioBlob.size < 1000) {
          toast({
            title: "Recording too short",
            description: "Please speak for at least a second.",
            variant: "destructive",
          });
          return;
        }
        await processAudio(audioBlob);
      };

      mediaRecorder.start(250); // collect data every 250ms for smoother recording
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      toast({
        title: "Microphone Access Required",
        description: "Please enable microphone access in your browser settings.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64 properly using ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in a safe way
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64Audio = btoa(binary);

      // Get the current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Please sign in to use voice input");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-to-text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ audio: base64Audio })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Transcription failed");
      }

      const data = await response.json();

      if (data?.text?.trim()) {
        onTranscript(data.text.trim());
        toast({
          title: "✅ Voice captured",
          description: `"${data.text.trim().slice(0, 60)}${data.text.trim().length > 60 ? '...' : ''}"`,
        });
      } else {
        toast({
          title: "No speech detected",
          description: "Please try speaking more clearly or closer to your microphone.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Transcription error:", err);
      toast({
        title: "Voice input failed",
        description: err instanceof Error ? err.message : "Could not process your voice. Please try typing instead.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {isRecording && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/10 border border-destructive/20 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs font-mono text-destructive">{formatTime(recordingTime)}</span>
        </div>
      )}
      {isProcessing && (
        <span className="text-xs text-muted-foreground animate-fade-in">Transcribing...</span>
      )}
      <Button
        type="button"
        variant={isRecording ? "destructive" : "ghost"}
        size="icon"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`transition-all duration-200 ${isRecording ? "animate-pulse shadow-md" : "hover:bg-primary/10"}`}
        title={isRecording ? "Stop recording" : "Start voice input"}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};

export default VoiceInput;
