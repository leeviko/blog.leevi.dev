declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PG_USER: string;
      PG_HOST: string;
      PG_DATABASE: string;
      PG_PASSWORD: string;
      REDIS_URL: string;
      SESSION_SECRET: string;
      NODE_ENV: "development" | "production";
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
