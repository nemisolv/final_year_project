package com.nemisolv.starter.enums;

public interface ValuableEnum {
    String getValue();
    // Generic base method
    static <E extends Enum<E> & ValuableEnum> E fromValue(Class<E> enumType, String value) {
        for (E constant : enumType.getEnumConstants()) {
            if (constant.getValue().equals(value)) {
                return constant;
            }
        }
        return null;
    }
}
