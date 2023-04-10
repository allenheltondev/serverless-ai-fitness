const { Configuration, OpenAIApi } = require('openai');
const { CacheListFetch } = require('@gomomento/sdk');
const shared = require('/opt/nodejs/index');

let cacheClient;
let openai;

exports.handler = async (state) => {
  let messages = [];
  await initialize();

  if (state.conversationKey) {
    const previousMessageResponse = await cacheClient.listFetch('chatgpt', state.conversationKey);
    if (previousMessageResponse instanceof CacheListFetch.Hit) {
      messages = previousMessageResponse.valueListString().map(m => JSON.parse(m));
    }
  }

  if (state.systemContext) {
    messages.push({ role: 'system', content: state.systemContext });
  }

  const newMessage = { role: 'user', content: state.query };
  messages.push(newMessage);

  const result = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    max_tokens: 1500,
    temperature: .7,
    messages: messages
  });

  if (state.conversationKey && state.rememberResponse) {
    await cacheClient.listConcatenateBack('chatgpt', state.conversationKey, [JSON.stringify(newMessage), JSON.stringify(result.data.choices[0].message)]);
  }

  let response = result.data.choices[0].message.content;
  if (state.trimResponse) {
    const pieces = response.split('\n\n');

    if (pieces.length > 2) {
      const removedText = pieces.slice(1, pieces.length - 2);
      response = removedText.join('\n\n');
    }
  } else if (state.trimFront) {
    const pieces = response.split('\n\n');
    if (pieces.length > 2) {
      const removedText = pieces.slice(1);
      response = removedText.join('\n\n');
    }
  }

  return { response };
}

const setupCacheClient = async () => {
  if (!cacheClient) {
    cacheClient = await shared.getCacheClient(['chatgpt']);
  }
};

const setupOpenAI = async () => {
  if (!openai) {
    const authToken = await shared.getSecret('openai');
    openai = new OpenAIApi(new Configuration({ apiKey: authToken }));
  }
};

const initialize = async () => {
  await setupCacheClient();
  await setupOpenAI();
};