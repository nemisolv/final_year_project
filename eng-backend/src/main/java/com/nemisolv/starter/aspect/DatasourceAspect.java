//package com.nemisolv.starter.aspect;
//
//
//import com.nemisolv.starter.annotation.datasource.LogDatasource;
//import com.nemisolv.starter.annotation.permission.RequirePermission;
//import com.nemisolv.starter.troubleshoot.DatasourceVerifier;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.aspectj.lang.JoinPoint;
//import org.aspectj.lang.annotation.After;
//import org.aspectj.lang.annotation.Aspect;
//import org.aspectj.lang.annotation.Before;
//import org.aspectj.lang.reflect.MethodSignature;
//import org.springframework.stereotype.Component;
//
//import java.lang.reflect.Method;
// // disable for now
//@Aspect
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class DatasourceAspect {
//    private final DatasourceVerifier datasourceVerifier;
//
//    @Before("@annotation(com.nemisolv.starter.annotation.datasource.LogDatasource)")
//    public void logDatasource(JoinPoint joinPoint) {
//        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
//        Method method = signature.getMethod();
//        LogDatasource annotation = method.getAnnotation(LogDatasource.class);
//
//        if (annotation == null) {
//            return;
//        }
//        datasourceVerifier.logCurrentDatasourceHostname();
//    }
//
//}
