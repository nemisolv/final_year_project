import { getAccessToken } from '@/lib/auth';


// Định nghĩa kiểu dữ liệu cho tin nhắn
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Định nghĩa kiểu dữ liệu cho request
interface ChatRequest {
  messages: ChatMessage[];
}

// Định nghĩa kiểu dữ liệu cho response
interface ChatResponse {
  message: ChatMessage;
}


// ... (các interface ChatMessage, ChatRequest, ChatResponse không đổi)

class AIService {
    // ... (hàm chat cũ không đổi)

    // Hàm mới để xử lý stream
    async chatStream(request: ChatRequest, onChunk: (chunk: string) => void) {
        const token = getAccessToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/learning/chat-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        });

        if (!response.body) {
            throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value);
            onChunk(chunk);
        }
    }
}

export const aiService = new AIService();