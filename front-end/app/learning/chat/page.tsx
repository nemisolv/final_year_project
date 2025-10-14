'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageCircle, Send, Loader2, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import { chatService, ChatMessage } from '@/services/chat.service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingMessage]);

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    // Add user message to chat
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      // Stream AI response
      await chatService.chatStream(
        { messages: updatedMessages },
        (chunk) => {
          // Append each chunk to the streaming message
          setStreamingMessage((prev) => prev + chunk);
        },
        (error) => {
          console.error('Stream error:', error);
          toast.error('Failed to get response from AI. Please try again.');
          setIsStreaming(false);
        },
        () => {
          // On complete: Add the full AI message to chat history
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: streamingMessage,
            },
          ]);
          setStreamingMessage('');
          setIsStreaming(false);
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('An error occurred. Please try again.');
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';

    return (
      <div
        key={index}
        className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <Avatar className={isUser ? 'bg-primary' : 'bg-secondary'}>
          <AvatarFallback>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        <div
          className={`flex-1 rounded-lg p-3 ${
            isUser
              ? 'bg-primary text-primary-foreground ml-12'
              : 'bg-muted mr-12'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  };

  const renderStreamingMessage = () => {
    if (!streamingMessage) return null;

    return (
      <div className="flex gap-3 mb-4">
        <Avatar className="bg-secondary">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 rounded-lg p-3 bg-muted mr-12">
          <p className="text-sm whitespace-pre-wrap break-words">{streamingMessage}</p>
          <span className="inline-block w-2 h-4 bg-foreground animate-pulse ml-1"></span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl h-[calc(100vh-8rem)]">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            AI English Chat
          </CardTitle>
          <CardDescription>
            Practice your English by chatting with our AI tutor. Ask questions, practice conversations, or get help with your English learning.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Messages area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 mb-4">
            {messages.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bot className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm mt-2">
                  Ask me anything about English grammar, vocabulary, pronunciation, or practice conversation!
                </p>
              </div>
            )}

            {messages.map((message, index) => renderMessage(message, index))}
            {renderStreamingMessage()}
          </ScrollArea>

          {/* Input area */}
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              rows={3}
              className="resize-none"
              disabled={isStreaming}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isStreaming}
              size="icon"
              className="h-auto"
            >
              {isStreaming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Tips */}
          <p className="text-xs text-muted-foreground mt-2">
            💡 Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-muted rounded">Shift+Enter</kbd> for a new line
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
