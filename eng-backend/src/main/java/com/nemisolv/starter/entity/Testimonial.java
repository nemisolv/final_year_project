package com.nemisolv.starter.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Testimonial {

    // --- SỬA LẠI KIỂU DỮ LIỆU ĐỂ KHỚP VỚI BIGINT VÀ INT ---
    private Long id;                  // bigint -> Long
    private String content;
    private int rating;               // tinyint unsigned -> int
    private String authorName;
    private String authorTitle;
    private String authorAvatarUrl;
    private boolean isFeatured;       // tinyint(1) -> boolean
    private Integer displayOrder;     // int null -> Integer
    private Long userId;              // bigint null -> Long

    // --- BỔ SUNG CÁC TRƯỜNG CÒN THIẾU ---
    private Integer originalReviewId; // int null -> Integer
    private TestimonialSource source; // enum
    private Instant createdAt;        // timestamp
    private Instant updatedAt;        // timestamp

    // Enum định nghĩa nguồn gốc, nên đặt riêng ra một file hoặc để trong này nếu tiện
    public enum TestimonialSource {
        IN_APP_REVIEW,
        EMAIL,
        INTERVIEW,
        SOCIAL_MEDIA,
        OTHER
    }

    /**
     * Phương thức factory để tạo đối tượng Testimonial từ một ResultSet của JDBC.
     * Phiên bản này được tối ưu để khớp chính xác với schema MariaDB của bạn.
     */
    public static Testimonial fromRs(ResultSet rs) throws SQLException {
        // Lấy các giá trị nullable một cách an toàn bằng rs.getObject()
        // Nó sẽ trả về null nếu giá trị trong DB là NULL, tránh lỗi
        Integer displayOrder = rs.getObject("display_order", Integer.class);
        Long userId = rs.getObject("user_id", Long.class);
        Integer originalReviewId = rs.getObject("original_review_id", Integer.class);
        String sourceStr = rs.getString("source");

        // Chuyển đổi Timestamp sang Instant một cách an toàn
        Timestamp createdAtTs = rs.getTimestamp("created_at");
        Timestamp updatedAtTs = rs.getTimestamp("updated_at");
        Instant createdAt = (createdAtTs != null) ? createdAtTs.toInstant() : null;
        Instant updatedAt = (updatedAtTs != null) ? updatedAtTs.toInstant() : null;

        return Testimonial.builder()
                .id(rs.getLong("id")) // Sửa thành getLong
                .content(rs.getString("content"))
                .rating(rs.getInt("rating"))
                .authorName(rs.getString("author_name"))
                .authorTitle(rs.getString("author_title"))
                .authorAvatarUrl(rs.getString("author_avatar_url"))
                .isFeatured(rs.getBoolean("is_featured"))
                .displayOrder(displayOrder)
                .source(sourceStr != null ? TestimonialSource.valueOf(sourceStr) : null) // Bổ sung
                .userId(userId)
                .originalReviewId(originalReviewId) // Bổ sung
                .createdAt(createdAt) // Bổ sung
                .updatedAt(updatedAt) // Bổ sung
                .build();
    }
}