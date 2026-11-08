package com.goeFast.GeoFastPe.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI geoFastPeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("GeoFastPe API")
                        .description("""
                                API REST de GeoFastPe.

                                ## Como probar la autenticacion en Swagger
                                1. Ejecuta **POST /api/v1/auth/register** con tu nombre, una contrasena
                                   y al menos un correo o un telefono.
                                2. Copia el valor del campo `token` de la respuesta.
                                3. Pulsa el boton **Authorize** (arriba a la derecha) y pega el token
                                   sin la palabra `Bearer`.
                                4. Ya puedes ejecutar los endpoints que tienen el candado, por ejemplo
                                   **GET /api/v1/auth/me**.

                                Si ya tienes cuenta, usa **POST /api/v1/auth/login** enviando
                                `identifier` (correo o telefono) y `password`.

                                ## Endpoints principales
                                - **POST /api/v1/auth/register**: crear cuenta y obtener token.
                                - **POST /api/v1/auth/login**: iniciar sesion y obtener token.
                                - **GET /api/v1/auth/me**: ver el perfil del usuario autenticado.
                                - **GET/PATCH /api/v1/users/me**: ver o actualizar el perfil.
                                - **GET/PATCH /api/v1/admin/users**: gestion de usuarios (solo ADMIN).
                                """)
                        .version("v1"))
                .components(new Components().addSecuritySchemes(BEARER_AUTH,
                        new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
