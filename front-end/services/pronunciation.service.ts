// front-end/services/pronunciation.service.ts
import { apiClient } from '@/lib/api/client';

export interface WordScore {
  word: string;
  score: number;
  pronunciationAccuracy?: number;
  fluencyScore?: number;
  feedback?: string;
}

export interface PronunciationRequest {
  targetText: string;
  audioPath: string;
}

export interface PronunciationResponse {
  recognizedText: string;
  overallScore: number;
  wordErrorRate?: number;
  wordScores: WordScore[];
  feedback: string[];
}

export interface HealthResponse {
  available: boolean;
  message: string;
}

class PronunciationService {
  /**
   * Analyze pronunciation from audio file
   */
  async analyzePronunciation(
    request: PronunciationRequest
  ): Promise<PronunciationResponse> {
    const response = await apiClient.instance.post<PronunciationResponse>(
      '/api/v1/ai/pronunciation/analyze',
      request
    );
    return response.data;
  }

  /**
   * Check if pronunciation analysis service is available
   */
  async checkHealth(): Promise<HealthResponse> {
    const response = await apiClient.instance.get<HealthResponse>(
      '/api/v1/ai/pronunciation/health'
    );
    return response.data;
  }

  /**
   * Upload audio file for pronunciation analysis
   * Note: This requires multipart/form-data support
   */
  async uploadAndAnalyze(
    audioFile: File,
    targetText: string
  ): Promise<PronunciationResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('targetText', targetText);

    const response = await apiClient.instance.post<PronunciationResponse>(
      '/api/v1/ai/pronunciation/analyze',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export const pronunciationService = new PronunciationService();
