import { env, isOpenAiConfigured } from '../config/env';
import { AppError } from '../utils/errors';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface DescriptionAssistantResult {
  description: string;
  source: 'openai' | 'fallback';
}

export interface TaskInsightResult {
  priority: TaskPriority;
  isOverdue: boolean;
  isRisky: boolean;
  summary: string;
  source: 'openai' | 'fallback';
}

const callOpenAi = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openAiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openAiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AppError(502, `OpenAI request failed: ${body}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new AppError(502, 'OpenAI returned an empty response');
  }

  return content;
};

export const buildFallbackDescription = (title: string, roughDescription?: string): string => {
  const base = roughDescription?.trim() || title.trim();
  return [
    `Objective: ${base}`,
    'Steps:',
    '1. Clarify scope and acceptance criteria',
    '2. Execute the main work items',
    '3. Validate results and document outcomes',
  ].join('\n');
};

const parsePriority = (value: string): TaskPriority => {
  const normalized = value.toLowerCase();
  if (normalized.includes('high')) return 'high';
  if (normalized.includes('low')) return 'low';
  return 'medium';
};

const buildFallbackInsights = (
  description: string,
  finishDate?: string | null
): Omit<TaskInsightResult, 'source'> => {
  const now = new Date();
  const due = finishDate ? new Date(finishDate) : null;
  const isOverdue = due ? due < now : false;
  const daysUntilDue = due
    ? Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  let priority: TaskPriority = 'medium';
  if (isOverdue || (daysUntilDue !== null && daysUntilDue <= 1)) {
    priority = 'high';
  } else if (daysUntilDue !== null && daysUntilDue >= 7) {
    priority = 'low';
  }

  const isRisky = isOverdue || description.toLowerCase().includes('urgent');

  const summary = isOverdue
    ? 'This task appears overdue and may need immediate attention.'
    : isRisky
      ? 'This task may be risky due to urgency signals in the description or timeline.'
      : 'This task looks manageable based on the current timeline.';

  return { priority, isOverdue, isRisky, summary };
};

export const improveTaskDescription = async (
  title: string,
  roughDescription?: string
): Promise<DescriptionAssistantResult> => {
  const trimmedTitle = title?.trim();
  if (!trimmedTitle) {
    throw new AppError(400, 'Title is required');
  }

  if (!isOpenAiConfigured()) {
    return {
      description: buildFallbackDescription(trimmedTitle, roughDescription),
      source: 'fallback',
    };
  }

  try {
    const content = await callOpenAi(
      'You help users write clear task descriptions for a task manager. Respond with only the improved description text, no markdown fences.',
      roughDescription?.trim()
        ? `Title: ${trimmedTitle}\nRough description: ${roughDescription.trim()}\nImprove this into a concise actionable task description.`
        : `Title: ${trimmedTitle}\nGenerate a concise actionable task description.`
    );

    return { description: content, source: 'openai' };
  } catch {
    return {
      description: buildFallbackDescription(trimmedTitle, roughDescription),
      source: 'fallback',
    };
  }
};

export const getTaskInsights = async (
  description: string,
  finishDate?: string | null
): Promise<TaskInsightResult> => {
  const trimmed = description?.trim();
  if (!trimmed) {
    throw new AppError(400, 'Description is required');
  }

  if (!isOpenAiConfigured()) {
    return { ...buildFallbackInsights(trimmed, finishDate), source: 'fallback' };
  }

  try {
    const content = await callOpenAi(
      'You analyze tasks for a task manager. Reply in JSON only with keys: priority (low|medium|high), isOverdue (boolean), isRisky (boolean), summary (string).',
      `Task description: ${trimmed}\nFinish date (ISO or empty): ${finishDate ?? ''}\nCurrent date: ${new Date().toISOString()}`
    );

    const parsed = JSON.parse(content) as {
      priority?: string;
      isOverdue?: boolean;
      isRisky?: boolean;
      summary?: string;
    };

    return {
      priority: parsePriority(parsed.priority ?? 'medium'),
      isOverdue: Boolean(parsed.isOverdue),
      isRisky: Boolean(parsed.isRisky),
      summary: parsed.summary ?? 'AI insight generated for this task.',
      source: 'openai',
    };
  } catch {
    return { ...buildFallbackInsights(trimmed, finishDate), source: 'fallback' };
  }
};
