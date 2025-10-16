package com.nemisolv.starter.payload.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response containing list of available TTS voices
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoicesListResponse {

    private List<VoiceInfo> voices;

    private Integer total;
}
