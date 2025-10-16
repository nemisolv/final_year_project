package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.payload.PagedResponse;
import com.nemisolv.starter.payload.query.DynamicQuery;
import com.nemisolv.starter.payload.testimonial.TestimonialCreateRequest;
import com.nemisolv.starter.payload.testimonial.TestimonialResponse;
import com.nemisolv.starter.payload.testimonial.TestimonialUpdateRequest;
import com.nemisolv.starter.service.TestimonialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller chịu trách nhiệm quản lý các API liên quan đến Testimonials.
 */
@RestController
@RequestMapping("/api/v1/testimonials") // Best Practice: Thêm /api/v1 prefix
@RequiredArgsConstructor
@Slf4j
public class TestimonialController {

    private final TestimonialService testimonialService;

    /**
     * Endpoint để tìm kiếm, lọc và phân trang testimonials một cách linh hoạt.
     * Sử dụng POST để nhận một đối tượng truy vấn phức tạp trong request body.
     * Endpoint này yêu cầu quyền ADMIN.
     *
     * @param query Đối tượng DynamicQuery chứa các tiêu chí lọc, sắp xếp, phân trang.
     * @return Một PagedResponse được gói trong ApiResponse.
     */
    @PostMapping("/search")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN mới có quyền truy vấn động
    public ApiResponse<PagedResponse<TestimonialResponse>> searchTestimonials(
            @Valid @RequestBody DynamicQuery query // @Valid để kích hoạt validation
    ) {
        log.info("Received search request for testimonials with query: {}", query);
        PagedResponse<TestimonialResponse> pagedResponse = testimonialService.getTestimonials(query);

        return ApiResponse.success(pagedResponse, "Testimonials retrieved successfully.");
    }

    /**
     * Endpoint công khai để lấy danh sách các testimonials nổi bật cho trang chủ.
     * Sử dụng GET vì đây là một truy vấn đơn giản, không cần tham số phức tạp.
     */
    @GetMapping("/featured")
    public ApiResponse<List<TestimonialResponse>> getFeaturedTestimonials() {
        log.info("API: Fetching featured testimonials for public display.");
        List<TestimonialResponse> featuredTestimonials = testimonialService.findFeatured();
        return ApiResponse.success(featuredTestimonials, "Featured testimonials retrieved successfully.");
    }


    /**
     * Lấy thông tin chi tiết của một testimonial theo ID.
     * Yêu cầu quyền ADMIN.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TestimonialResponse> getTestimonialById(@PathVariable Long id) {
        log.info("API: Fetching testimonial with id: {}", id);
        TestimonialResponse testimonial = testimonialService.findTestimonialById(id);
        return ApiResponse.success(testimonial);
    }

    // =================================================================
    // ENDPOINTS THAY ĐỔI DỮ LIỆU (CREATE, UPDATE, DELETE)
    // =================================================================

    /**
     * Tạo một testimonial mới.
     * Yêu cầu quyền ADMIN.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TestimonialResponse> createTestimonial(
            @Valid @RequestBody TestimonialCreateRequest createRequest
    ) {
        log.info("API: Creating new testimonial for author: {}", createRequest.getAuthorName());
        TestimonialResponse newTestimonial = testimonialService.createTestimonial(createRequest);
        return ApiResponse.success(newTestimonial, "Testimonial created successfully.");
    }

    /**
     * Cập nhật một testimonial đã tồn tại.
     * Yêu cầu quyền ADMIN.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TestimonialResponse> updateTestimonial(
            @PathVariable Long id,
            @Valid @RequestBody TestimonialUpdateRequest updateRequest
    ) {
        log.info("API: Updating testimonial with id: {}", id);
        TestimonialResponse updatedTestimonial = testimonialService.updateTestimonial(id, updateRequest);
        return ApiResponse.success(updatedTestimonial, "Testimonial updated successfully.");
    }

    /**
     * Xóa một testimonial theo ID.
     * Yêu cầu quyền ADMIN.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteTestimonial(@PathVariable Long id) {
        log.info("API: Deleting testimonial with id: {}", id);
        testimonialService.deleteTestimonial(id);
        return ApiResponse.success(null);
    }
}