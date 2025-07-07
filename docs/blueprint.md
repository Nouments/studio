# **App Name**: Task Scheduler Pro

## Core Features:

- Task Data Input: Interactive table inputs for task details: name, duration, predecessors; updates successors dynamically in a read-only column.
- AI Schedule Optimizer: AI tool assists in re-optimizing the schedule for the project using current schedule as its context, whenever user requests a re-optimization.
- Earliest Date Calculation: Clickable, one-at-a-time earliest date calculation, with each click processing the next task in sequence based on predecessor completion. Tasks displayed with calculated 'early start' and 'early finish' dates in a new set of read-only columns.
- Latest Date Calculation: Clickable, one-at-a-time latest date calculation, running tasks in reverse sequence. Populates 'latest start' and 'latest finish' columns in table.
- Float Time Display: Column indicating float (slack) time for each task, indicating scheduling flexibility.
- Critical Path Highlighting: Highlight critical path through tasks with zero float; tasks displayed visually distinct in the table.

## Style Guidelines:

- Primary color: Saturated purple (#9400D3), embodying innovation and precision.
- Background color: Light purple (#F2E7FF), to ensure focus on the data.
- Accent color: Teal (#008080), for emphasis on interactive elements.
- Body and headline font: 'Inter' (sans-serif) for a modern and readable user interface.
- Simple, geometric icons for task types and controls.
- Full-screen layout: interactive data table taking up the entire screen.
- Subtle transitions when updating table data; progress indicators for calculations.