package com.nemisolv.starter.payload.testimonial;

import com.nemisolv.starter.entity.Testimonial;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class TestimonialUpdateRequest {
    private String content;

    @Min(1) @Max(5)
    private Integer rating;

    private String authorName;
    private String authorTitle;
    private String authorAvatarUrl;
    private Boolean isFeatured;
    private Integer displayOrder;
    private Long userId;
    private Integer originalReviewId;
    private Testimonial.TestimonialSource source;
}