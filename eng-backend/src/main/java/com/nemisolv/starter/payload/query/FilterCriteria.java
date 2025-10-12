package com.nemisolv.starter.payload.query;

// Sử dụng record cho DTO bất biến, rất hiện đại
public record FilterCriteria(
    String key,       // Tên trường muốn lọc, vd: "rating", "authorName"
    Operator operator,  // Phép toán, vd: EQUALS, GREATER_THAN, LIKE
    Object value       // Giá trị cần so sánh
) {
}