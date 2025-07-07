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
  summary: z.string().describe("Un résumé en français des changements apportés au planning et les raisons de ces changements."),
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
  prompt: `Vous êtes un assistant de gestion de projet IA chargé d'optimiser les plannings de projet.

On vous donne le planning actuel du projet, qui consiste en une liste de tâches. Chaque tâche a un nom, une durée et une liste de prédécesseurs (tâches qui doivent être terminées avant que cette tâche puisse commencer).

Votre objectif est de ré-optimiser le planning pour minimiser la durée totale du projet et améliorer l'efficacité. Tenez compte des dépendances des tâches, de la parallélisation potentielle et de l'allocation des ressources.

Description du projet (si disponible) : {{{projectDescription}}}

Planning actuel :
{{#each tasks}}
  - Nom : {{name}}, Durée : {{duration}} jours, Prédécesseurs : {{predecessors}}
{{/each}}

Fournissez le planning optimisé dans le même format que l'entrée, y compris un résumé en français des changements apportés et des raisons de ces changements.

Planning Optimisé :
`,
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
