package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ai.TTSRequest;
import com.nemisolv.starter.payload.ai.TTSResponse;
import com.nemisolv.starter.payload.ai.VoicesListResponse;
import com.nemisolv.starter.security.UserPrincipal;
import com.nemisolv.starter.service.TTSAIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Text-to-Speech functionality
 * Provides endpoints for speech synthesis and voice management
 */
@RestController
@RequestMapping("/api/v1/ai/tts")
@RequiredArgsConstructor
@Slf4j
public class TTSController {

    private final TTSAIService ttsAIService;

    /**
     * Synthesize speech from text
     *
     * POST /api/ai/tts/synthesize
     *
     * Request body:
     * {
     *   "text": "Hello world",
     *   "voiceId": "21m00Tcm4TlvDq8ikWAM",  // Optional
     *   "stability": 0.5,                    // Optional (0.0-1.0)
     *   "similarityBoost": 0.75,            // Optional (0.0-1.0)
     *   "style": 0.0                        // Optional (0.0-1.0)
     * }
     *
     * Response:
     * {
     *   "audioFilePath": "audio_output/tts_abc123.mp3",
     *   "text": "Hello world",
     *   "voiceId": "21m00Tcm4TlvDq8ikWAM",
     *   "durationMs": 2500
     * }
     */
    @PostMapping("/synthesize")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TTSResponse> synthesizeSpeech(
            @Valid @RequestBody TTSRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("User {} requesting TTS synthesis for text: '{}'",
                currentUser.getId(),
                request.getText().substring(0, Math.min(30, request.getText().length())) + "...");

        // Set user ID for tracking
        request.setUserId(currentUser.getId());

        TTSResponse response = ttsAIService.synthesizeSpeech(request);

        return ResponseEntity.ok(response);
    }

    /**
     * Get list of available TTS voices
     *
     * GET /api/ai/tts/voices
     *
     * Response:
     * {
     *   "voices": [
     *     {
     *       "voiceId": "21m00Tcm4TlvDq8ikWAM",
     *       "name": "Rachel",
     *       "category": "premade",
     *       "labels": {"accent": "american", "age": "young"}
     *     },
     *     ...
     *   ],
     *   "total": 25
     * }
     */
    @GetMapping("/voices")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VoicesListResponse> getAvailableVoices(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("User {} requesting available TTS voices", currentUser.getId());

        VoicesListResponse response = ttsAIService.getAvailableVoices();

        return ResponseEntity.ok(response);
    }

    /**
     * Get generated audio file
     *
     * GET /api/ai/tts/audio/{filename}
     *
     * Response: Audio file (audio/mpeg)
     */
    @GetMapping("/audio/{filename}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getAudioFile(
            @PathVariable String filename,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("User {} requesting audio file: {}", currentUser.getId(), filename);

        Resource resource = ttsAIService.getAudioFile(filename);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    /**
     * Delete audio file
     *
     * DELETE /api/ai/tts/audio/{filename}
     *
     * Response:
     * {
     *   "message": "Audio file deleted successfully"
     * }
     */
    @DeleteMapping("/audio/{filename}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteAudioFile(
            @PathVariable String filename,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("User {} requesting deletion of audio file: {}", currentUser.getId(), filename);

        boolean deleted = ttsAIService.deleteAudioFile(filename);

        if (deleted) {
            return ResponseEntity.ok()
                    .body(new MessageResponse("Audio file deleted successfully"));
        } else {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to delete audio file"));
        }
    }

    /**
     * Simple message response class
     */
    private record MessageResponse(String message) {}
}
