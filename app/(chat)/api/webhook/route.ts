import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { logApiCall } from '@/lib/middleware/logging';
import { logChatEvent, logError } from '@/lib/logger';

// Schema for webhook payload
interface WebhookPayload {
  mensagem: {
    texto: string;
  };
  usuario: {
    id: string;
    nome: string;
    telefone: string;
  };
}

// Schema for incoming request (matching chat API)
interface WebhookRequest {
  chatInput: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  logApiCall('/api/webhook', 'POST');

  try {
    // Get request body
    const body: WebhookRequest = await request.json();
    
    if (!body.chatInput || body.chatInput.trim() === '') {
      return NextResponse.json(
        { error: 'chatInput is required', success: false },
        { status: 400 }
      );
    }

    // Get user session for context
    const session = await auth();
    const userId = body.userId || session?.user?.id || 'guest';
    const userName = body.userName || session?.user?.name || 'Usuário';
    const userPhone = body.userPhone || ''; // Optional

    logChatEvent('webhook_request', {
      userId,
      userName,
      messageLength: body.chatInput.length,
    });

    // Prepare payload for external webhook
    const webhookPayload: WebhookPayload = {
      mensagem: {
        texto: body.chatInput.trim()
      },
      usuario: {
        id: userId,
        nome: userName,
        telefone: userPhone
      }
    };

    // Call external webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://mpawebhook.mltcorp.tec.br/webhook/v1/mpagro/prod/agente';
    
    logChatEvent('calling_external_webhook', {
      url: webhookUrl,
      userId,
      payloadSize: JSON.stringify(webhookPayload).length
    });

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
    }

    const responseData = await webhookResponse.json();
    
    logChatEvent('webhook_response_received', {
      userId,
      responseStatus: webhookResponse.status,
      hasOutput: !!responseData.output
    });

    // Return the response from external webhook
    // Ensure we always return expected format
    const output = responseData.output || responseData.mensagem || responseData.response || 'Resposta recebida';
    
    const responseTime = Date.now() - startTime;
    logChatEvent('webhook_completed', {
      userId,
      responseTime: `${responseTime}ms`,
      outputLength: output.length
    });

    return NextResponse.json({
      output,
      success: true,
      responseTime: `${responseTime}ms`
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logError(error as Error, {
      route: '/api/webhook',
      method: 'POST',
      responseTime: `${responseTime}ms`,
      type: 'webhook_error'
    });

    // Always return a valid response, even on error
    return NextResponse.json({
      output: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`
    }, { status: 200 }); // Return 200 to avoid client errors
  }
}