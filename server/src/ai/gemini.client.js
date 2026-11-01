import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

const transientStatuses = new Set([408, 429, 500, 502, 503, 504]);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getHttpStatus(error) {
  const direct = Number(error?.status ?? error?.statusCode ?? error?.response?.status);
  if (Number.isFinite(direct) && direct > 0) return direct;
  try { return Number(JSON.parse(error?.message ?? '{}')?.error?.code) || null; } catch { return null; }
}

function isTransient(error) {
  return error?.code === 'GENERATION_TIMEOUT' || transientStatuses.has(getHttpStatus(error));
}

function providerError(error) {
  const status = getHttpStatus(error);
  if ([400, 401, 403, 404].includes(status)) {
    return Object.assign(new Error(`Gemini rejected the request (HTTP ${status}).`), { code: 'GEMINI_CONFIGURATION_ERROR', cause: error });
  }
  return error;
}

async function callModel(client, model, prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.generationTimeoutMs);
  const config = {
    responseMimeType: 'application/json',
    maxOutputTokens: 9000,
    httpOptions: { timeout: env.generationTimeoutMs },
    abortSignal: controller.signal,
  };
  if (/^gemini-3(?:\.|-|$)/i.test(model)) config.thinkingConfig = { thinkingLevel: 'low' };
  try {
    const response = await client.models.generateContent({ model, contents: prompt, config });
    const raw = response.text;
    if (!raw) throw new Error('The AI provider returned an empty response.');
    try { return JSON.parse(raw); }
    catch (error) { throw Object.assign(new Error('Gemini returned malformed JSON.'), { code: 'GEMINI_INVALID_RESPONSE', cause: error }); }
  } catch (error) {
    if (controller.signal.aborted || error.name === 'RequestTimeoutError' || error.name === 'AbortError') {
      throw Object.assign(new Error(`Gemini model ${model} exceeded the ${Math.ceil(env.generationTimeoutMs / 1000)} second request deadline.`), { code: 'GENERATION_TIMEOUT' });
    }
    throw error;
  } finally { clearTimeout(timeout); }
}

export async function generateBlueprint(prompt, stage = 'generation') {
  if (!env.geminiKey) throw new Error('Gemini is not configured.');
  const client = new GoogleGenAI({ apiKey: env.geminiKey });
  const attempts = Math.max(1, env.maxRetries + 1);
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await callModel(client, env.geminiModel, prompt);
    } catch (error) {
      lastError = error;
      const status = getHttpStatus(error);
      // Gateway deadlines almost never improve by repeating the same request.
      // Move to the configured fallback immediately instead of leaving players
      // on one generation stage through several long retries.
      if (status === 408 || status === 504 || error.code === 'GENERATION_TIMEOUT') break;
      if (!isTransient(error) || attempt === attempts - 1) break;
      const waitMs = Math.min(8000, 1000 * (2 ** attempt)) + Math.floor(Math.random() * 350);
      console.warn(`Gemini ${stage}: ${env.geminiModel} returned HTTP ${getHttpStatus(error) ?? 'timeout'}; retrying in ${waitMs}ms (${attempt + 1}/${attempts - 1}).`);
      await delay(waitMs);
    }
  }

  if (isTransient(lastError) && env.geminiFallbackModel && env.geminiFallbackModel !== env.geminiModel) {
    console.warn(`Gemini ${stage}: primary model unavailable; trying configured fallback ${env.geminiFallbackModel}.`);
    try { return await callModel(client, env.geminiFallbackModel, prompt); }
    catch (fallbackError) {
      if (isTransient(fallbackError)) {
        throw Object.assign(new Error(`Gemini models ${env.geminiModel} and ${env.geminiFallbackModel} are temporarily unavailable.`), { code: 'GEMINI_TEMPORARY_UNAVAILABLE' });
      }
      throw providerError(fallbackError);
    }
  }
  if (isTransient(lastError)) {
    throw Object.assign(new Error(`Gemini model ${env.geminiModel} is temporarily unavailable.`), { code: 'GEMINI_TEMPORARY_UNAVAILABLE' });
  }
  throw providerError(lastError);
}
