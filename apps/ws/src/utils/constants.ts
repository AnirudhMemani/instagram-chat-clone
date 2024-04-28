export const env = {
    PORT: process.env.WS_PORT || 8080,
    JWT_SECRET: process.env.JWT_SECRET || "FallbackJWTSecretForNow",
} as const;
