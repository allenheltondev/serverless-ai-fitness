const { Configuration, OpenAIApi } = require('openai');
const { CacheGet } = require('@gomomento/sdk');
const shared = require('/opt/nodejs/index');

let openai;

exports.handler = async (state) => {
  const momento = await shared.getCacheClient();

  const cachedQuery = await momento.get(shared.CACHE_NAME, state.prompt.toLowerCase());
  if (cachedQuery instanceof CacheGet.Hit) {
    return { result: cachedQuery.valueString() };
  }
  await configureOpenAIClient();

  const result = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: state.prompt,
    max_tokens: state.maxTokens ?? process.env.MAX_TOKENS,
    temperature: state.temperature ?? process.env.DEFAULT_TEMPERATURE
  });

  const chatGPTAnswer = result.data.choices[0].text;
  await momento.set(shared.CACHE_NAME, state.prompt.toLowerCase(), chatGPTAnswer);

  return { result: chatGPTAnswer };
};

const configureOpenAIClient = async () => {
  if (openai) return;

  const apiKey = await shared.getSecret('openai');
  const config = new Configuration({ apiKey: apiKey });
  openai = new OpenAIApi(config);
};