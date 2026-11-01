import 'dotenv/config';

const bool = (value) => value === 'true';
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI,
  geminiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite',
  geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-3.6-flash',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  sessionSecret: process.env.SESSION_TOKEN_SECRET,
  generationTimeoutMs: Number(process.env.CASE_GENERATION_TIMEOUT_MS ?? 120000),
  maxRetries: Number(process.env.MAX_GENERATION_RETRIES ?? 2),
  maxConcurrentJobs: Number(process.env.MAX_CONCURRENT_GENERATION_JOBS ?? 3),
  demoMode: bool(process.env.LOCAL_DEMO_MODE),
};

export function validateEnv() {
  if (env.demoMode) return;
  const missing = ['MONGODB_URI', 'GEMINI_API_KEY', 'SESSION_TOKEN_SECRET'].filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}. Set LOCAL_DEMO_MODE=true only for the local demo.`);
}
