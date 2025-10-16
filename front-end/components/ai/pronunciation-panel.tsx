'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { pronunciationService, type PronunciationResponse } from '@/services/pronunciation.service';
import { toast } from 'sonner';
import { Mic, Square, Upload, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PronunciationPanel() {
  const [targetText, setTargetText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [result, setResult] = useState<PronunciationResponse | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) {
      toast.error('Please record audio first');
      return;
    }

    if (!targetText.trim()) {
      toast.error('Please enter the target text');
      return;
    }

    setIsAnalyzing(true);
    try {
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const response = await pronunciationService.uploadAndAnalyze(audioFile, targetText);
      setResult(response);
      toast.success('Pronunciation analysis completed!');
    } catch (error) {
      console.error('Pronunciation analysis failed:', error);
      toast.error('Failed to analyze pronunciation. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Pronunciation Assessment
        </CardTitle>
        <CardDescription>
          Record your pronunciation and get detailed feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-text">Target Text</Label>
          <Textarea
            id="target-text"
            placeholder="Enter the text you want to practice pronouncing..."
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-3">
          <Label>Audio Recording</Label>
          <div className="flex gap-2">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                variant="outline"
                className="flex-1"
              >
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex-1"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </div>

          {audioBlob && (
            <div className="space-y-2">
              <audio controls className="w-full" src={URL.createObjectURL(audioBlob)}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !audioBlob || !targetText.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Pronunciation
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Overall Score</Label>
                <span className={cn('text-2xl font-bold', getScoreColor(result.overallScore))}>
                  {result.overallScore.toFixed(1)}/100
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recognized Text:</span>
                  <span className="font-medium">{result.recognizedText}</span>
                </div>
                {result.wordErrorRate !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Word Error Rate:</span>
                    <span className="font-medium">{(result.wordErrorRate * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>

            {result.wordScores && result.wordScores.length > 0 && (
              <div className="space-y-2">
                <Label>Word-level Scores</Label>
                <div className="flex flex-wrap gap-2">
                  {result.wordScores.map((wordScore, index) => (
                    <Badge
                      key={index}
                      variant={getScoreBadgeVariant(wordScore.score)}
                      className="flex items-center gap-1"
                    >
                      {wordScore.word}: {wordScore.score.toFixed(0)}
                      {wordScore.score >= 80 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.feedback && result.feedback.length > 0 && (
              <div className="space-y-2">
                <Label>Feedback</Label>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.feedback.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
