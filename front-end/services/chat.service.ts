import { getAccessToken } from '@/lib/auth';

// Chat message interface
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Chat request interface
export interface ChatRequest {
  messages: ChatMessage[];
}

// Chat service class
class ChatService {
    private readonly baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    /**
     * Stream chat response using SSE (Server-Sent Events)
     * @param request Chat request with message history
     * @param onChunk Callback for each chunk received
     * @param onError Callback for errors
     * @param onComplete Callback when stream completes
     */
    async chatStream(
        request: ChatRequest,
        onChunk: (chunk: string) => void,
        onError?: (error: Error) => void,
        onComplete?: () => void
    ): Promise<void> {
        const token = getAccessToken();

        try {
            const response = await fetch(`${this.baseUrl}/learning/chat-stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error("Response body is null");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onComplete?.();
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                onChunk(chunk);
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error occurred');
            console.error('Chat stream error:', err);
            onError?.(err);
        }
    }
}

export const chatService = new ChatService();