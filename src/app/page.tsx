"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { optimizeSchedule } from "@/ai/flows/optimize-schedule";
import type { Task } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  BrainCircuit,
  Play,
  RotateCcw,
  Loader,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const INITIAL_TASKS: Task[] = [
  { id: '1', name: 'Plan Project', duration: 3, predecessors: '', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
  { id: '2', name: 'Design UI', duration: 4, predecessors: 'Plan Project', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
  { id: '3', name: 'Develop Backend', duration: 5, predecessors: 'Plan Project', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
  { id: '4', name: 'Develop Frontend', duration: 5, predecessors: 'Design UI', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
  { id: '5', name: 'Integrate Frontend/Backend', duration: 3, predecessors: 'Develop Backend, Develop Frontend', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
  { id: '6', name: 'Testing', duration: 4, predecessors: 'Integrate Frontend/Backend', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
  { id: '7', name: 'Deploy', duration: 2, predecessors: 'Testing', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
];

export default function Home() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [esStep, setEsStep] = useState(-1);
  const [lsStep, setLsStep] = useState(-1);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

  const taskNameMap = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.name] = task;
      return acc;
    }, {} as Record<string, Task>);
  }, [tasks]);

  const { sortedTasks, isCyclic } = useMemo(() => {
    const taskMap = new Map(tasks.map((task) => [task.id, { ...task, successorIds: new Set<string>() }]));
    const inDegree = new Map(tasks.map(task => [task.id, 0]));
    
    for (const task of tasks) {
      const predNames = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);
      for (const predName of predNames) {
        const predTask = taskNameMap[predName];
        if (predTask) {
          inDegree.set(task.id, (inDegree.get(task.id) ?? 0) + 1);
          taskMap.get(predTask.id)?.successorIds.add(task.id);
        }
      }
    }
    
    const queue = tasks.filter(task => inDegree.get(task.id) === 0);
    const sorted: Task[] = [];
    
    while (queue.length > 0) {
      const currentTask = queue.shift()!;
      sorted.push(tasks.find(t => t.id === currentTask.id)!);

      const currentTaskInMap = taskMap.get(currentTask.id);
      if (currentTaskInMap) {
        const successors = tasks.filter(t => t.predecessors.split(',').map(p => p.trim()).includes(currentTask.name));
        for (const successor of successors) {
          const newInDegree = (inDegree.get(successor.id) ?? 1) - 1;
          inDegree.set(successor.id, newInDegree);
          if (newInDegree === 0) {
            queue.push(successor);
          }
        }
      }
    }

    return { sortedTasks: sorted, isCyclic: sorted.length !== tasks.length };
  }, [tasks, taskNameMap]);

  useEffect(() => {
    const newTasks = tasks.map(task => {
        const successors = tasks.filter(t => t.predecessors.split(',').map(p=>p.trim()).includes(task.name));
        return { ...task, successors: successors.map(s => s.name) };
    });
    if(JSON.stringify(newTasks) !== JSON.stringify(tasks)) {
        setTasks(newTasks);
    }
  }, [tasks]);

  const triggerHighlight = (taskId: string) => {
    setHighlightedTaskId(taskId);
    setTimeout(() => setHighlightedTaskId(null), 500);
  };
  
  const handleReset = useCallback(() => {
    setTasks(prevTasks => prevTasks.map(t => ({
      ...t,
      es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false
    })));
    setEsStep(-1);
    setLsStep(-1);
    toast({ title: "Calculations Reset", description: "All schedule data has been cleared." });
  }, [toast]);

  const handleUpdateTask = (id: string, field: keyof Task, value: any) => {
    const newTasks = tasks.map((task) =>
      task.id === id ? { ...task, [field]: value } : task
    );
    setTasks(newTasks);
    handleReset();
  };

  const handleAddTask = () => {
    const newId = (Math.max(...tasks.map(t => parseInt(t.id)), 0) + 1).toString();
    const newTask: Task = {
      id: newId,
      name: `New Task ${newId}`,
      duration: 1,
      predecessors: '',
      successors: [],
      es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false
    };
    setTasks([...tasks, newTask]);
  };
  
  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    const newTasks = tasks
      .filter(t => t.id !== id)
      .map(t => {
          const preds = t.predecessors.split(',').map(p => p.trim()).filter(p => p !== taskToDelete.name);
          return {...t, predecessors: preds.join(', ')};
      });

    setTasks(newTasks);
    handleReset();
  }

  const handleEsStep = () => {
    if (esStep >= sortedTasks.length - 1) {
      toast({ title: "Earliest Start/Finish Calculated", description: "All tasks have been processed." });
      return;
    }

    const newEsStep = esStep + 1;
    const currentTask = sortedTasks[newEsStep];
    
    const predNames = currentTask.predecessors.split(',').map(p => p.trim()).filter(Boolean);
    const predTasks = predNames.map(name => taskNameMap[name]).filter(Boolean);
    
    const es = predTasks.length > 0 ? Math.max(...predTasks.map(p => p.ef ?? 0)) : 0;
    const ef = es + currentTask.duration;
    
    setTasks(prev => prev.map(t => t.id === currentTask.id ? { ...t, es, ef, isCompleted: true } : t));
    setEsStep(newEsStep);
    triggerHighlight(currentTask.id);
  };

  const handleLsStep = () => {
    const esDone = esStep === tasks.length - 1;
    if (!esDone) {
      toast({ variant: "destructive", title: "Prerequisite not met", description: "Please complete Earliest Date calculations first." });
      return;
    }
    if (lsStep >= sortedTasks.length - 1) {
      toast({ title: "Latest Start/Finish Calculated", description: "All tasks have been processed. Float and Critical Path updated." });
      return;
    }

    const projectFinishDate = Math.max(...tasks.map(t => t.ef ?? 0));
    const newLsStep = lsStep + 1;
    const reversedSortedTasks = [...sortedTasks].reverse();
    const currentTask = reversedSortedTasks[newLsStep];

    const succTasks = currentTask.successors.map(name => taskNameMap[name]).filter(Boolean);
    
    const lf = succTasks.length > 0 ? Math.min(...succTasks.map(s => s.ls ?? Infinity)) : projectFinishDate;
    const ls = lf - currentTask.duration;
    
    const float = ls - (currentTask.es ?? 0);
    const isCritical = float === 0;

    setTasks(prev => prev.map(t => t.id === currentTask.id ? { ...t, ls, lf, float, isCritical, isCompleted: true } : t));
    setLsStep(newLsStep);
    triggerHighlight(currentTask.id);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const response = await optimizeSchedule({
        tasks: tasks.map(({ name, duration, predecessors }) => ({ name, duration, predecessors: predecessors.split(',').map(p => p.trim()).filter(Boolean) })),
        projectDescription: "Optimize this project schedule for minimum duration.",
      });

      const newTasks = response.optimizedTasks.map((t, i) => ({
        id: (i + 1).toString(),
        name: t.name,
        duration: t.duration,
        predecessors: t.predecessors.join(', '),
        successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false
      }));

      setTasks(newTasks);
      handleReset();
      toast({ title: "AI Schedule Optimized", description: response.summary, duration: 8000 });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Optimization Failed", description: "An error occurred while communicating with the AI." });
    } finally {
      setIsOptimizing(false);
    }
  };

  const allEsDone = esStep === tasks.length - 1;
  const allLsDone = lsStep === tasks.length - 1;

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground font-body antialiased">
        <header className="flex items-center justify-between p-4 border-b shrink-0">
          <h1 className="text-2xl font-bold text-primary font-headline">Task Scheduler Pro</h1>
          <div className="flex items-center gap-2">
            {isCyclic && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-destructive-foreground bg-destructive p-2 rounded-md">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Cyclic Dependency Detected!</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Calculations are disabled. Please resolve the loop in your tasks.</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button onClick={handleAddTask} variant="outline" size="sm"><PlusCircle className="mr-2" />Add Task</Button>
            <Button onClick={handleOptimize} disabled={isOptimizing || isCyclic} variant="outline" size="sm">
              {isOptimizing ? <Loader className="mr-2 animate-spin" /> : <BrainCircuit className="mr-2" />}
              AI Schedule Optimizer
            </Button>
            <Button onClick={handleEsStep} disabled={allEsDone || isCyclic} size="sm">
              <Play className="mr-2"/> Earliest ({esStep + 1}/{tasks.length})
            </Button>
            <Button onClick={handleLsStep} disabled={!allEsDone || allLsDone || isCyclic} size="sm">
              <Play className="mr-2"/> Latest ({lsStep + 1}/{tasks.length})
            </Button>
            <Button onClick={handleReset} variant="destructive" size="sm"><RotateCcw className="mr-2" />Reset</Button>
          </div>
        </header>
        <main className="flex-grow overflow-auto p-4">
          <div className="border rounded-lg shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">Del</TableHead>
                  <TableHead className="w-[200px]">Task Name</TableHead>
                  <TableHead className="w-[100px]">Duration</TableHead>
                  <TableHead>Predecessors</TableHead>
                  <TableHead>Successors</TableHead>
                  <TableHead className="w-[80px]">ES</TableHead>
                  <TableHead className="w-[80px]">EF</TableHead>
                  <TableHead className="w-[80px]">LS</TableHead>
                  <TableHead className="w-[80px]">LF</TableHead>
                  <TableHead className="w-[80px]">Float</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} 
                    data-critical={task.isCritical} 
                    data-highlight={highlightedTaskId === task.id}
                    className="data-[critical=true]:bg-primary/10 data-[highlight=true]:bg-accent/20 transition-colors duration-500"
                  >
                    <TableCell>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={task.name}
                        onChange={(e) => handleUpdateTask(task.id, 'name', e.target.value)}
                        className="bg-transparent border-0 focus-visible:ring-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={task.duration}
                        onChange={(e) => handleUpdateTask(task.id, 'duration', parseInt(e.target.value) || 0)}
                         className="bg-transparent border-0 focus-visible:ring-1 w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={task.predecessors}
                        onChange={(e) => handleUpdateTask(task.id, 'predecessors', e.target.value)}
                        placeholder="e.g., Task 1, Task 2"
                         className="bg-transparent border-0 focus-visible:ring-1"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{task.successors.join(', ')}</TableCell>
                    <TableCell className="font-mono">{task.es}</TableCell>
                    <TableCell className="font-mono">{task.ef}</TableCell>
                    <TableCell className="font-mono">{task.ls}</TableCell>
                    <TableCell className="font-mono">{task.lf}</TableCell>
                    <TableCell className="font-mono">{task.float}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
