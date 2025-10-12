// front-end/services/grammarService.ts
import { apiClient } from '@/lib/api/client';

export interface GrammarError {
  offset: number;
  errorLength: number;
  message: string;
  suggestions: string[];
}

export interface GrammarCheckResponse {
  originalText: string;
  correctedText: string;
  errors: GrammarError[];
}

class GrammarService {
  async check(text: string): Promise<GrammarCheckResponse> {
    const response = await apiClient.post<GrammarCheckResponse>('/learning/grammar/check', { text });
    return response.data;
  }
}

export const grammarService = new GrammarService();