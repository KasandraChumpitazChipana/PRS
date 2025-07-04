package edu.pe.vallegrande.msvc_management.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // SOLAMENTE permitir esta URL específica del frontend
        corsConfig.setAllowedOriginPatterns(Arrays.asList(
            "https://3000-vallegrande-vgwebeducat-gid9a8uvmpu.ws-us120.gitpod.io"
        ));
        
        // Métodos permitidos
        corsConfig.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Headers permitidos
        corsConfig.setAllowedHeaders(List.of("*"));
        
        // IMPORTANTE: Permitir credenciales
        corsConfig.setAllowCredentials(true);
        
        // Headers expuestos
        corsConfig.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Methods"
        ));
        
        // Tiempo de cache para preflight requests
        corsConfig.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        
        return new CorsWebFilter(source);
    }
}