import sdk from "./instrumentation"; // Must import the OpenTelemetry SDK as first line of the main file
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ExceptionManager } from "./common/exceptions/exceptions-manager.filter";
import { RestInterceptor } from "./common/interceptors/rest.interceptor";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ClsService } from "nestjs-cls";

async function bootstrap() {
  // Must start the OpenTelemetry SDK before creating the NestJS application
  sdk.start();
  const app = await NestFactory.create(AppModule, { cors: true });

  //Configuración librería para validación de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      skipNullProperties: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  //Se carga la configuración
  const config = app.get(ConfigService);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  //Configuración de filter para el manejo de excepciones

  app.useGlobalInterceptors(new RestInterceptor(app.get(ClsService)));
  app.useGlobalFilters(new ExceptionManager());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle("MS Feature")
    .setDescription("The MS Feature API description")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Cognito JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "Cognito-Auth",
    )
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Local JWT",
        description:
          "Enter the JWT token obtained from POST /auth/login or /auth/signup",
        in: "header",
      },
      "Bearer-Auth",
    )
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  // Inicialización de la aplicación
  const port = config.get<number>("PORT") ?? 3000;
  await app.listen(port, () => {
    Logger.log(`Application is running on: port: ${port}`);
  });
}
void bootstrap(); //NOSONAR
