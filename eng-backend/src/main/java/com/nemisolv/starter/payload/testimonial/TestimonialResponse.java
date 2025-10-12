package com.nemisolv.starter.payload.testimonial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class TestimonialResponse {
    private Integer id;
    private String content;
    private int rating;
    private String authorName;
    private String authorTitle;
    private String authorAvatarUrl;
    private boolean isFeatured;
    private Integer displayOrder;
    private Integer userId;
}
