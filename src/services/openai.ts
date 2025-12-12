import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.client = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });
    }
  }

  async generateDialogue(
    role: string,
    persona: string,
    context: string[],
    previousLines: string[] = []
  ): Promise<string> {
    if (!this.client) {
      return this.generateMockDialogue(role, previousLines);
    }

    const systemPrompt = `You are the ${role} in a courtroom simulation.
Your persona: ${persona}
Maintain courtroom decorum and professionalism.
Respond concisely and stay in character.
Wait your turn to speak.`;

    const conversationContext = previousLines.length > 0
      ? `\n\nPrevious dialogue:\n${previousLines.join('\n')}\n\nYour response:`
      : '\n\nBegin your statement:';

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context.join('\n') + conversationContext },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content?.trim() || this.generateMockDialogue(role, previousLines);
    } catch (error) {
      console.error('Error generating dialogue:', error);
      return this.generateMockDialogue(role, previousLines);
    }
  }

  private generateMockDialogue(role: string, previousLines: string[]): string {
    const mockDialogues: Record<string, string[]> = {
      judge: [
        'Court is now in session.',
        'Please proceed with your statement.',
        'Objection sustained.',
        'The court will take a brief recess.',
      ],
      defense: [
        'Your honor, the defense is prepared to present our case.',
        'We object to this line of questioning.',
        'May I approach the bench?',
        'The defense rests, your honor.',
      ],
      jury: [
        'We acknowledge the proceedings.',
        'The jury has reached a verdict.',
        'We have deliberated carefully.',
        'We find the evidence compelling.',
      ],
    };

    const dialogues = mockDialogues[role] || ['I am ready to proceed.'];
    const index = previousLines.length % dialogues.length;
    return dialogues[index];
  }
}

export const openAIService = new OpenAIService();
