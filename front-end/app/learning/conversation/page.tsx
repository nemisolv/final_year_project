"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Play,
  RotateCcw,
  CheckCircle,
  User,
  Bot,
  Volume2,
  Mic,
  MicOff,
} from "lucide-react";
import { toast } from "sonner";

interface Scenario {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  description: string;
  situation: string;
  userRole: string;
  aiRole: string;
  objectives: string[];
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const SCENARIOS: Scenario[] = [
  {
    id: "1",
    title: "At the Restaurant",
    level: "Beginner",
    category: "Daily Life",
    description: "Practice ordering food and making requests at a restaurant",
    situation: "You are at a restaurant and want to order dinner. The waiter will help you.",
    userRole: "Customer",
    aiRole: "Waiter",
    objectives: [
      "Order a meal",
      "Ask about menu items",
      "Make special requests",
      "Ask for the bill",
    ],
  },
  {
    id: "2",
    title: "Job Interview",
    level: "Intermediate",
    category: "Professional",
    description: "Practice answering common job interview questions",
    situation: "You are being interviewed for a software engineer position.",
    userRole: "Candidate",
    aiRole: "Interviewer",
    objectives: [
      "Introduce yourself",
      "Talk about your experience",
      "Answer behavioral questions",
      "Ask questions about the company",
    ],
  },
  {
    id: "3",
    title: "Hotel Check-in",
    level: "Beginner",
    category: "Travel",
    description: "Learn how to check in at a hotel and ask for services",
    situation: "You have just arrived at the hotel and need to check in.",
    userRole: "Guest",
    aiRole: "Receptionist",
    objectives: [
      "Confirm your reservation",
      "Ask about room amenities",
      "Request wake-up call",
      "Ask about breakfast",
    ],
  },
  {
    id: "4",
    title: "Doctor's Appointment",
    level: "Intermediate",
    category: "Healthcare",
    description: "Practice describing symptoms and understanding medical advice",
    situation: "You are visiting a doctor because you are not feeling well.",
    userRole: "Patient",
    aiRole: "Doctor",
    objectives: [
      "Describe your symptoms",
      "Answer health questions",
      "Understand prescriptions",
      "Ask about treatment",
    ],
  },
  {
    id: "5",
    title: "Business Negotiation",
    level: "Advanced",
    category: "Professional",
    description: "Practice negotiating terms and reaching agreements",
    situation: "You are negotiating a contract with a potential client.",
    userRole: "Sales Representative",
    aiRole: "Client",
    objectives: [
      "Present your proposal",
      "Handle objections",
      "Negotiate terms",
      "Close the deal",
    ],
  },
  {
    id: "6",
    title: "Shopping for Clothes",
    level: "Beginner",
    category: "Daily Life",
    description: "Learn vocabulary for shopping and trying on clothes",
    situation: "You are shopping for new clothes at a clothing store.",
    userRole: "Shopper",
    aiRole: "Sales Assistant",
    objectives: [
      "Ask about sizes",
      "Request to try items",
      "Ask about prices",
      "Make a purchase",
    ],
  },
];

export default function ConversationPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setConversationStarted(false);
  };

  const handleStartConversation = () => {
    if (!selectedScenario) return;

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "ai",
      content: getWelcomeMessage(selectedScenario),
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
    setConversationStarted(true);
    toast.success("Conversation started!");
  };

  const getWelcomeMessage = (scenario: Scenario): string => {
    const greetings: Record<string, string> = {
      "1": "Good evening! Welcome to our restaurant. I'm your waiter today. How can I help you?",
      "2": "Hello! Thank you for coming in today. Please have a seat. Let's start with you telling me a bit about yourself.",
      "3": "Good day! Welcome to Grand Hotel. Do you have a reservation with us?",
      "4": "Hello, please come in and have a seat. What brings you in today?",
      "5": "Good morning! Thank you for meeting with me. I've reviewed your proposal. Shall we discuss the details?",
      "6": "Hi there! Welcome to our store. Are you looking for anything specific today?",
    };
    return greetings[scenario.id] || "Hello! How can I help you today?";
  };

  const handleRecord = () => {
    if (!conversationStarted) {
      toast.error("Please start the conversation first");
      return;
    }

    if (!isRecording) {
      setIsRecording(true);
      toast.info("Recording... Speak now");

      // TODO: Implement actual audio recording
      // Mock response after 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        handleMockResponse();
      }, 3000);
    }
  };

  const handleMockResponse = () => {
    // Add user message (transcribed from audio)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: "I would like to order a steak, please. Medium rare.",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // AI response after 1 second
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Excellent choice! Our steak is very popular. Would you like any sides with that?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handlePlayAudio = (message: Message) => {
    // TODO: Implement text-to-speech
    toast.info("Text-to-speech will be implemented");
  };

  const handleReset = () => {
    setMessages([]);
    setConversationStarted(false);
    setIsRecording(false);
    toast.success("Conversation reset");
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (selectedScenario && conversationStarted) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedScenario.title}</h2>
            <p className="text-muted-foreground">
              You are: {selectedScenario.userRole} | AI is: {selectedScenario.aiRole}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedScenario(null)}>
            ← Back to scenarios
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Objectives Sidebar */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedScenario.objectives.map((obj, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Conversation */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conversation</CardTitle>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="h-[400px] overflow-y-auto space-y-3 p-4 bg-secondary rounded-lg">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-[80%] ${
                        message.role === "user" ? "text-right" : ""
                      }`}
                    >
                      <div
                        className={`inline-block rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {message.role === "ai" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handlePlayAudio(message)}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recording Button */}
              <div className="flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={handleRecord}
                  disabled={isRecording}
                  className={`rounded-full w-16 h-16 ${
                    isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {isRecording ? "Recording... Speak now" : "Click to record your response"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedScenario) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Button variant="outline" onClick={() => setSelectedScenario(null)} className="mb-6">
          ← Back to scenarios
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <Badge className={getLevelColor(selectedScenario.level)}>
                {selectedScenario.level}
              </Badge>
              <Badge variant="outline">{selectedScenario.category}</Badge>
            </div>
            <CardTitle className="text-2xl">{selectedScenario.title}</CardTitle>
            <CardDescription>{selectedScenario.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Situation:</h3>
              <p className="text-sm">{selectedScenario.situation}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Your Role:
                </h3>
                <p className="text-sm">{selectedScenario.userRole}</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Role:
                </h3>
                <p className="text-sm">{selectedScenario.aiRole}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Conversation Objectives:</h3>
              <ul className="space-y-2">
                {selectedScenario.objectives.map((obj, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={handleStartConversation} className="w-full" size="lg">
              <Play className="h-5 w-5 mr-2" />
              Start Conversation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Situational Conversations</h1>
        <p className="text-muted-foreground">
          Practice real-life conversations with AI in various scenarios
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCENARIOS.map((scenario) => (
          <Card
            key={scenario.id}
            className="hover:shadow-lg transition-all cursor-pointer"
            onClick={() => handleSelectScenario(scenario)}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className={getLevelColor(scenario.level)}>{scenario.level}</Badge>
                <Badge variant="outline">{scenario.category}</Badge>
              </div>
              <CardTitle className="text-xl">{scenario.title}</CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span>{scenario.objectives.length} objectives</span>
                </div>
                <Button size="sm" variant="ghost">
                  Start
                  <Play className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
