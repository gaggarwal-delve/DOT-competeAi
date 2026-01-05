import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let summary = '';

    if (type === 'trial') {
      summary = await summarizeTrial(data);
    } else if (type === 'company') {
      summary = await summarizeCompany(data);
    } else if (type === 'news') {
      summary = await summarizeNews(data);
    } else {
      return NextResponse.json(
        { error: 'Invalid summary type. Must be "trial", "company", or "news"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('AI summarization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

async function summarizeTrial(trial: any): Promise<string> {
  const prompt = `Summarize this clinical trial in 3 concise bullet points:

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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Faster and cheaper than gpt-4
    messages: [
      {
        role: 'system',
        content: 'You are a pharmaceutical intelligence analyst. Provide clear, concise summaries of clinical trials for industry professionals.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3, // Lower temperature for more factual output
    max_tokens: 200,
  });

  return response.choices[0].message.content || 'Summary generation failed';
}

async function summarizeCompany(company: any): Promise<string> {
  const prompt = `Summarize this pharmaceutical company in 3 concise bullet points:

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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a pharmaceutical intelligence analyst. Provide clear, concise company profiles for industry professionals.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  return response.choices[0].message.content || 'Summary generation failed';
}

async function summarizeNews(article: any): Promise<string> {
  const prompt = `Summarize this pharmaceutical news article in 2 concise bullet points:

Title: ${article.title}
Source: ${article.source || 'Unknown'}
Description: ${article.description || 'No description available'}

Focus on:
1. Key development or announcement
2. Business or clinical significance

Keep each bullet point under 25 words. Focus on actionable insights.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a pharmaceutical intelligence analyst. Provide clear, concise news summaries for industry professionals.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 150,
  });

  return response.choices[0].message.content || 'Summary generation failed';
}

