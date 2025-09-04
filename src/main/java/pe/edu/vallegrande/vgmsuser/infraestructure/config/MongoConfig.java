package pe.edu.vallegrande.vgmsuser.infraestructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;

@Configuration
@EnableReactiveMongoRepositories(basePackages = "pe.edu.vallegrande.vgmsuser.infraestructure.repository")
public class MongoConfig {
    // La configuración de MongoDB se maneja ahora completamente a través de application.yml
    // No necesitamos extender AbstractReactiveMongoConfiguration
}
