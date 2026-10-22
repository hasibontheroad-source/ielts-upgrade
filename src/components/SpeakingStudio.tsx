import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Square,
  Sparkles,
  Award,
  Clock,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Radio,
  FileText,
  UserCheck
} from 'lucide-react';

interface SpeakingStudioProps {
  initialParts?: any[];
  onSaveSession: (session: any) => void;
}

export default function SpeakingStudio({
  initialParts,
  onSaveSession,
}: SpeakingStudioProps) {
  const [activePart, setActivePart] = useState<1 | 2 | 3>(2);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLiveWsActive, setIsLiveWsActive] = useState<boolean>(false);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number>(60);
  const [isPrepTimerRunning, setIsPrepTimerRunning] = useState<boolean>(false);
  const [speakingSeconds, setSpeakingSeconds] = useState<number>(0);

  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [speakingResult, setSpeakingResult] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const prepTimerRef = useRef<any>(null);
  const speakTimerRef = useRef<any>(null);
  const liveWsRef = useRef<WebSocket | null>(null);

  // Cue card content
  const cueCardTopic =
    'Describe an environmental project or initiative that you learned about or participated in.';
  const cueCardPoints = [
    'What the project was and where it took place',
    'How you first heard about or got involved with it',
    'What specific activities were carried out by the team',
    'And explain why you think this initiative was successful or important for the community',
  ];

  // 1-Minute Prep Countdown Timer
  useEffect(() => {
    if (isPrepTimerRunning && prepSecondsLeft > 0) {
      prepTimerRef.current = setTimeout(() => {
        setPrepSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (prepSecondsLeft === 0 && isPrepTimerRunning) {
      setIsPrepTimerRunning(false);
      // Auto-prompt user to start speaking
    }
    return () => clearTimeout(prepTimerRef.current);
  }, [isPrepTimerRunning, prepSecondsLeft]);

  // Speaking duration timer
  useEffect(() => {
    if (isRecording) {
      speakTimerRef.current = setInterval(() => {
        setSpeakingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(speakTimerRef.current);
    }
    return () => clearInterval(speakTimerRef.current);
  }, [isRecording]);

  const startPrepTimer = () => {
    setPrepSecondsLeft(60);
    setIsPrepTimerRunning(true);
  };

  const resetPrepTimer = () => {
    setIsPrepTimerRunning(false);
    setPrepSecondsLeft(60);
  };

  // Start Standard Microphone Recording for Transcription (gemini-3.5-transcribe)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Convert to base64 and transcribe
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await transcribeAudio(base64Audio);
        };
      };

      setSpeakingSeconds(0);
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Please allow microphone permissions to record your speaking practice.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  // Transcribe Recorded Audio with gemini-3.5-transcribe
  const transcribeAudio = async (base64Audio: string) => {
    setIsTranscribing(true);
    try {
      const res = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Audio, mimeType: 'audio/webm' }),
      });
      const data = await res.json();
      if (data.transcript) {
        setTranscript(data.transcript);
      }
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Examiner Text-to-Speech (gemini-3.8-flash-tts)
  const handlePlayExaminerQuestion = async (text: string) => {
    setIsGeneratingTts(true);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: 'Puck',
          style: 'British Council IELTS Speaking Examiner, formal, encouraging, professional',
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        setTtsAudioUrl(`data:audio/wav;base64,${data.audioBase64}`);
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Evaluate Spoken Response
  const handleEvaluateSpeaking = async () => {
    if (!transcript || transcript.trim().length < 10) {
      alert('Please provide a speech transcript or record your response first.');
      return;
    }

    setIsEvaluating(true);
    setSpeakingResult(null);

    try {
      const res = await fetch('/api/gemini/score-speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cueCardTopic,
          partNumber: activePart,
          transcript,
        }),
      });

      const data = await res.json();
      if (res.ok && data.overallBand !== undefined) {
        setSpeakingResult(data);
        onSaveSession({
          partNumber: activePart,
          topic: cueCardTopic,
          transcript,
          overallBand: data.overallBand,
          feedback: data.feedback || '',
          durationSeconds: speakingSeconds,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Speaking scoring error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Toggle Live API Voice Conversation (gemini-3.8-live)
  const toggleLiveExaminer = () => {
    if (isLiveWsActive) {
      if (liveWsRef.current) {
        liveWsRef.current.close();
      }
      setIsLiveWsActive(false);
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      ws.onopen = () => {
        setIsLiveWsActive(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            // Live audio output received from model
            const audioCtx = new AudioContext({ sampleRate: 24000 });
            const binary = atob(msg.audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const int16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
            const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
            audioBuffer.getChannelData(0).set(float32);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start();
          }
        } catch (_) {}
      };

      ws.onclose = () => {
        setIsLiveWsActive(false);
      };

      ws.onerror = () => {
        setIsLiveWsActive(false);
      };
    }
  };

  const loadSampleTranscript = () => {
    setTranscript(
      `I would like to talk about an inspiring community wetlands restoration project called the Greenfield Eco-Park initiative, situated on the outskirts of our metropolitan region. I initially stumbled across this project around eight months ago through a university environmental society newsletter.\n\nHistorically, the location had functioned as an active limestone quarry which left the soil degraded and vulnerable to seasonal erosion. The municipal council partnered with local ecologists and community volunteers to remediate the area. Our team participated in planting over two thousand native willow saplings and reedbeds, which act as natural bio-filtration systems for urban stormwater runoff. In addition, we constructed modular nesting boxes to encourage the return of indigenous waterfowl.\n\nI firmly consider this initiative an undeniable success because within merely six months, biodiversity surveys recorded fourteen species of migratory birds nesting in the marshlands, alongside providing local residents with an educational open-air corridor that fosters environmental stewardship.`
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/60 to-slate-900 border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold mb-3">
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>Voice Conversations & Transcription (gemini-3.8-live & gemini-3.5-transcribe)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cambridge IELTS Speaking Studio
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Practice real-time spoken exam conditions with simulated British Council examiner questions,
              1-minute cue card prep timer, live voice conversations, and instant band scoring across FC, LR, GRA, and PR.
            </p>
          </div>

          {/* Part 1, 2, 3 Selector */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setActivePart(p as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePart === p
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Part {p} {p === 1 ? 'Intro' : p === 2 ? 'Cue Card' : 'Discussion'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Part 2: Cue Card & Prep Timer (The Core of IELTS Speaking) */}
      {activePart === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Part 2: Individual Long Turn (2 Minutes)
              </span>
              <h3 className="text-lg font-black text-white mt-1">Official Candidate Cue Card</h3>
            </div>

            {/* 1-Minute Preparation Countdown Bar */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold ${
                  prepSecondsLeft <= 10 && isPrepTimerRunning
                    ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                    : 'bg-slate-950 border-slate-700 text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Prep Time: 00:{prepSecondsLeft < 10 ? `0${prepSecondsLeft}` : prepSecondsLeft}</span>
              </div>

              {!isPrepTimerRunning ? (
                <button
                  onClick={startPrepTimer}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Start 1-Min Prep
                </button>
              ) : (
                <button
                  onClick={resetPrepTimer}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title="Reset Prep Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cue Card Frame */}
          <div className="p-6 rounded-2xl bg-slate-950 border-2 border-amber-500/40 shadow-inner space-y-4">
            <h4 className="text-base font-extrabold text-white">{cueCardTopic}</h4>
            <p className="text-xs text-slate-400 font-medium">You should say:</p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {cueCardPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Part 1 & 3: Examiner Questions with TTS */}
      {(activePart === 1 || activePart === 3) && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm text-white">
              {activePart === 1 ? 'Part 1: Everyday Questions' : 'Part 3: Abstract Discussion Questions'}
            </h3>
            <button
              onClick={() =>
                handlePlayExaminerQuestion(
                  activePart === 1
                    ? 'Good morning. Could you tell me a little bit about your hometown, and what you enjoy most about living there?'
                    : 'To what extent do you believe individual consumer actions can solve global climate change compared to international regulations?'
                )
              }
              disabled={isGeneratingTts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{isGeneratingTts ? 'Speaking...' : 'Listen to Examiner Question'}</span>
            </button>
          </div>

          {ttsAudioUrl && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <audio controls autoPlay src={ttsAudioUrl} className="w-full h-8" />
            </div>
          )}

          <div className="space-y-3">
            {[
              activePart === 1
                ? 'Do you prefer spending your leisure time indoors or outdoors?'
                : 'How should educational institutions motivate students towards sustainable habits?',
              activePart === 1
                ? 'How has your neighborhood changed over the past five years?'
                : 'Should multinational corporations bear full liability for ecological reclamation?',
            ].map((q, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 flex items-center justify-between">
                <span>{q}</span>
                <button
                  onClick={() => handlePlayExaminerQuestion(q)}
                  className="text-rose-400 hover:text-rose-300 p-1"
                  title="Play"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Microphone & Voice Interaction Control Console */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white">Candidate Spoken Response Console</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Record via your microphone for AI transcription or launch the Live Examiner interview.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live API WebSocket Toggle (gemini-3.8-live) */}
            <button
              onClick={toggleLiveExaminer}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                isLiveWsActive
                  ? 'bg-rose-600 text-white shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{isLiveWsActive ? 'Live Examiner Connected' : 'Connect Live Voice (gemini-3.8-live)'}</span>
            </button>

            {/* Microphone Recording Button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Start Microphone Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-black animate-pulse cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Recording ({speakingSeconds}s)</span>
              </button>
            )}
          </div>
        </div>

        {/* Audio Playback of Recorded Response */}
        {audioUrl && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
            <span className="text-xs font-bold text-slate-300">Your Recorded Audio:</span>
            <audio controls src={audioUrl} className="w-full h-8" />
          </div>
        )}

        {/* Speech Transcript Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>Spoken Transcript (Auto-transcribed with gemini-3.5-transcribe):</span>
            </label>
            <button
              onClick={loadSampleTranscript}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Insert Band 9 Sample Speech
            </button>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken words will be transcribed here automatically after recording, or you can paste a spoken transcript to evaluate..."
            rows={6}
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 font-serif leading-relaxed focus:outline-none focus:border-rose-500"
          />

          {isTranscribing && (
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Transcribing audio with gemini-3.5-transcribe...</span>
            </div>
          )}
        </div>

        {/* Evaluate Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={handleEvaluateSpeaking}
            disabled={isEvaluating || !transcript}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Speaking Performance...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Score Spoken Response & Calculate Band</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Speaking Evaluation Results */}
      {speakingResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 border border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-rose-400" />
                <h3 className="text-lg font-black text-white">Examiner Speaking Assessment</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {speakingResult.feedback}
              </p>
            </div>

            <div className="text-center px-6 py-3 rounded-2xl bg-rose-600/20 border border-rose-500/40">
              <span className="block text-3xl font-black text-rose-400">
                Band {Number(speakingResult.overallBand).toFixed(1)}
              </span>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Overall Speaking
              </span>
            </div>
          </div>

          {/* 4 Speaking Descriptors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs font-bold text-slate-400">Fluency & Coherence</span>
              <span className="block text-xl font-black text-sky-400 mt-1">
                Band {Number(speakingResult.fluencyCoherence || speakingResult.overallBand).toFixed(1)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs font-bold text-slate-400">Lexical Resource</span>
              <span className="block text-xl font-black text-emerald-400 mt-1">
                Band {Number(speakingResult.lexicalResource || speakingResult.overallBand).toFixed(1)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs font-bold text-slate-400">Grammar & Accuracy</span>
              <span className="block text-xl font-black text-amber-400 mt-1">
                Band {Number(speakingResult.grammaticalRangeAccuracy || speakingResult.overallBand).toFixed(1)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs font-bold text-slate-400">Pronunciation & Delivery</span>
              <span className="block text-xl font-black text-rose-400 mt-1">
                Band {Number(speakingResult.pronunciation || speakingResult.overallBand).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Strengths & Corrections */}
          {speakingResult.corrections && speakingResult.corrections.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Targeted Speech Adjustments:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {speakingResult.corrections.map((cor: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400">"{cor.said}"</span>
                      <span className="text-emerald-400 font-bold">"{cor.suggested}"</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{cor.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
