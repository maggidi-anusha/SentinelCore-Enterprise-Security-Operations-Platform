# build stage (target/ is not in git, so the jar is built here)
FROM eclipse-temurin:21-jdk AS build

WORKDIR /src

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN sh mvnw -q -B dependency:go-offline

COPY src src
RUN sh mvnw -q -B clean package -DskipTests

# run stage
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /src/target/*.jar app.jar

EXPOSE 8080

# Render free instance only has 512 MB
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=60", "-XX:+UseSerialGC", "-jar", "app.jar"]
