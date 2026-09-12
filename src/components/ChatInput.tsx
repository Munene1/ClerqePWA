import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { liveTranscriptionUrl, type LiveTranscriptEvent } from "../api/voice";

export default function ChatInput({
  disabled,
  reconnectFailed,
  accessToken,
  feedbackRequested,
  onReconnect,
  onSend,
  onOpenFeedback,
}: {
  disabled: boolean;
  reconnectFailed?: boolean;
  accessToken: string;
  feedbackRequested?: boolean;
  onReconnect?: () => void;
  onSend: (text: string) => void;
  onOpenFeedback?: () => void;
}) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const cancelRecording = useRef(false);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const monitorGainRef = useRef<GainNode | null>(null);
  const partialTranscriptRef = useRef("");
  const finalReceivedRef = useRef(false);
  const recordingRef = useRef(false);
  const awaitingFinalRef = useRef(false);
  const transcriptionTimerRef = useRef<number | null>(null);
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const showSend = text.trim().length > 0;

  useEffect(() => () => teardownVoice(), []);

  return (
    <div className="mx-3 mb-3 rounded-[2rem] border border-black/6 bg-white/96 px-5 py-2 shadow-[0_8px_32px_rgba(15,23,42,0.14)] backdrop-blur-md dark:border-gray-800 dark:bg-black/96 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {(recording || transcribing || transcript || voiceError) && (
        <div className="mb-2 rounded-2xl bg-gray-50 p-3 text-sm dark:bg-white/5">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {recording ? "Listening..." : transcribing ? "Transcribing..." : "Review transcript"}
            </span>
            <button
              type="button"
              className="text-xs text-gray-500"
              onClick={() => {
                setTranscript("");
                setVoiceError(null);
                cancelRecording.current = true;
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                  socketRef.current.send(JSON.stringify({ type: "audio.cancel" }));
                }
                teardownVoice();
              }}
            >
              Cancel
            </button>
          </div>
          {voiceError && <div className="mb-2 text-red-600 dark:text-red-300">{voiceError}</div>}
          {transcript && (
            <>
              <textarea
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                readOnly={recording || transcribing}
                className="mb-2 w-full resize-none rounded-xl border border-black/10 bg-white p-2 text-gray-800 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
                rows={3}
              />
              <button
                type="button"
                disabled={recording || transcribing || !transcript.trim()}
                className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
                onClick={() => {
                  if (!transcript.trim()) return;
                  onSend(transcript.trim());
                  setTranscript("");
                  setVoiceError(null);
                }}
              >
                Send transcript
              </button>
            </>
          )}
        </div>
      )}
      <div className="flex items-end gap-1.5">
      {feedbackRequested ? (
        <>
          <div className="flex-1 py-2 text-[15px] text-gray-400 dark:text-[#8aa7a2]">
            Tell us about your experience
          </div>
          <button
            onClick={onOpenFeedback}
            className="mb-0.5 flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
          >
            Share feedback
            <Icon name="arrow_forward" className="text-sm" />
          </button>
        </>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!text.trim()) return;
                onSend(text.trim());
                setText("");
              }
            }}
            disabled={disabled}
            rows={1}
            style={{ color: text.trim().length > 0 ? (isDark ? "#eef7f5" : "#1f2937") : undefined }}
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none dark:text-[#eef7f5] dark:placeholder:text-[#8aa7a2]"
            placeholder={
              reconnectFailed
                ? "Disconnected from Clerqe"
                : disabled
                  ? "Waiting for connection..."
                  : "Message Clerqe..."
            }
          />
          {reconnectFailed ? (
            <button
              onClick={onReconnect}
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7a2f2f] text-white transition-colors hover:bg-[#8f3939] dark:bg-[#6d2929] dark:hover:bg-[#803232]"
              title="Reconnect"
            >
              <Icon name="autorenew" className="text-base" />
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                disabled={showSend ? disabled || !text.trim() : disabled}
                onClick={() => {
                  if (showSend) {
                    onSend(text.trim());
                    setText("");
                  } else {
                    startOrStopRecording();
                  }
                }}
                className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-[0_4px_12px_rgba(15,82,88,0.18)] transition-colors hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 dark:bg-[var(--brand-primary)] dark:text-white dark:shadow-[0_6px_16px_rgba(0,0,0,0.3)] dark:hover:bg-[var(--brand-primary-hover)]"
              >
                <Icon name={showSend ? "arrow_upward" : recording ? "stop" : "mic"} className="text-lg" />
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );

  async function startOrStopRecording() {
    if (recording) {
      stopAndCommitRecording();
      return;
    }
    setVoiceError(null);
    setTranscript("");
    cancelRecording.current = false;
    let stream: MediaStream | null = null;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
        throw new Error("Voice input is not supported in this browser.");
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      const socket = new WebSocket(liveTranscriptionUrl());
      socketRef.current = socket;
      finalReceivedRef.current = false;
      awaitingFinalRef.current = false;
      partialTranscriptRef.current = "";
      setRecording(true);
      socket.onopen = () => {
        socket.send(JSON.stringify({ type: "auth", token: accessToken }));
      };
      socket.onmessage = (event) => {
        try {
          handleTranscriptEvent(JSON.parse(String(event.data)) as LiveTranscriptEvent);
        } catch {
          setVoiceError("Live transcription returned an invalid response.");
          teardownVoice();
        }
      };
      socket.onerror = () => {
        setVoiceError("Live transcription connection failed.");
        teardownVoice();
      };
      socket.onclose = () => {
        stopAudioCapture();
        if (!cancelRecording.current && !finalReceivedRef.current) {
          setVoiceError(
            awaitingFinalRef.current
              ? "Live transcription ended before a final transcript was received."
              : "Live transcription connection was interrupted.",
          );
        }
        setRecording(false);
        setTranscribing(false);
      };
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      setVoiceError(error instanceof Error ? error.message : "Microphone permission was not granted.");
      setRecording(false);
    }
  }

  function handleTranscriptEvent(event: LiveTranscriptEvent) {
    if (event.type === "transcript.ready") {
      startAudioStreaming();
      setRecording(true);
      return;
    }
    if (event.type === "transcript.partial") {
      partialTranscriptRef.current += event.delta;
      setTranscript(partialTranscriptRef.current);
      return;
    }
    if (event.type === "transcript.final") {
      finalReceivedRef.current = true;
      awaitingFinalRef.current = false;
      const finalText = event.transcript.trim();
      setTranscript(finalText);
      setVoiceError(finalText ? null : "No speech was detected.");
      setTranscribing(false);
      teardownVoice();
      return;
    }
    if (event.type === "transcript.error") {
      setVoiceError(event.message || "Could not transcribe audio.");
      awaitingFinalRef.current = false;
      setTranscribing(false);
      teardownVoice();
    }
  }

  function startAudioStreaming() {
    const stream = streamRef.current;
    const socket = socketRef.current;
    if (!stream || !socket || socket.readyState !== WebSocket.OPEN) return;
    const context = new AudioContext({ latencyHint: "interactive", sampleRate: 24000 });
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);
    const monitorGain = context.createGain();
    monitorGain.gain.value = 0;
    processor.onaudioprocess = (event) => {
      if (socket.readyState !== WebSocket.OPEN || !recordingRef.current) return;
      const pcm = resamplePcm16(event.inputBuffer.getChannelData(0), context.sampleRate, 24000);
      socket.send(JSON.stringify({ type: "audio.append", audio: bytesToBase64(new Uint8Array(pcm.buffer)) }));
    };
    source.connect(processor);
    processor.connect(monitorGain);
    monitorGain.connect(context.destination);
    audioContextRef.current = context;
    sourceRef.current = source;
    processorRef.current = processor;
    monitorGainRef.current = monitorGain;
    recordingRef.current = true;
  }

  function stopAndCommitRecording() {
    recordingRef.current = false;
    stopAudioCapture();
    setRecording(false);
    setTranscribing(true);
    awaitingFinalRef.current = true;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "audio.commit" }));
      transcriptionTimerRef.current = window.setTimeout(() => {
        setVoiceError("Live transcription timed out.");
        setTranscribing(false);
        teardownVoice();
      }, 20000);
    } else {
      setVoiceError("Live transcription connection was interrupted.");
      awaitingFinalRef.current = false;
      setTranscribing(false);
      teardownVoice();
    }
  }

  function stopAudioCapture() {
    processorRef.current?.disconnect();
    monitorGainRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    monitorGainRef.current = null;
    sourceRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
  }

  function teardownVoice(clearTranscriptTimer = true) {
    recordingRef.current = false;
    awaitingFinalRef.current = false;
    stopAudioCapture();
    if (clearTranscriptTimer && transcriptionTimerRef.current !== null) {
      window.clearTimeout(transcriptionTimerRef.current);
      transcriptionTimerRef.current = null;
    }
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
    setRecording(false);
  }
}

function resamplePcm16(input: Float32Array, inputRate: number, outputRate: number): Int16Array {
  const ratio = inputRate / outputRate;
  const output = new Int16Array(Math.max(1, Math.floor(input.length / ratio)));
  for (let index = 0; index < output.length; index += 1) {
    const sample = input[Math.min(input.length - 1, Math.floor(index * ratio))] || 0;
    const clamped = Math.max(-1, Math.min(1, sample));
    output[index] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  return output;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}
