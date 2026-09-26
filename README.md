# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Configuracion de entorno

La URL base del backend se configura en los archivos de entorno de Angular:

- Desarrollo: `src/environments/environment.ts`
- Produccion: `src/environments/environment.production.ts`

El servicio de empleados toma `apiBaseUrl` desde esos archivos y agrega el
recurso `/empleados` internamente. Si cambia el host, puerto o version de la API,
actualiza solo el valor de `apiBaseUrl`.

Ejemplo:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api/v1',
};
```

Estos archivos si deben subirse a Git porque contienen configuracion publica del
frontend. No agregues credenciales, tokens o claves privadas aqui; para valores
locales o secretos usa archivos `.env` o `environment.local.ts`, que estan
excluidos en `.gitignore`.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
