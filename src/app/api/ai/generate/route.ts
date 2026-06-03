import { NextResponse } from 'next/server';
import { generateAIReport, GenerateRequest } from '@/lib/ai-generator';

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { title, packet_loss, latency, throughput } = body;

    // Validation
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { success: false, message: '实验名称不能为空' },
        { status: 400 }
      );
    }
    if (packet_loss === undefined || packet_loss === null || packet_loss < 0) {
      return NextResponse.json(
        { success: false, message: '丢包率非法' },
        { status: 400 }
      );
    }
    if (latency === undefined || latency === null || latency < 0) {
      return NextResponse.json(
        { success: false, message: '延迟非法' },
        { status: 400 }
      );
    }
    if (throughput === undefined || throughput === null || throughput < 0) {
      return NextResponse.json(
        { success: false, message: '吞吐量非法' },
        { status: 400 }
      );
    }

    const generated = await generateAIReport(body);
    return NextResponse.json(generated);
  } catch (error: any) {
    console.error('API /api/ai/generate error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'AI generation failed' },
      { status: 500 }
    );
  }
}
