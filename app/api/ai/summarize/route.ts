import { NextRequest, NextResponse } from 'next/server';
import { generateAICompletion, AIProvider } from '@/lib/aiProviders';

export async function POST(request: NextRequest) {
  try {
    const { type, data, provider = 'openai' } = await request.json();

    let result;

    if (type === 'trial') {
      result = await summarizeTrial(data, provider as AIProvider);
    } else if (type === 'company') {
      result = await summarizeCompany(data, provider as AIProvider);
    } else if (type === 'news') {
      result = await summarizeNews(data, provider as AIProvider);
    } else {
      return NextResponse.json(
        { error: 'Invalid summary type. Must be "trial", "company", or "news"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      summary: result.content,
      provider: result.provider,
      model: result.model,
      tokensUsed: result.tokensUsed,
      estimatedCost: result.estimatedCost,
    });
  } catch (error: any) {
    console.error('AI summarization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

async function summarizeTrial(trial: any, provider: AIProvider) {
  const systemPrompt = 'You are a pharmaceutical intelligence analyst. Provide clear, concise summaries of clinical trials for industry professionals.';
  
  const userPrompt = `Summarize this clinical trial in 3 concise bullet points:

Title: ${trial.title}
Phase: ${trial.phase || 'Not specified'}
Status: ${trial.status || 'Unknown'}
Sponsor: ${trial.sponsor || 'Unknown'}
Condition: ${trial.conditions ? trial.conditions.join(', ') : 'Not specified'}
Study Type: ${trial.studyType || 'Not specified'}
Enrollment: ${trial.enrollmentCount ? `${trial.enrollmentCount} participants` : 'Not specified'}

Focus on:
1. Primary objective and target patient population
2. Key details about the intervention or treatment
3. Current status and significance

Keep each bullet point under 25 words. Be specific and actionable.`;

  return await generateAICompletion({
    provider,
    systemPrompt,
    userPrompt,
    temperature: 0.3,
    maxTokens: 200,
  });
}

async function summarizeCompany(company: any, provider: AIProvider) {
  const systemPrompt = 'You are a pharmaceutical intelligence analyst. Provide clear, concise company profiles for industry professionals.';
  
  const userPrompt = `Summarize this pharmaceutical company in 3 concise bullet points:

Company: ${company.name}
Headquarters: ${company.headquarters || 'Unknown'}
Therapy Areas: ${company.therapyAreas ? company.therapyAreas.join(', ') : 'Not specified'}
Type: ${company.type || 'Not specified'}
Active Trials: ${company.trialCount || 0}
Recent News: ${company.newsCount || 0}

Focus on:
1. Company's core focus and therapeutic areas
2. Pipeline strength and clinical activity
3. Notable characteristics or competitive position

Keep each bullet point under 25 words.`;

  return await generateAICompletion({
    provider,
    systemPrompt,
    userPrompt,
    temperature: 0.3,
    maxTokens: 200,
  });
}

async function summarizeNews(article: any, provider: AIProvider) {
  const systemPrompt = 'You are a pharmaceutical intelligence analyst. Provide clear, concise news summaries for industry professionals.';
  
  const userPrompt = `Summarize this pharmaceutical news article in 2 concise bullet points:

Title: ${article.title}
Source: ${article.source || 'Unknown'}
Description: ${article.description || 'No description available'}

Focus on:
1. Key development or announcement
2. Business or clinical significance

Keep each bullet point under 25 words. Focus on actionable insights.`;

  return await generateAICompletion({
    provider,
    systemPrompt,
    userPrompt,
    temperature: 0.3,
    maxTokens: 150,
  });
}

