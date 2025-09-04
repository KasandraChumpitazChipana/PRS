package pe.edu.vallegrande.vgmsuser.infraestructure.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendForcePasswordChangeEmail(String toEmail, String username) {
        String subject = "Bienvenido(a) - Cambia tu contraseña al ingresar";
        String htmlBody = """
            <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
              <h2>¡Hola %s!</h2>
              <p>Tu cuenta en el sistema ha sido creada.</p>
              <p><b>Por seguridad</b>, deberás <b>cambiar tu contraseña</b> al ingresar por primera vez.</p>
              <p>Accede al sistema desde tu aplicación asignada.</p>
              <hr/>
              <p style="font-size:12px;color:#666">Si no solicitaste esta cuenta, ignora este mensaje.</p>
            </div>
            """.formatted(username);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // HTML
            mailSender.send(message);
            log.info("Correo de cambio de contraseña enviado a {}", toEmail);
        } catch (MessagingException e) {
            log.error("Error enviando correo a {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("No se pudo enviar el correo: " + e.getMessage(), e);
        }
    }
}
