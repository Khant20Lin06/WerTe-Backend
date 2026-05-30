import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  APP_NAME: Joi.string().trim().default('food-delivery-backend'),
  APP_HOST: Joi.string().trim().default('0.0.0.0'),
  APP_PORT: Joi.number().default(3000),
  APP_PREFIX: Joi.string()
    .trim()
    .pattern(/^[a-z0-9-_/]+$/)
    .default('api/v1'),
  APP_CORS_ORIGINS: Joi.string().allow('').default(''),
  SWAGGER_ENABLED: Joi.boolean().default(true),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  DB_ENABLE_QUERY_LOGS: Joi.boolean().default(false),
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).required(),
  REDIS_KEY_PREFIX: Joi.string().trim().default('food-delivery'),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().trim().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().trim().default('30d'),
  JWT_ISSUER: Joi.string().trim().default('food-delivery-backend'),
  JWT_AUDIENCE: Joi.string().trim().default('food-delivery-platform'),
  S3_BUCKET: Joi.string().trim().default('food-delivery-assets'),
  S3_REGION: Joi.string().trim().default('ap-southeast-1'),
  FCM_PROJECT_ID: Joi.string().trim().default('sample-project'),
  PROVIDER_WEBHOOK_SIGNING_SECRET: Joi.string().allow('').optional(),
  PAYMENT_WEBHOOK_SIGNING_SECRET: Joi.string().allow('').optional(),
  REFUND_WEBHOOK_SIGNING_SECRET: Joi.string().allow('').optional(),
  STRIPE_WEBHOOK_SIGNING_SECRET: Joi.string().allow('').optional(),
  STRIPE_PAYMENT_WEBHOOK_SIGNING_SECRET: Joi.string().allow('').optional(),
  STRIPE_REFUND_WEBHOOK_SIGNING_SECRET: Joi.string().allow('').optional(),
});
