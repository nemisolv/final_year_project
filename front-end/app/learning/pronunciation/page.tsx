"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PlayCircle,
  StopCircle,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { pronunciationService } from "@/services/pronunciation.service";

interface PronunciationResult {
  word: string;
  accuracy: number;
  feedback: string;
  status: "correct" | "incorrect" | "warning";
}

const SAMPLE_SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "I would like to practice my English pronunciation.",
  "How are you doing today?",
  "This is a beautiful day to learn something new.",
  "Practice makes perfect in language learning.",
];

export default function PronunciationPage() {
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(SAMPLE_SENTENCES[0]);
  const [results, setResults] = useState<PronunciationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup media stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      streamRef.current = stream;
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      toast.success("Camera and microphone enabled");
    } catch (error) {
      console.error("Failed to access camera/microphone:", error);
      toast.error("Failed to access camera or microphone. Please check permissions.");
    }
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    toast.info("Camera and microphone disabled");
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const startRecording = async () => {
    if (!isVideoEnabled || !isAudioEnabled) {
      toast.error("Please enable camera and microphone first");
      return;
    }

    setIsRecording(true);
    toast.info("Recording started. Read the sentence aloud.");

    // TODO: Implement actual recording and Azure Pronunciation Assessment
    // This is a placeholder
    setTimeout(() => {
      stopRecording();
    }, 5000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsAnalyzing(true);

    try {
      // TODO: Implement audio recording capture
      // For now, this is a placeholder - you'll need to capture the actual audio
      // from the MediaStream and create a Blob

      // Mock implementation - replace with actual audio capture
      const mockAudioBlob = new Blob([], { type: 'audio/wav' });
      const audioFile = new File([mockAudioBlob], 'recording.wav', { type: 'audio/wav' });

      // Call the actual pronunciation service
      const response = await pronunciationService.uploadAndAnalyze(audioFile, currentSentence);

      // Transform response to UI format
      const transformedResults: PronunciationResult[] = response.wordScores.map(wordScore => ({
        word: wordScore.word,
        accuracy: wordScore.score,
        feedback: wordScore.feedback ||
          (wordScore.score >= 80 ? "Excellent pronunciation!" :
           wordScore.score >= 60 ? "Good! Keep practicing." :
           "Needs improvement. Try again."),
        status: wordScore.score >= 80 ? "correct" as const :
                wordScore.score >= 60 ? "warning" as const :
                "incorrect" as const
      }));

      setResults(transformedResults);
      toast.success(`Analysis complete! Overall score: ${response.overallScore.toFixed(1)}/100`);
    } catch (error) {
      console.error("Failed to analyze pronunciation:", error);
      toast.error("Failed to analyze pronunciation. Please try again.");

      // Fallback to mock data for demo purposes
      const mockResults: PronunciationResult[] = [
        {
          word: "pronunciation",
          accuracy: 85,
          feedback: "Good! Try to emphasize the 'nun' syllable more.",
          status: "correct",
        },
        {
          word: "practice",
          accuracy: 92,
          feedback: "Excellent pronunciation!",
          status: "correct",
        },
      ];
      setResults(mockResults);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getNewSentence = () => {
    const newSentence = SAMPLE_SENTENCES[Math.floor(Math.random() * SAMPLE_SENTENCES.length)];
    setCurrentSentence(newSentence);
    setResults([]);
    toast.info("New sentence loaded");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "correct":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "incorrect":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600";
    if (accuracy >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pronunciation Practice</h1>
        <p className="text-muted-foreground">
          Practice your pronunciation with AI-powered feedback using Azure Pronunciation Assessment
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Video Section */}
        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
            <CardDescription>Enable your camera to start practicing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
              {isVideoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  Recording...
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isVideoEnabled ? (
                <Button onClick={startVideo} className="flex-1">
                  <Video className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button onClick={stopVideo} variant="destructive" className="flex-1">
                    <VideoOff className="h-4 w-4 mr-2" />
                    Stop Camera
                  </Button>
                  <Button onClick={toggleAudio} variant="outline">
                    {isAudioEnabled ? (
                      <Mic className="h-4 w-4" />
                    ) : (
                      <MicOff className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Practice Section */}
        <Card>
          <CardHeader>
            <CardTitle>Practice Sentence</CardTitle>
            <CardDescription>Read the sentence aloud when you're ready</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary p-6 rounded-lg">
              <p className="text-2xl font-medium text-center">{currentSentence}</p>
            </div>

            <div className="flex gap-2">
              {!isRecording && !isAnalyzing ? (
                <>
                  <Button
                    onClick={startRecording}
                    className="flex-1"
                    disabled={!isVideoEnabled || !isAudioEnabled}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                  <Button onClick={getNewSentence} variant="outline">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              ) : isRecording ? (
                <Button onClick={stopRecording} variant="destructive" className="flex-1">
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              ) : (
                <Button disabled className="flex-1">
                  Analyzing...
                </Button>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Pronunciation Feedback:</h3>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-secondary rounded-lg"
                  >
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.word}</span>
                        <span className={`font-semibold ${getAccuracyColor(result.accuracy)}`}>
                          {result.accuracy}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{result.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Integration Notice */}
      <Card className="mt-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Azure Integration Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            This page is ready for Azure Pronunciation Assessment integration. You'll need to:
          </p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li>Set up Azure Speech Service subscription</li>
            <li>Configure API keys in your backend</li>
            <li>Implement audio recording and streaming to Azure</li>
            <li>Process and display real pronunciation scores</li>
          </ul>
          <p className="text-sm mt-2">
            Currently showing mock data for demonstration purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
