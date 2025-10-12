package com.nemisolv.starter.payload.query;

import jakarta.validation.constraints.Min;
import java.util.List;

public record DynamicQuery(
    @Min(value = 1, message = "Page number must be greater than 0")
    int page,

    @Min(value = 1, message = "Limit must be greater than 0")
    int limit,

    List<FilterCriteria> filters, // Danh sách các điều kiện lọc
    List<SortOption> sorts         // Danh sách các điều kiện sắp xếp
) {
}