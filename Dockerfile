FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -B dependency:go-offline

COPY src src
RUN ./mvnw -B clean package -DskipTests
RUN set -eux; \
    artifact="$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.original' -print -quit)"; \
    test -n "$artifact"; \
    cp "$artifact" /app/application.jar

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/application.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
