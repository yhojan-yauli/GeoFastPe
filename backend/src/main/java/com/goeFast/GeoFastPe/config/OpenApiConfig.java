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

                                ## Modulos
                                - **Autenticacion y perfil**: /api/v1/auth y /api/v1/users (registro, login, perfil, contrasena, estadisticas).
                                - **Catalogos**: /api/v1/catalogos. Valores validos para los formularios (categorias, distritos, ciudades).
                                - **Archivos**: /api/v1/archivos. Sube una imagen y usa la url devuelta en image, images o avatar.
                                - **Mapa**: /api/v1/mapa/puntos. Servicios y emergencias dentro de un radio.
                                - **Servicios locales**: /api/v1/servicios.
                                - **Ventas locales**: /api/v1/ventas (incluye contactar al vendedor).
                                - **Solidaridad**: /api/v1/solidaridad (donaciones, solicitudes y favoritos).
                                - **Emergencias (SOS)**: /api/v1/emergencias.
                                - **Reportes comunitarios**: /api/v1/reportes.
                                - **Eventos comunitarios**: /api/v1/eventos (participar y tabs).
                                - **Mensajes**: /api/v1/conversaciones.
                                - **Geo**: /api/v1/geo (buscar lugares, clima y rutas).
                                - **Administracion**: /api/v1/admin/users (solo ADMIN).

                                Lectura publica: catalogos, mapa, servicios, ventas, solidaridad, emergencias, reportes, eventos, geo y archivos.
                                Crear, editar, borrar, participar y mensajes requieren token. Cambiar el estado de emergencias y reportes requiere ADMIN.
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
