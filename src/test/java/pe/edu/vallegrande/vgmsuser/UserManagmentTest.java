package pe.edu.vallegrande.vgmsuser;

import pe.edu.vallegrande.vgmsuser.infraestructure.rest.UserManagementRest;
import pe.edu.vallegrande.vgmsuser.application.service.IUserManagementService;
import pe.edu.vallegrande.vgmsuser.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserManagmentTest {

    @Mock
    private IUserManagementService userManagementService;

    @InjectMocks
    private UserManagementRest userManagementRest;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUsername("testUser");
        user.setEmail("test@example.com");
    }

    @Test
    void createCompleteUser_WhenValidUser_ShouldReturnSuccessResponse() {
        when(userManagementService.createCompleteUser(user))
                .thenReturn(Mono.just("Usuario creado exitosamente"));

        Mono<ResponseEntity<String>> response = userManagementRest.createCompleteUser(user);

        StepVerifier.create(response)
                .assertNext(entity -> {
                    assertEquals(201, entity.getStatusCodeValue());
                    assertTrue(entity.getBody().contains("exitosamente"));
                })
                .verifyComplete();

        verify(userManagementService, times(1)).createCompleteUser(user);
    }

    @Test
    void createCompleteUser_WhenServiceReturnsErrorMessage_ShouldReturnBadRequest() {
        when(userManagementService.createCompleteUser(user))
                .thenReturn(Mono.just("Error al crear usuario"));

        Mono<ResponseEntity<String>> response = userManagementRest.createCompleteUser(user);

        StepVerifier.create(response)
                .assertNext(entity -> {
                    assertEquals(400, entity.getStatusCodeValue());
                    assertTrue(entity.getBody().contains("Error"));
                })
                .verifyComplete();

        verify(userManagementService, times(1)).createCompleteUser(user);
    }

    @Test
    void createCompleteUser_WhenServiceThrowsException_ShouldReturnBadRequest() {
        when(userManagementService.createCompleteUser(user))
                .thenReturn(Mono.error(new RuntimeException("Fallo en base de datos")));

        Mono<ResponseEntity<String>> response = userManagementRest.createCompleteUser(user);

        StepVerifier.create(response)
                .assertNext(entity -> {
                    assertEquals(400, entity.getStatusCodeValue());
                    assertTrue(entity.getBody().contains("Error"));
                })
                .verifyComplete();

        verify(userManagementService, times(1)).createCompleteUser(user);
    }

    @Test
    void createCompleteUser_WhenUsernameIsNull_ShouldReturnValidationError() {
        user.setUsername(null);

        // Como el @Valid está en el controller, aquí simulamos la lógica
        // con un servicio normal
        when(userManagementService.createCompleteUser(user))
                .thenReturn(Mono.error(new IllegalArgumentException("El username es obligatorio")));

        Mono<ResponseEntity<String>> response = userManagementRest.createCompleteUser(user);

        StepVerifier.create(response)
                .assertNext(entity -> {
                    assertEquals(400, entity.getStatusCodeValue());
                    assertTrue(entity.getBody().contains("Error"));
                })
                .verifyComplete();
    }
}
