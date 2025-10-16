package com.nemisolv.starter.payload;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response cho các kết quả được phân trang.
 * @param <T> Kiểu của dữ liệu trong danh sách nội dung.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PagedResponse<T> {

    /**
     * Danh sách các bản ghi cho trang hiện tại.
     */
    private List<T> content;

    /**
     * Số thứ tự của trang hiện tại (bắt đầu từ 1).
     */
    private int page;

    /**
     * Số lượng bản ghi trên mỗi trang.
     */
    private int limit;

    /**
     * Tổng số bản ghi trên tất cả các trang.
     */
    private long totalElements;

    /**
     * Tổng số trang.
     */
    private int totalPages;

    /**
     * `true` nếu đây là trang cuối cùng.
     */
    @JsonProperty("isLast")
    private boolean isLast;
}