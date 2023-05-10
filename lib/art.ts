import wretch from 'wretch';
import config from '../config'
import { logger } from './logger'


interface TokenResponse {
  code: number;
  data: {
    token: string;
  };
}

interface TextToImageResponse {
  code: number;
  data: string;
  nsfw: string;
}

async function getToken(apiKey: string): Promise<string> {
  const querystring = {
    apikey: apiKey,
  };

  const headers = {
    Accept: 'application/json',
  };

  try {
    const response: TokenResponse = await wretch(config.sdBaseURL).url("/auth/getToken")
      .query(querystring)
      .headers(headers)
      .get()
      .json();

    return response.data.token;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function getTextToImage(token: string, payload: object): Promise<string> {

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    token,
  };

  try {
    const response: TextToImageResponse = await wretch(config.sdBaseURL).url("/v1/text2img")
      .headers(headers)
      .post(payload)
      .json();

    return response.data;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function getImage(prompts: string[]): Promise<string> {
  const apiKey = config.sdApiKey;
  const token = await getToken(apiKey);

  const payload = {
    prompt: prompts[0],
    guidance_scale: 7.5,
    height: 512,
    negative_prompts: prompts[2],
    sampler: 'ddim',
    seed: 1024,
    steps: 50,
    style: prompts[3],
    upsample: 1,
    width: 512,
  };

  const response = await getTextToImage(token, payload);
  logger.info(response);
  return response;
}
