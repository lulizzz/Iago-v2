import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getLessons, createLesson } from '@/lib/db/queries';
import { logApiCall } from '@/lib/middleware/logging';
import { logChatEvent, logError } from '@/lib/logger';

export async function GET() {
  logApiCall('/api/lessons', 'GET');
  
  try {
    const lessons = await getLessons();
    
    return NextResponse.json({
      lessons,
      success: true,
    });
  } catch (error) {
    logError(error as Error, {
      route: '/api/lessons',
      method: 'GET',
    });
    
    return NextResponse.json(
      {
        error: 'Failed to fetch lessons',
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logApiCall('/api/lessons', 'POST');
  
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          success: false,
        },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { module, title, link, content } = body;
    
    // Validation
    if (!module || !title || !link || !content) {
      return NextResponse.json(
        {
          error: 'All fields are required: module, title, link, content',
          success: false,
        },
        { status: 400 }
      );
    }
    
    // Validate URL
    try {
      new URL(link);
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid URL format for link',
          success: false,
        },
        { status: 400 }
      );
    }
    
    logChatEvent('creating_lesson', {
      userId: session.user.id,
      module: module.substring(0, 50) + '...',
      title: title.substring(0, 50) + '...',
    });
    
    // Save to database
    const [newLesson] = await createLesson({
      module,
      title,
      link,
      content,
      userId: session.user.id,
    });
    
    logChatEvent('lesson_created', {
      userId: session.user.id,
      lessonId: newLesson.id,
    });
    
    // Call webhook
    const webhookUrl = process.env.LESSONS_WEBHOOK_URL || 'https://mpawebhook.mltcorp.tec.br/webhook/new-lesson';
    
    logChatEvent('calling_new_lesson_webhook', {
      url: webhookUrl,
      lessonId: newLesson.id,
    });
    
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson: {
            id: newLesson.id,
            module,
            title,
            link,
            content,
            createdAt: newLesson.createdAt,
          },
        }),
        signal: AbortSignal.timeout(5000), // 5 seconds - Vercel timeout friendly
      });
      
      logChatEvent('webhook_response', {
        status: webhookResponse.status,
        lessonId: newLesson.id,
      });
      
      if (!webhookResponse.ok) {
        logError(new Error(`Webhook failed with status ${webhookResponse.status}`), {
          route: '/api/lessons',
          webhookUrl,
          lessonId: newLesson.id,
        });
      }
    } catch (webhookError) {
      logError(webhookError as Error, {
        route: '/api/lessons',
        webhookUrl,
        lessonId: newLesson.id,
        type: 'webhook_error',
      });
    }
    
    return NextResponse.json({
      lesson: newLesson,
      success: true,
      message: 'Lesson created successfully',
    });
    
  } catch (error) {
    logError(error as Error, {
      route: '/api/lessons',
      method: 'POST',
    });
    
    return NextResponse.json(
      {
        error: 'Failed to create lesson',
        success: false,
      },
      { status: 500 }
    );
  }
}