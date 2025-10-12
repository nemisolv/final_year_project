package com.nemisolv.starter.mapper;

import com.nemisolv.starter.entity.Testimonial;
import com.nemisolv.starter.payload.testimonial.TestimonialCreateRequest;
import com.nemisolv.starter.payload.testimonial.TestimonialResponse;
import com.nemisolv.starter.payload.testimonial.TestimonialUpdateRequest;
import org.mapstruct.*;

/**
 * Mapper để chuyển đổi giữa Testimonial Entity và các DTO liên quan.
 * Sử dụng MapStruct để tự động hóa việc mapping.
 */
@Mapper(componentModel = "spring") // QUAN TRỌNG: Để Spring có thể inject Mapper này
public interface TestimonialMapper {

    /**
     * Chuyển đổi từ Entity sang Response DTO.
     */
    TestimonialResponse toResponse(Testimonial testimonial);

    /**
     * Chuyển đổi từ CreateRequest DTO sang một Entity mới.
     * Bỏ qua các trường do hệ thống tự sinh ra (id, createdAt, updatedAt).
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Testimonial toEntity(TestimonialCreateRequest createRequest);

    /**
     * Cập nhật một Entity đã tồn tại từ UpdateRequest DTO.
     *
     * @param updateRequest DTO chứa dữ liệu cần cập nhật.
     * @param testimonial   Entity hiện có trong DB (được đánh dấu là @MappingTarget).
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE) // QUAN TRỌNG: Bỏ qua các trường null trong DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true) // Không cho phép cập nhật ngày tạo
    @Mapping(target = "updatedAt", ignore = true) // Service sẽ tự xử lý
    void updateEntityFromDto(TestimonialUpdateRequest updateRequest, @MappingTarget Testimonial testimonial);

}