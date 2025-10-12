package com.nemisolv.starter.payload;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.nemisolv.starter.enums.ApiResponseCode;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Một cấu trúc response chuẩn hóa, bất biến (immutable) cho tất cả các API endpoint.
 * Nó cung cấp một format nhất quán cho cả response thành công và thất bại.
 *
 * @param <T> Kiểu của dữ liệu (payload) trong response.
 */
@Getter
@Builder(toBuilder = true) // toBuilder=true cho phép sao chép và sửa đổi một phần
@AllArgsConstructor(access = AccessLevel.PRIVATE) // Chỉ builder mới có thể tạo instance
@NoArgsConstructor(access = AccessLevel.PRIVATE, force = true) // Bắt buộc cho Jackson/JPA
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();
    private final int code;
    private final String message;
    private final T data;

    // --- Các phương thức Factory cho Response thành công ---

    public static <T> ApiResponse<T> success(T data) {
        return success(data, ApiResponseCode.OPERATION_SUCCEED.getMessage());
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .code(ApiResponseCode.OPERATION_SUCCEED.getCode())
                .message(message)
                .data(data)
                .build();
    }

    // --- Các phương thức Factory cho Response lỗi ---

    public static <T> ApiResponse<T> error(ApiResponseCode responseCode) {
        return error(responseCode.getCode(), responseCode.getMessage());
    }

    public static <T> ApiResponse<T> error(String message) {
        return error(ApiResponseCode.OPERATION_FAILED.getCode(), message);
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .build(); // Data sẽ là null theo mặc định
    }
}