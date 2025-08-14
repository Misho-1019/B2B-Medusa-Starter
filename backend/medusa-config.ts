// backend/medusa-config.ts
import { QUOTE_MODULE } from "./src/modules/quote"
import { APPROVAL_MODULE } from "./src/modules/approval"
import { COMPANY_MODULE } from "./src/modules/company"
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV!, process.cwd())

const isProd = process.env.NODE_ENV === "production"

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: {
    [COMPANY_MODULE]: { resolve: "./modules/company" },
    [QUOTE_MODULE]: { resolve: "./modules/quote" },
    [APPROVAL_MODULE]: { resolve: "./modules/approval" },

    // Cache
    ...(isProd
      ? {
          [Modules.CACHE]: {
            resolve: "@medusajs/medusa/cache-redis",
            options: { redisUrl: process.env.REDIS_URL },
          },
        }
      : {
          [Modules.CACHE]: {
            resolve: "@medusajs/medusa/cache-inmemory",
          },
        }),

    // Workflow engine
    ...(isProd
      ? {
          [Modules.WORKFLOW_ENGINE]: {
            resolve: "@medusajs/medusa/workflow-engine-redis",
            options: { redis: { url: process.env.REDIS_URL } },
          },
        }
      : {
          [Modules.WORKFLOW_ENGINE]: {
            resolve: "@medusajs/medusa/workflow-engine-inmemory",
          },
        }),

    // File storage (S3/MinIO)
    ...(isProd
      ? {
          [Modules.FILE]: {
            resolve: "@medusajs/medusa/file",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/file-s3",
                  id: "s3",
                  options: {
                    file_url: process.env.S3_FILE_URL,
                    access_key_id: process.env.S3_ACCESS_KEY_ID,
                    secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                    region: process.env.S3_REGION || "us-east-1",
                    bucket: process.env.S3_BUCKET,
                    endpoint: process.env.S3_ENDPOINT,
                    additional_client_config: {
                      forcePathStyle:
                        process.env.S3_FORCE_PATH_STYLE === "true",
                    },
                  },
                },
              ],
            },
          },
        }
      : {}),

    // Search (MeiliSearch)
    ...(isProd
      ? {
          ["search"]: {
            resolve: "@medusajs/medusa/search-meilisearch",
            options: {
              host: process.env.MEILI_HOST,
              api_key: process.env.MEILI_MASTER_KEY,
            },
          },
        }
      : {}),
  },
})
