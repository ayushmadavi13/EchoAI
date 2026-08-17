import { useState, useRef, useCallback } from 'react';

export default function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const options = { mimeType: 'audio/webm' };
      // Fallback for browsers that don't support audio/webm
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/ogg';
      }
      
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        setAudioBlob(audioBlob);
        
        // Stop all audio tracks to release microphone permission indicator
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start(100); // chunk every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error starting voice recorder:', err);
      alert('Could not access microphone. Please allow microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  return {
    isRecording,
    audioBlob,
    recordingTime,
    startRecording,
    stopRecording
  };
}
