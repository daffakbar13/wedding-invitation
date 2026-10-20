// Environment settings. Read once at start-up; a missing required value stops the server.

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name} (see .env.example)`);
  return value;
}

export type Config = {
  port: number;
  mongoUri: string;
  dbName: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  googleClientId: string | undefined;
  corsOrigins: string[];
};

export function loadConfig(): Config {
  return {
    port: Number(process.env.PORT ?? 4000),
    mongoUri: required('MONGODB_URI'),
    dbName: process.env.MONGODB_DB ?? 'wedding_invitation',
    jwtSecret: required('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    googleClientId: process.env.GOOGLE_CLIENT_ID || undefined,
    corsOrigins: (process.env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  };
}
