FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon && cp "$(ls build/libs/*.jar | grep -v plain | head -n 1)" /app/app.jar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/app.jar app.jar
ENV SPRING_PROFILES_ACTIVE=mysql
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
