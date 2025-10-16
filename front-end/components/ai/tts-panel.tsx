'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ttsService, type VoiceInfo, type TTSResponse } from '@/services/tts.service';
import { toast } from 'sonner';
import { Volume2, Download, Trash2, Loader2 } from 'lucide-react';

export function TTSPanel() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioResponse, setAudioResponse] = useState<TTSResponse | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Fetch available voices on mount
  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await ttsService.getVoices();
      setVoices(response.voices);
      if (response.voices.length > 0) {
        setSelectedVoice(response.voices[0].voiceId);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
      toast.error('Failed to load available voices');
    }
  };

  const handleSynthesize = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to synthesize');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ttsService.synthesizeSpeech({
        text,
        voiceId: selectedVoice,
        stability: 0.5,
        similarityBoost: 0.75,
      });

      setAudioResponse(response);

      // Extract filename from path
      const filename = response.audioFilePath.split('/').pop() || '';
      const url = ttsService.getAudioUrl(filename);
      setAudioUrl(url);

      toast.success('Speech synthesized successfully!');
    } catch (error) {
      console.error('TTS synthesis failed:', error);
      toast.error('Failed to synthesize speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!audioResponse) return;

    try {
      const filename = audioResponse.audioFilePath.split('/').pop() || 'speech.mp3';
      const blob = await ttsService.downloadAudio(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Audio file downloaded');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download audio file');
    }
  };

  const handleDelete = async () => {
    if (!audioResponse) return;

    try {
      const filename = audioResponse.audioFilePath.split('/').pop() || '';
      await ttsService.deleteAudio(filename);
      setAudioResponse(null);
      setAudioUrl('');
      toast.success('Audio file deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete audio file');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Text-to-Speech
        </CardTitle>
        <CardDescription>
          Convert your text into natural-sounding speech
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tts-text">Text to synthesize</Label>
          <Textarea
            id="tts-text"
            placeholder="Enter text to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice-select">Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger id="voice-select">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.voiceId} value={voice.voiceId}>
                  {voice.name}
                  {voice.labels?.accent && ` (${voice.labels.accent})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSynthesize}
          disabled={isLoading || !text.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Synthesizing...
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              Synthesize Speech
            </>
          )}
        </Button>

        {audioUrl && audioResponse && (
          <div className="space-y-3 pt-4 border-t">
            <Label>Generated Audio</Label>
            <audio controls className="w-full" src={audioUrl}>
              Your browser does not support the audio element.
            </audio>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>

            {audioResponse.durationMs && (
              <p className="text-sm text-muted-foreground">
                Duration: {(audioResponse.durationMs / 1000).toFixed(2)}s
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
