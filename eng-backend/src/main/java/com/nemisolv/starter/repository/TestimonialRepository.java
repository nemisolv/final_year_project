package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.Testimonial;
import com.nemisolv.starter.payload.query.DynamicQuery;
import com.nemisolv.starter.payload.query.FilterCriteria;
import com.nemisolv.starter.payload.query.Operator;
import com.nemisolv.starter.payload.query.SortOption;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
@Slf4j
@RequiredArgsConstructor
public class TestimonialRepository {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate jdbcTemplate;

    // *** WHITELIST BẮT BUỘC để chống SQL Injection ***
    private static final Set<String> ALLOWED_FILTER_COLUMNS = Set.of("rating", "author_name", "is_featured");
    private static final Set<String> ALLOWED_SORT_COLUMNS = Set.of("id", "rating", "author_name", "created_at");

    public long countTestimonials(DynamicQuery query) {
        StringBuilder sqlBuilder = new StringBuilder("SELECT COUNT(*) FROM testimonials");
        List<Object> params = new ArrayList<>();
        buildWhereClause(query.filters(), sqlBuilder, params);

        Long total = jdbcTemplate.queryForObject(sqlBuilder.toString(), Long.class, params.toArray());
        return total != null ? total : 0L;
    }

    public List<Testimonial> findTestimonials(DynamicQuery query) {
        StringBuilder sqlBuilder = new StringBuilder("SELECT * FROM testimonials");
        List<Object> params = new ArrayList<>();

        // 1. Xây dựng mệnh đề WHERE
        buildWhereClause(query.filters(), sqlBuilder, params);

        // 2. Xây dựng mệnh đề ORDER BY
        buildOrderByClause(query.sorts(), sqlBuilder);

        // 3. Xây dựng mệnh đề LIMIT OFFSET
        int limit = query.limit() > 0 ? query.limit() : 10;
        int page = query.page() > 0 ? query.page() : 1;
        int offset = (page - 1) * limit;
        sqlBuilder.append(" LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbcTemplate.query(sqlBuilder.toString(), (rs, _row) -> Testimonial.fromRs(rs), params.toArray());
    }


    public List<Testimonial> findFeatured() {
        String sql = "SELECT * FROM testimonials " +
                "WHERE is_featured = TRUE " +
                "ORDER BY display_order ASC, created_at DESC " +
                "LIMIT 6";
        return jdbcTemplate.query(sql, (rs, _row) -> Testimonial.fromRs(rs));
    }


    /**
     * Tìm một testimonial theo ID.
     * @return Optional chứa Testimonial nếu tìm thấy, ngược lại trả về Optional rỗng.
     * Best Practice: Trả về Optional để buộc tầng service phải xử lý trường hợp không tìm thấy,
     * tránh NullPointerException.
     */
    public Optional<Testimonial> findById(Long id) {
        String sql = "SELECT * FROM testimonials WHERE id = ?";
        try {
            Testimonial testimonial = jdbcTemplate.queryForObject(sql, (rs, _row) -> Testimonial.fromRs(rs), id);
            return Optional.ofNullable(testimonial);
        } catch (EmptyResultDataAccessException e) {
            log.warn("No testimonial found with id: {}", id);
            return Optional.empty();
        }
    }

    /**
     * Lưu một testimonial mới vào cơ sở dữ liệu.
     * ID và created_at/updated_at nên được xử lý ở tầng service trước khi gọi phương thức này.
     * @return Testimonial đã được lưu.
     */
    public Testimonial save(Testimonial testimonial) {
        String sql = "INSERT INTO testimonials (id, content, rating, author_name, author_title, " +
                "author_avatar_url, is_featured, display_order, source, user_id, original_review_id, " +
                "created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        int rowsAffected = jdbcTemplate.update(sql,
                testimonial.getId(),
                testimonial.getContent(),
                testimonial.getRating(),
                testimonial.getAuthorName(),
                testimonial.getAuthorTitle(),
                testimonial.getAuthorAvatarUrl(),
                testimonial.isFeatured(),
                testimonial.getDisplayOrder(),
                testimonial.getSource().name(), // Chuyển enum sang String
                testimonial.getUserId(),
                testimonial.getOriginalReviewId(),
                testimonial.getCreatedAt(),
                testimonial.getUpdatedAt()
        );

        if (rowsAffected == 0) {
            log.error("Failed to save testimonial, no rows affected.");
            // Bạn có thể throw một exception ở đây nếu muốn
            // throw new DataAccessException("Failed to save testimonial");
        }

        return testimonial;
    }

    /**
     * Cập nhật một testimonial đã tồn tại.
     * @return Testimonial đã được cập nhật.
     */
    public Testimonial update(Testimonial testimonial) {
        String sql = "UPDATE testimonials SET content = ?, rating = ?, author_name = ?, author_title = ?, " +
                "author_avatar_url = ?, is_featured = ?, display_order = ?, source = ?, user_id = ?, " +
                "original_review_id = ?, updated_at = ? " +
                "WHERE id = ?";

        int rowsAffected = jdbcTemplate.update(sql,
                testimonial.getContent(),
                testimonial.getRating(),
                testimonial.getAuthorName(),
                testimonial.getAuthorTitle(),
                testimonial.getAuthorAvatarUrl(),
                testimonial.isFeatured(),
                testimonial.getDisplayOrder(),
                testimonial.getSource().name(),
                testimonial.getUserId(),
                testimonial.getOriginalReviewId(),
                testimonial.getUpdatedAt(),
                testimonial.getId() // id cho mệnh đề WHERE
        );

        if (rowsAffected == 0) {
            log.warn("Could not update testimonial with id: {}. It may not exist.", testimonial.getId());
            // Tầng service nên xử lý trường hợp này, ví dụ throw ResourceNotFoundException
        }

        return testimonial;
    }

    /**
     * Xóa một testimonial theo ID.
     * @return boolean cho biết việc xóa có thành công hay không.
     */
    public boolean deleteById(Long id) {
        String sql = "DELETE FROM testimonials WHERE id = ?";
        int rowsAffected = jdbcTemplate.update(sql, id);
        return rowsAffected > 0;
    }

    /**
     * Kiểm tra sự tồn tại của một testimonial theo ID.
     * Hiệu quả hơn findById vì chỉ cần đếm thay vì lấy toàn bộ dữ liệu.
     */
    public boolean existsById(Long id) {
        String sql = "SELECT COUNT(1) FROM testimonials WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }
































    private void buildWhereClause(List<FilterCriteria> filters, StringBuilder sqlBuilder, List<Object> params) {
        if (CollectionUtils.isEmpty(filters)) {
            return;
        }

        String whereConditions = filters.stream()
                .filter(criteria -> ALLOWED_FILTER_COLUMNS.contains(criteria.key())) // SECURITY: Chỉ cho phép lọc các cột trong whitelist
                .map(criteria -> {
                    // Xử lý toán tử LIKE để tự động thêm dấu %
                    if (criteria.operator() == Operator.LIKE) {
                        params.add("%" + criteria.value() + "%");
                    } else {
                        params.add(criteria.value());
                    }
                    // Trả về chuỗi điều kiện với placeholder `?`
                    return String.format("%s %s ?", criteria.key(), criteria.operator().getSqlOperator());
                })
                .collect(Collectors.joining(" AND "));

        if (!whereConditions.isEmpty()) {
            sqlBuilder.append(" WHERE ").append(whereConditions);
        }
    }

    private void buildOrderByClause(List<SortOption> sorts, StringBuilder sqlBuilder) {
        if (CollectionUtils.isEmpty(sorts)) {
            // Luôn có một sắp xếp mặc định để đảm bảo kết quả nhất quán
            sqlBuilder.append(" ORDER BY created_at DESC");
            return;
        }

        String orderByConditions = sorts.stream()
                .filter(sort -> ALLOWED_SORT_COLUMNS.contains(sort.sortBy())) // SECURITY: Validate cột sắp xếp
                .map(sort -> String.format("%s %s", sort.sortBy(), sort.direction()))
                .collect(Collectors.joining(", "));

        if (!orderByConditions.isEmpty()) {
            sqlBuilder.append(" ORDER BY ").append(orderByConditions);
        } else {
            sqlBuilder.append(" ORDER BY created_at DESC");
        }
    }
}