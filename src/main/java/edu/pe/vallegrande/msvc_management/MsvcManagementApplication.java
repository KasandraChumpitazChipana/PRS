package edu.pe.vallegrande.msvc_management;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.reactive.config.EnableWebFlux;

@SpringBootApplication
@EnableWebFlux
@Slf4j
public class MsvcManagementApplication {

    public static void main(String[] args) {
        log.info("🚀 Iniciando aplicación msvc-management...");
        SpringApplication.run(MsvcManagementApplication.class, args);
        log.info("✅ Aplicación iniciada correctamente");
    }
}