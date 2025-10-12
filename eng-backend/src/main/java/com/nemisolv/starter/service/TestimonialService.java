package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.Testimonial;
import com.nemisolv.starter.exception.ResourceNotFoundException;
import com.nemisolv.starter.mapper.TestimonialMapper;
import com.nemisolv.starter.payload.PagedResponse;
import com.nemisolv.starter.payload.query.DynamicQuery;
import com.nemisolv.starter.payload.testimonial.TestimonialCreateRequest;
import com.nemisolv.starter.payload.testimonial.TestimonialResponse;
import com.nemisolv.starter.payload.testimonial.TestimonialUpdateRequest;
import com.nemisolv.starter.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer để xử lý các logic nghiệp vụ liên quan đến Testimonial.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TestimonialService {

    private final TestimonialRepository testimonialRepository;
    private final TestimonialMapper testimonialMapper; // Thêm mapper vào đây

    /**
     * Lấy danh sách testimonials đã được lọc, sắp xếp và phân trang.
     * Phương thức này tuân theo một quy trình chuẩn và hiệu quả:
     * 1. Đếm tổng số phần tử khớp với điều kiện lọc để tính toán phân trang.
     * 2. Lấy danh sách các phần tử cho trang hiện tại.
     * 3. Chuyển đổi các đối tượng Entity sang DTO để trả về cho client.
     *
     * @param query Đối tượng chứa các thông tin về lọc, sắp xếp và phân trang.
     * @return Một đối tượng PagedResponse chứa dữ liệu của trang và thông tin metadata.
     */
    @Transactional(readOnly = true) // Best practice: Dùng readOnly cho các truy vấn SELECT để tối ưu hiệu suất
    public PagedResponse<TestimonialResponse> getTestimonials(DynamicQuery query) {
        // --- Bước 1: Đếm tổng số bản ghi ---
        long totalElements = testimonialRepository.countTestimonials(query);

        // --- Bước 2: Tối ưu - Nếu không có kết quả, trả về ngay lập tức ---
        if (totalElements == 0) {
            return PagedResponse.<TestimonialResponse>builder()
                    .content(Collections.emptyList()) // Hoặc List.of()
                    .page(query.page())
                    .limit(query.limit())
                    .totalElements(0L)
                    .totalPages(0)
                    .isLast(true)
                    .build();
        }

        // --- Bước 3: Lấy danh sách các bản ghi cho trang hiện tại ---
        List<Testimonial> testimonials = testimonialRepository.findTestimonials(query);

        // --- Bước 4: Chuyển đổi từ List<Entity> sang List<DTO> ---
        List<TestimonialResponse> testimonialResponses = testimonials.stream()
                .map(testimonialMapper::toResponse) // Sử dụng method reference cho code gọn gàng
                .collect(Collectors.toList());

        // --- Bước 5: Tính toán các thông số phân trang ---
        // Sử dụng lại các giá trị mặc định nếu cần, để đảm bảo tính nhất quán với repository
        int page = query.page() > 0 ? query.page() : 1;
        int limit = query.limit() > 0 ? query.limit() : 10;
        int totalPages = (int) Math.ceil((double) totalElements / limit);

        // --- Bước 6: Xây dựng và trả về đối tượng PagedResponse hoàn chỉnh ---
        return PagedResponse.<TestimonialResponse>builder()
                .content(testimonialResponses)
                .page(page)
                .limit(limit)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .isLast(page >= totalPages)
                .build();

    }

    /**
     * Tạo một Testimonial mới.
     * @param createRequest DTO chứa thông tin để tạo mới.
     * @return DTO của Testimonial vừa được tạo.
     */
    @Transactional
    public TestimonialResponse createTestimonial(TestimonialCreateRequest createRequest) {
        log.info("Creating a new testimonial for author: {}", createRequest.getAuthorName());

        // 1. Chuyển đổi DTO sang Entity bằng Mapper
        Testimonial testimonialToSave = testimonialMapper.toEntity(createRequest);

        // 2. Service chịu trách nhiệm xử lý các logic nghiệp vụ như gán giá trị mặc định, sinh ID, timestamp
        // (Trong trường hợp ID là auto-increment, DB sẽ tự xử lý)
        testimonialToSave.setCreatedAt(Instant.now());
        testimonialToSave.setUpdatedAt(Instant.now());

        // 3. Gọi repository để lưu
        Testimonial savedTestimonial = testimonialRepository.save(testimonialToSave);

        // 4. Chuyển đổi Entity đã lưu sang DTO để trả về
        return testimonialMapper.toResponse(savedTestimonial);
    }

    /**
     * Cập nhật một Testimonial đã có.
     * @param id ID của Testimonial cần cập nhật.
     * @param updateRequest DTO chứa thông tin mới.
     * @return DTO của Testimonial sau khi đã được cập nhật.
     */
    @Transactional
    public TestimonialResponse updateTestimonial(Long id, TestimonialUpdateRequest updateRequest) {
        log.info("Updating testimonial with id: {}", id);

        // 1. Lấy ra Entity hiện tại từ DB. Nếu không tồn tại, sẽ ném ra exception.
        Testimonial existingTestimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find any testimonial with id: " + id));

        // 2. Dùng Mapper để cập nhật các trường từ DTO vào Entity đã có.
        testimonialMapper.updateEntityFromDto(updateRequest, existingTestimonial);
        existingTestimonial.setUpdatedAt(Instant.now()); // Luôn cập nhật timestamp

        // 3. Lưu lại Entity đã được cập nhật.
        Testimonial updatedTestimonial = testimonialRepository.update(existingTestimonial);

        return testimonialMapper.toResponse(updatedTestimonial);
    }

    /**
     * Xóa một Testimonial theo ID.
     * @param id ID của Testimonial cần xóa.
     */
    @Transactional
    public void deleteTestimonial(Long id) {
        log.info("Deleting testimonial with id: {}", id);

        // 1. Kiểm tra sự tồn tại trước khi xóa để có thể trả về lỗi 404 nếu không tìm thấy.
        if (!testimonialRepository.existsById(id)) {
            new ResourceNotFoundException("could not find any testimonial with id: " + id);
        }

        // 2. Thực hiện xóa.
        testimonialRepository.deleteById(id);
    }

    // =================================================================
    // CÁC PHƯƠNG THỨC READ (TRUY VẤN)
    // =================================================================

    /**
     * Tìm một Testimonial theo ID.
     * @param id ID của Testimonial.
     * @return DTO của Testimonial được tìm thấy.
     */
    @Transactional(readOnly = true)
    public TestimonialResponse findTestimonialById(Long id) {
        return testimonialRepository.findById(id)
                .map(testimonialMapper::toResponse) // Nếu tìm thấy, map sang DTO
                .orElseThrow(() -> new ResourceNotFoundException("could not find any testimonial with id: " + id)); // Nếu không, ném lỗi
    }

    /**
     * Lấy danh sách các testimonials nổi bật cho trang chủ.
     * @return Danh sách các TestimonialResponse.
     */
    @Transactional(readOnly = true)
    public List<TestimonialResponse> findFeatured() {
        return testimonialRepository.findFeatured().stream()
                .map(testimonialMapper::toResponse)
                .collect(Collectors.toList());
    }

}