// front-end/services/tts.service.ts
import { apiClient } from '@/lib/api/client';

export interface VoiceInfo {
  voiceId: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
}

export interface TTSRequest {
  text: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
}

export interface TTSResponse {
  audioFilePath: string;
  text: string;
  voiceId: string;
  durationMs?: number;
}

export interface VoicesListResponse {
  voices: VoiceInfo[];
  total: number;
}

class TTSService {
  /**
   * Synthesize speech from text
   */
  async synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
    const response = await apiClient.instance.post<TTSResponse>(
      '/api/v1/ai/tts/synthesize',
      request
    );
    return response.data;
  }

  /**
   * Get list of available TTS voices
   */
  async getVoices(): Promise<VoicesListResponse> {
    const response = await apiClient.instance.get<VoicesListResponse>(
      '/api/v1/ai/tts/voices'
    );
    return response.data;
  }

  /**
   * Get audio file URL for playback
   */
  getAudioUrl(filename: string): string {
    return `${apiClient.instance.defaults.baseURL}/api/v1/ai/tts/audio/${filename}`;
  }

  /**
   * Download audio file
   */
  async downloadAudio(filename: string): Promise<Blob> {
    const response = await apiClient.instance.get<Blob>(
      `/api/v1/ai/tts/audio/${filename}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  /**
   * Delete audio file
   */
  async deleteAudio(filename: string): Promise<{ message: string }> {
    const response = await apiClient.instance.delete<{ message: string }>(
      `/api/v1/ai/tts/audio/${filename}`
    );
    return response.data;
  }
}

export const ttsService = new TTSService();
