import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  simulateReadableStream,
} from 'ai';
// import { MockLanguageModelV2 } from 'ai/test';
import { xai } from '@ai-sdk/xai';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': {
          doGenerate: async (params) => {
            // Extract message text from prompt array
            let chatInput = 'Mensagem de teste';
            if (params.prompt && params.prompt.length > 0) {
              const lastMessage = params.prompt[params.prompt.length - 1];
              if (lastMessage.content && Array.isArray(lastMessage.content)) {
                chatInput = lastMessage.content
                  .filter(part => part.type === 'text')
                  .map(part => part.text)
                  .join(' ');
              } else if (lastMessage.content) {
                chatInput = lastMessage.content;
              }
            }
            
            // Call external webhook directly
            const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://mpawebhook.mltcorp.tec.br/webhook/v1/mpagro/prod/agente';
            
            // Prepare payload for external webhook
            const webhookPayload = {
              mensagem: {
                texto: chatInput.trim()
              },
              usuario: {
                id: 'chat-user',
                nome: 'Chat User',
                telefone: ''
              }
            };

            const webhookResponse = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(webhookPayload),
              signal: AbortSignal.timeout(30000), // 30 seconds timeout
            });
            
            if (!webhookResponse.ok) {
              throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
            }
            
            const data = await webhookResponse.json();
            const text = data.output || data.mensagem || data.response || 'Resposta do webhook';
            
            return {
              rawCall: { rawPrompt: null, rawSettings: {} },
              finishReason: 'stop',
              usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
              content: [{ type: 'text', text }],
              warnings: [],
            };
          },
          doStream: async (params) => {
            // Extract message text from prompt array
            let chatInput = 'Mensagem de teste';
            if (params.prompt && params.prompt.length > 0) {
              const lastMessage = params.prompt[params.prompt.length - 1];
              if (lastMessage.content && Array.isArray(lastMessage.content)) {
                chatInput = lastMessage.content
                  .filter(part => part.type === 'text')
                  .map(part => part.text)
                  .join(' ');
              } else if (lastMessage.content) {
                chatInput = lastMessage.content;
              }
            }
            
            // Call external webhook directly
            const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://mpawebhook.mltcorp.tec.br/webhook/v1/mpagro/prod/agente';
            
            // Prepare payload for external webhook
            const webhookPayload = {
              mensagem: {
                texto: chatInput.trim()
              },
              usuario: {
                id: 'chat-user-stream',
                nome: 'Chat User',
                telefone: ''
              }
            };

            const webhookResponse = await fetch(webhookUrl, {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(webhookPayload),
              signal: AbortSignal.timeout(30000), // 30 seconds timeout
            });
            
            if (!webhookResponse.ok) {
              throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
            }
            
            const data = await webhookResponse.json();
            const text = data.output || data.mensagem || data.response || 'Resposta do webhook';
            
            return {
              stream: simulateReadableStream({
                chunkDelayInMs: 50,
                initialDelayInMs: 100,
                chunks: [
                  { id: '1', type: 'text-start' },
                  { id: '1', type: 'text-delta', delta: text },
                  { id: '1', type: 'text-end' },
                  {
                    type: 'finish',
                    finishReason: 'stop',
                    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
                  },
                ],
              }),
              rawCall: { rawPrompt: null, rawSettings: {} },
            };
          },
        },
        'chat-model-reasoning': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),
      },
      imageModels: {
        'small-model': xai.imageModel('grok-2-image'),
      },
    });
