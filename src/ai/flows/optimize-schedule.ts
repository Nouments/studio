'use server';

/**
 * @fileOverview This file defines a Genkit flow for optimizing a task schedule using AI.
 *
 * - optimizeSchedule - An asynchronous function that takes the current schedule as input and returns an optimized schedule.
 * - OptimizeScheduleInput - The input type for the optimizeSchedule function, representing the current task schedule.
 * - OptimizeScheduleOutput - The output type for the optimizeSchedule function, representing the AI-optimized task schedule.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for a single task
const TaskSchema = z.object({
  name: z.string().describe('The name of the task.'),
  duration: z.number().describe('The duration of the task in days.'),
  predecessors: z.array(z.string()).describe('An array of task names that must be completed before this task can start.'),
});

// Define the input schema for the optimizeSchedule function
const OptimizeScheduleInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('An array of tasks representing the current project schedule.'),
  projectDescription: z.string().optional().describe('Optional project description for better optimization.'),
});
export type OptimizeScheduleInput = z.infer<typeof OptimizeScheduleInputSchema>;

// Define the output schema for the optimizeSchedule function
const OptimizeScheduleOutputSchema = z.object({
  optimizedTasks: z.array(TaskSchema).describe('An array of tasks representing the AI-optimized project schedule.'),
  summary: z.string().describe('A summary of the changes made to the schedule and the reasons for those changes.'),
});
export type OptimizeScheduleOutput = z.infer<typeof OptimizeScheduleOutputSchema>;

// Exported function to call the flow
export async function optimizeSchedule(input: OptimizeScheduleInput): Promise<OptimizeScheduleOutput> {
  return optimizeScheduleFlow(input);
}

// Define the prompt for the AI to optimize the schedule
const optimizeSchedulePrompt = ai.definePrompt({
  name: 'optimizeSchedulePrompt',
  input: {schema: OptimizeScheduleInputSchema},
  output: {schema: OptimizeScheduleOutputSchema},
  prompt: `You are an AI project management assistant tasked with optimizing project schedules.

You are given the current project schedule, which consists of a list of tasks. Each task has a name, duration, and a list of predecessors (tasks that must be completed before it can start).

Your goal is to re-optimize the schedule to minimize the overall project duration and improve efficiency. Consider task dependencies, potential parallelization, and resource allocation.

Project Description (if available): {{{projectDescription}}}

Current Schedule:
{{#each tasks}}
  - Name: {{name}}, Duration: {{duration}} days, Predecessors: {{predecessors}}
{{/each}}

Provide the optimized schedule in the same format as the input, including a summary of the changes made and the reasons for those changes.

Optimized Schedule:
`, // The AI will generate the optimized schedule in the format defined by OptimizeScheduleOutputSchema
});

// Define the Genkit flow for optimizing the schedule
const optimizeScheduleFlow = ai.defineFlow(
  {
    name: 'optimizeScheduleFlow',
    inputSchema: OptimizeScheduleInputSchema,
    outputSchema: OptimizeScheduleOutputSchema,
  },
  async input => {
    const {output} = await optimizeSchedulePrompt(input);
    return output!;
  }
);
