
'use server';
/**
 * @fileOverview A Genkit flow for analyzing code complexity and generating context-aware refactoring suggestions.
 *
 * - localCodeRefactoring - A function that handles the code refactoring suggestion process.
 * - LocalCodeRefactoringInput - The input type for the localCodeRefactoring function.
 * - LocalCodeRefactoringOutput - The return type for the localCodeRefactoring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the localCodeRefactoring flow.
 * @property {string} code - The code snippet or file content to be analyzed for refactoring suggestions.
 * @property {string} [language] - The programming language of the code (e.g., "typescript", "javascript", "python").
 * @property {any} [style] - Optional detected style rules to maintain alignment with the repository.
 */
const LocalCodeRefactoringInputSchema = z.object({
  code: z.string().describe('The code snippet or file content to be analyzed for refactoring suggestions.'),
  language: z.string().optional().describe('The programming language of the code (e.g., "typescript", "javascript", "python").'),
  style: z.any().optional().describe('The detected code style to maintain during refactoring.'),
});
export type LocalCodeRefactoringInput = z.infer<typeof LocalCodeRefactoringInputSchema>;

/**
 * Output schema for the localCodeRefactoring flow.
 * @property {string} refactoredCode - The completely refactored version of the input code.
 * @property {string[]} suggestions - A list of specific, actionable refactoring suggestions.
 * @property {string} complexityAnalysis - A brief analysis of the code's complexity.
 */
const LocalCodeRefactoringOutputSchema = z.object({
  refactoredCode: z.string().describe('The completely refactored version of the input code, if applicable. If no full refactoring is provided, this field might be empty or the original code.'),
  suggestions: z.array(z.string()).describe('A list of specific, actionable refactoring suggestions to improve code quality, maintainability, or reduce complexity.'),
  complexityAnalysis: z.string().describe('A brief analysis of the code\'s complexity.'),
});
export type LocalCodeRefactoringOutput = z.infer<typeof LocalCodeRefactoringOutputSchema>;

/**
 * Analyzes code and generates context-aware refactoring suggestions.
 * @param {LocalCodeRefactoringInput} input - The input containing the code to be analyzed and its language.
 * @returns {Promise<LocalCodeRefactoringOutput>} A promise that resolves to the refactoring suggestions and analysis.
 */
export async function localCodeRefactoring(input: LocalCodeRefactoringInput): Promise<LocalCodeRefactoringOutput> {
  return localCodeRefactoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'localCodeRefactoringPrompt',
  input: {schema: LocalCodeRefactoringInputSchema},
  output: {schema: LocalCodeRefactoringOutputSchema},
  prompt: `You are the CaramelPepper 🌶️ expert code refactoring assistant, specializing in improving code quality, maintainability, and reducing complexity.

### CRITICAL CONSTRAINT: VERTICAL PACING ###
You are a strict code formatter. You MUST preserve 100% of the original vertical spacing.
- If the original code has an empty line between two logical blocks, your output MUST have an empty line in the exact same place.
- Do not compress or minify the code.
- Maintain the exact original paragraphing of the source code.
- Failure to preserve original blank lines is a critical failure.

### STYLE ALIGNMENT ###
{{#if style}}
Maintain the following detected code style rules for this repository:
- Naming Convention: {{{style.namingConvention}}}
- Indentation: {{{style.indentation}}}
- Brace Style: {{{style.braceStyle}}}
- Quote Style: {{{style.quoteStyle}}}
{{else}}
Use standard industry best practices for the language.
{{/if}}

Your goal is to analyze the provided code and offer context-aware, privacy-preserving refactoring suggestions.
Focus on identifying areas of high complexity, potential bugs, readability issues, and suggesting improvements while adhering to good coding practices.
Provide the \`refactoredCode\`, detailed \`suggestions\`, and a brief \`complexityAnalysis\`.

Consider the following code written in {{#if language}}{{language}}{{else}}an unspecified language{{/if}}:

\`\`\`{{#if language}}{{language}}{{/if}}
{{{code}}}
\`\`\`

Please provide your analysis and refactoring output in the following JSON format:
\`\`\`json
{
  "refactoredCode": "...",
  "suggestions": [
    "...",
    "..."
  ],
  "complexityAnalysis": "..."
}
\`\`\`
`,
});

const localCodeRefactoringFlow = ai.defineFlow(
  {
    name: 'localCodeRefactoringFlow',
    inputSchema: LocalCodeRefactoringInputSchema,
    outputSchema: LocalCodeRefactoringOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
