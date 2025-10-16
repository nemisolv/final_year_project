package com.nemisolv.starter.controller;
import com.nemisolv.starter.payload.ai.GrammarCheckRequest;
import com.nemisolv.starter.payload.ai.GrammarCheckResponse;
import com.nemisolv.starter.security.UserPrincipal;
import com.nemisolv.starter.service.GrammarAIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class GrammarController {

    private final GrammarAIService grammarAIService;

    @PostMapping("/grammar/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GrammarCheckResponse> checkGrammar(@Valid @RequestBody GrammarCheckRequest grammarRequest,
                                                             @AuthenticationPrincipal UserPrincipal currentUser) {
        GrammarCheckResponse response = grammarAIService.checkGrammar(grammarRequest);
        return ResponseEntity.ok(response);
    }
}
