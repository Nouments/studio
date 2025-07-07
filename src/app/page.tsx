
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { optimizeSchedule } from "@/ai/flows/optimize-schedule";
import type { Task } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

const INITIAL_TASKS: Task[] = [
    { id: 'a', name: 'a', duration: 7, predecessors: '', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'b', name: 'b', duration: 7, predecessors: 'a', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'c', name: 'c', duration: 15, predecessors: 'b', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'd', name: 'd', duration: 30, predecessors: 'c', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'e', name: 'e', duration: 45, predecessors: 'd', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'f', name: 'f', duration: 15, predecessors: 'e', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'g', name: 'g', duration: 45, predecessors: 'd', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'h', name: 'h', duration: 60, predecessors: 'd', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'i', name: 'i', duration: 20, predecessors: 'h', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'j', name: 'j', duration: 30, predecessors: 'i', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'k', name: 'k', duration: 30, predecessors: 'f', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'l', name: 'l', duration: 15, predecessors: 'k', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'm', name: 'm', duration: 30, predecessors: 'g,j,l', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'n', name: 'n', duration: 15, predecessors: 'm', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'o', name: 'o', duration: 30, predecessors: 'n', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'p', name: 'p', duration: 15, predecessors: 'm', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'q', name: 'q', duration: 15, predecessors: 'o', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'r', name: 'r', duration: 15, predecessors: 'q', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 's', name: 's', duration: 30, predecessors: 'q', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 't', name: 't', duration: 7, predecessors: 'p,r', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'u', name: 'u', duration: 4, predecessors: 'r,t', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'v', name: 'v', duration: 2, predecessors: 's,t', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'w', name: 'w', duration: 7, predecessors: 'r,s', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
];

const TaskCard = ({ task, highlighted }: { task: Task, highlighted: boolean }) => {
    return (
        <div className={cn(
            "w-64 shrink-0 bg-white rounded-lg border-2 border-black font-sans shadow-lg",
            highlighted && "shadow-2xl scale-105 transition-transform duration-300 z-10",
            task.isCritical && "border-destructive"
        )}>
            <div className={cn(
                "grid grid-cols-2 text-center text-lg font-bold",
                task.isCritical && "text-destructive"
            )}>
                <div className="p-3 border-b-2 border-r-2 border-black">{task.es ?? ''}</div>
                <div className="p-3 border-b-2 border-black">{task.ef ?? ''}</div>
            </div>
            <div className="text-center p-3 border-b-2 border-black min-h-[7rem] flex flex-col justify-center">
                <div className="text-2xl font-bold">{task.name}</div>
                <div className="text-muted-foreground">Durée: {task.duration}</div>
                 <div className="text-sm text-muted-foreground mt-1 truncate">
                    Préc: {task.predecessors || 'Aucun'}
                </div>
            </div>
            <div className={cn(
                "grid grid-cols-2 text-center text-lg font-bold",
                task.isCritical && "text-destructive"
            )}>
                <div className="p-3 border-r-2 border-black">{task.ls ?? ''}</div>
                <div className="p-3">{task.lf ?? ''}</div>
            </div>
            <div className={cn(
                "text-center p-2 border-t-2 border-black text-base",
                 task.isCritical && "text-destructive font-bold"
            )}>
                Marge = {task.float ?? ''}
            </div>
        </div>
    );
};

const DataEntryView = ({ tasks, handleUpdateTask, handleDeleteTask, handleAddTask }: {
    tasks: Task[],
    handleUpdateTask: (id: string, field: keyof Task, value: any) => void,
    handleDeleteTask: (id: string) => void,
    handleAddTask: () => void,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2">
                            <th className="p-2 text-left font-semibold text-muted-foreground">Tâche</th>
                            <th className="p-2 text-left font-semibold text-muted-foreground">Durée</th>
                            <th className="p-2 text-left font-semibold text-muted-foreground">Prédécesseurs</th>
                            <th className="p-2 text-center font-semibold text-muted-foreground">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id} className="border-b">
                                <td className="p-2 font-bold text-primary">{task.name}</td>
                                <td className="p-1">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={task.duration}
                                        onChange={(e) => handleUpdateTask(task.id, 'duration', parseInt(e.target.value) || 0)}
                                        className="w-24 h-8"
                                    />
                                </td>
                                <td className="p-1">
                                    <Input
                                        value={task.predecessors}
                                        onChange={(e) => handleUpdateTask(task.id, 'predecessors', e.target.value)}
                                        placeholder="Ex: a,b"
                                        className="w-32 h-8"
                                    />
                                </td>
                                <td className="p-1 text-center">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Supprimer la tâche</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4">
                 <Button onClick={handleAddTask} variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" />Ajouter une nouvelle tâche</Button>
            </div>
        </div>
    );
}

export default function Home() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [esStep, setEsStep] = useState(-1);
  const [lsStep, setLsStep] = useState(-1);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [view, setView] = useState<'data' | 'calculation'>('data');

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
    // Basic deep compare to avoid infinite loops
    if(JSON.stringify(newTasks) !== JSON.stringify(tasks)) {
        setTasks(newTasks);
    }
  }, [tasks]);

  const triggerHighlight = (taskId: string) => {
    setHighlightedTaskId(taskId);
    setTimeout(() => setHighlightedTaskId(null), 500);
  };

  const calculateAndSetCriticalPath = useCallback(() => {
      const taskMap = tasks.reduce((acc, task) => {
          acc[task.name] = task;
          return acc;
      }, {} as Record<string, Task>);

      const endTasks = tasks.filter(t => t.successors.length === 0);
      if (endTasks.length === 0 && tasks.length > 0) {
         const maxEf = Math.max(...tasks.map(t => t.ef ?? 0));
         endTasks.push(...tasks.filter(t => t.ef === maxEf));
      }

      let criticalPathTasks = new Set<string>();
      
      const findPath = (taskName: string) => {
          if (criticalPathTasks.has(taskName)) return;

          const task = taskMap[taskName];
          if(!task) return;

          // A task is on the critical path if its float is 0 (or close to it)
          if(task.float !== null && task.float <= 0.001) {
             criticalPathTasks.add(taskName);
          } else {
            return; // Stop searching this branch
          }

          if (task.predecessors.length === 0) return;

          const predNames = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);
          for (const predName of predNames) {
              const predTask = taskMap[predName];
              // Traverse backwards if the predecessor is also critical and its end time matches current task start time
              if (predTask && predTask.float !== null && predTask.float <= 0.001 && predTask.ef === task.es) {
                  findPath(predName);
              }
          }
      };
      
      // Start from critical end tasks
      const criticalEndTasks = endTasks.filter(t => t.float !== null && t.float <= 0.001);
      criticalEndTasks.forEach(t => findPath(t.name));

      setTasks(prev => prev.map(t => ({...t, isCritical: criticalPathTasks.has(t.name) })));
      toast({ title: "Chemin critique calculé", description: "Le chemin critique a été mis en évidence en rouge." });
  }, [tasks, toast]);
  
  const handleReset = useCallback(() => {
    setTasks(prevTasks => prevTasks.map(t => ({
      ...t,
      es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false
    })));
    setEsStep(-1);
    setLsStep(-1);
    setView('data');
    toast({ title: "Calculs réinitialisés", description: "Toutes les données de planning ont été effacées." });
  }, [toast]);

  const handleUpdateTask = (id: string, field: keyof Task, value: any) => {
    const newTasks = tasks.map((task) =>
      task.id === id ? { ...task, [field]: value } : task
    );
    setTasks(newTasks);
    if(field === 'duration' || field === 'predecessors'){
        handleReset();
    }
  };

  const handleAddTask = () => {
    const existingNames = new Set(tasks.map(t => t.name));
    let newName = '';
    for (let i = 0; ; i++) {
        let tempName = String.fromCharCode(97 + i);
        if (!existingNames.has(tempName)) {
            newName = tempName;
            break;
        }
    }

    const newTask: Task = {
      id: newName,
      name: newName,
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
    if (view === 'data') setView('calculation');

    if (esStep >= sortedTasks.length - 1) {
      toast({ title: "Calcul des dates au plus tôt terminé.", description: "Vous pouvez maintenant calculer les dates au plus tard." });
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
    const esDone = esStep >= sortedTasks.length - 1;
    if (!esDone) {
      toast({ variant: "destructive", title: "Prérequis non satisfait", description: "Veuillez d'abord terminer le calcul des dates au plus tôt." });
      return;
    }
    if (lsStep >= sortedTasks.length - 1) {
      toast({ title: "Calcul des dates au plus tard terminé", description: "Le chemin critique peut maintenant être déterminé." });
      calculateAndSetCriticalPath();
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

    setTasks(prev => prev.map(t => t.id === currentTask.id ? { ...t, ls, lf, float } : t));
    setLsStep(newLsStep);
    triggerHighlight(currentTask.id);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const response = await optimizeSchedule({
        tasks: tasks.map(({ name, duration, predecessors }) => ({ name, duration, predecessors: predecessors.split(',').map(p => p.trim()).filter(Boolean) })),
        projectDescription: "Optimiser ce planning de projet pour une durée minimale.",
      });

      const newTasks = response.optimizedTasks.map((t, i) => ({
        id: t.name,
        name: t.name,
        duration: t.duration,
        predecessors: t.predecessors.join(', '),
        successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false
      }));

      setTasks(newTasks);
      handleReset();
      toast({ title: "Planning optimisé par l'IA", description: response.summary, duration: 8000 });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "L'optimisation a échoué", description: "Une erreur est survenue lors de la communication avec l'IA." });
    } finally {
      setIsOptimizing(false);
    }
  };

  const allEsDone = esStep >= sortedTasks.length - 1;
  const allLsDone = lsStep >= sortedTasks.length - 1;

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground font-sans antialiased">
        <header className="flex items-center justify-between p-4 border-b shrink-0 bg-slate-100">
            <div className="flex items-center gap-4">
                <div className="bg-primary text-primary-foreground p-2 text-center font-bold">RECHERCHE<br/>OPERATIONNELLE</div>
                <h1 className="text-3xl font-bold text-destructive">Chemin critique (PERT)</h1>
            </div>
          <div className="flex items-center gap-2">
            {isCyclic && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-destructive-foreground bg-destructive p-2 rounded-md">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Dépendance Cyclique!</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Les calculs sont désactivés. Veuillez résoudre la boucle.</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button onClick={() => setView(view === 'data' ? 'calculation' : 'data')} variant="outline" size="sm">
                {view === 'data' ? 'Voir Calcul' : 'Voir Données'}
            </Button>
            <Button onClick={handleOptimize} disabled={isOptimizing || isCyclic || view === 'calculation'} variant="outline" size="sm">
              {isOptimizing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
              Optimiseur (IA)
            </Button>
            <Button onClick={handleEsStep} disabled={(allEsDone && view === 'calculation') || isCyclic} size="sm">
              <Play className="mr-2 h-4 w-4"/> Calculer au plus tôt
            </Button>
            <Button onClick={handleLsStep} disabled={!allEsDone || allLsDone || isCyclic} size="sm">
              <Play className="mr-2 h-4 w-4"/> Calculer au plus tard
            </Button>
            <Button onClick={handleReset} variant="destructive" size="sm"><RotateCcw className="mr-2 h-4 w-4" />Réinitialiser</Button>
          </div>
        </header>

        <main className="flex-grow overflow-auto p-8 bg-slate-200">
           {view === 'data' ? (
              <DataEntryView tasks={tasks} handleUpdateTask={handleUpdateTask} handleDeleteTask={handleDeleteTask} handleAddTask={handleAddTask} />
            ) : (
                <div className="flex gap-4 pb-4">
                    {sortedTasks.map(task => (
                        <TaskCard key={task.id} task={task} highlighted={highlightedTaskId === task.id}/>
                    ))}
                </div>
            )}
        </main>

        <Toaster />
      </div>
    </TooltipProvider>
  );
}
