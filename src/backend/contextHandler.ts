import { Request, Response } from 'express';
import { MetadataMode } from 'llamaindex';
import { getDataSource } from './engine';
import { extractText } from '@llamaindex/core/utils';
import {
  PromptTemplate,
  type ContextSystemPrompt,
} from '@llamaindex/core/prompts';
import { createMessageContent } from '@llamaindex/core/response-synthesizers';
import { initSettings } from './engine/settings';

initSettings();

export const contextHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.query;
    if (typeof query !== 'string' || query.trim() === '') {
      console.log('[context] Invalid query parameter');
      res.status(400).json({
        message: "A valid 'query' string parameter is required in the URL",
      });
      return;
    }

    console.log(`[context] Processing query: "${query}"`);

    const index = await getDataSource();
    if (!index) {
      throw new Error(
        `StorageContext is empty - run 'npm run generate' to create the storage first`,
      );
    }

    const retriever = index.asRetriever();
    const nodes = await retriever.retrieve({ query });
    console.log(`[context] Retrieved ${nodes.length} nodes`);

    const prompt: ContextSystemPrompt = new PromptTemplate({
      templateVars: ['context'],
      template: `You are a customer service agent for Futeur AI, giving friendly, conversational, to-the-point answers to users' questions about the product. Use the following context to improve your answer:
---------------------
{context}
---------------------`,
    });

    const content = await createMessageContent(
      prompt as any,
      nodes.map((r) => r.node),
      undefined,
      MetadataMode.LLM,
    );

    res.status(200).json({ message: extractText(content) });
  } catch (error) {
    console.error('[context] Error:', error);
    res.status(500).json({
      message: (error as Error).message,
    });
  }
};
