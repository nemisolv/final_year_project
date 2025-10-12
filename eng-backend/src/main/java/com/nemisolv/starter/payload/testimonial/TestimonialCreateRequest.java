package com.nemisolv.starter.payload.testimonial;

import com.nemisolv.starter.entity.Testimonial;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TestimonialCreateRequest {
    @NotBlank(message = "Content cannot be blank")
    private String content;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer rating;

    @NotBlank(message = "Author name cannot be blank")
    private String authorName;

    @NotBlank(message = "Author title cannot be blank")
    private String authorTitle;

    private String authorAvatarUrl;
    private boolean isFeatured;
    private Integer displayOrder;
    private Long userId;
    private Integer originalReviewId;
    private Testimonial.TestimonialSource source;
}