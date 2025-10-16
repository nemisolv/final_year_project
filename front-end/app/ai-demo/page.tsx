'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TTSPanel } from '@/components/ai/tts-panel';
import { PronunciationPanel } from '@/components/ai/pronunciation-panel';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle } from 'lucide-react';

export default function AIDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">AI Features Demo</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Comprehensive demonstration of all AI-powered learning features
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Text-to-Speech (ElevenLabs)
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Pronunciation Assessment (Azure)
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Grammar Checking (LanguageTool + Claude)
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Chat Assistant (Claude)
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="tts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tts">Text-to-Speech</TabsTrigger>
          <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
          <TabsTrigger value="grammar">Grammar Check</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="tts" className="space-y-4">
          <TTSPanel />
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">About Text-to-Speech</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                Our TTS system uses <strong>ElevenLabs</strong> for high-quality, natural-sounding speech synthesis.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Multiple voice options with different accents</li>
                <li>Adjustable stability and similarity boost parameters</li>
                <li>Download generated audio files</li>
                <li>Real-time speech generation</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pronunciation" className="space-y-4">
          <PronunciationPanel />
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">About Pronunciation Assessment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                Our pronunciation system uses <strong>Azure Pronunciation Assessment</strong> with fallbacks:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Priority #1:</strong> Azure Pronunciation Assessment (highest accuracy)</li>
                <li><strong>Fallback #1:</strong> Faster-Whisper for transcription</li>
                <li><strong>Fallback #2:</strong> Vosk offline recognition</li>
                <li>Word-level accuracy scores (0-100)</li>
                <li>Detailed feedback for each word</li>
                <li>Overall pronunciation score</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grammar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grammar Checking</CardTitle>
              <CardDescription>
                Visit the <a href="/learning/grammar" className="text-primary hover:underline">Grammar Learning Page</a> for the full grammar checker
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">About Grammar Checking</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>
                    Our hybrid grammar system combines <strong>LanguageTool</strong> and <strong>Claude AI</strong>:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>LanguageTool (baseline):</strong> Fast rule-based checking</li>
                    <li><strong>Claude AI (advanced):</strong> Context-aware corrections with explanations</li>
                    <li><strong>Confidence-based routing:</strong> Uses LanguageTool for high-confidence errors (&gt;70%)</li>
                    <li><strong>LLM escalation:</strong> Sends complex cases to Claude for better analysis</li>
                    <li>Scientific threshold (70%) based on ML research</li>
                    <li>4-component confidence scoring system</li>
                  </ul>
                  <div className="mt-3 p-3 bg-background rounded border">
                    <p className="font-semibold mb-1">Confidence Score Calculation:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Category confidence: 40 points (TYPOS, GRAMMAR = high)</li>
                      <li>• Suggestion quality: 30 points (1 suggestion = best)</li>
                      <li>• Text similarity: 20 points (more similar = higher)</li>
                      <li>• Issue type priority: 10 points (grammar &gt; style)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Chat Assistant</CardTitle>
              <CardDescription>
                Visit the <a href="/learning/chat" className="text-primary hover:underline">Chat Page</a> for the full AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">About Chat Assistant</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>
                    Our chat system uses <strong>Claude AI</strong> for natural conversation:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Real-time streaming responses (Server-Sent Events)</li>
                    <li>Context-aware conversation scenarios</li>
                    <li>Language learning support</li>
                    <li>Grammar and vocabulary help</li>
                    <li>Conversation practice with feedback</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Backend Integration ✅</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ Spring Boot controllers</li>
                <li>✅ WebClient service layer</li>
                <li>✅ JWT authentication</li>
                <li>✅ Error handling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">AI Service Integration ✅</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ FastAPI endpoints</li>
                <li>✅ Azure Speech SDK</li>
                <li>✅ ElevenLabs TTS</li>
                <li>✅ LanguageTool + Claude</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            All AI features are fully integrated and ready for testing. Use the Postman collection for API testing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
