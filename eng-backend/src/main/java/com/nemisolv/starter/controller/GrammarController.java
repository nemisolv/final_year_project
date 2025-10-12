package com.nemisolv.starter.controller;
import com.nemisolv.starter.payload.ai.GrammarCheckRequest;
import com.nemisolv.starter.payload.ai.GrammarCheckResponse;
import com.nemisolv.starter.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public class GrammarController {



    @PostMapping("/grammar/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GrammarCheckResponse> checkGrammar(@Valid @RequestBody GrammarCheckRequest grammarRequest,
                                                             @AuthenticationPrincipal UserPrincipal currentUser) {
        // Optional: Ghi log rằng user nào đã sử dụng tính năng này
        // auditLogService.log(currentUser.getId(), "GRAMMAR_CHECK", "User checked a text snippet.");

        // Gọi qua GrammarAIService, service này sẽ dùng RestTemplate hoặc WebClient
        // để POST đến endpoint /grammar/check của AI Service
        GrammarCheckResponse response = grammarAIService.checkGrammar(grammarRequest);
        return ResponseEntity.ok(response);
    }
}
