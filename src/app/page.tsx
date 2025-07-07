
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
    { id: '1', name: 'a', duration: 7, predecessors: '', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '2', name: 'b', duration: 7, predecessors: 'a', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '3', name: 'c', duration: 15, predecessors: 'b', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '4', name: 'd', duration: 30, predecessors: 'c', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '5', name: 'e', duration: 45, predecessors: 'd', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '6', name: 'f', duration: 15, predecessors: 'e', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '7', name: 'g', duration: 45, predecessors: 'd', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '8', name: 'h', duration: 60, predecessors: 'd', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '9', name: 'i', duration: 20, predecessors: 'h', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '10', name: 'j', duration: 30, predecessors: 'i', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '11', name: 'k', duration: 30, predecessors: 'f', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '12', name: 'l', duration: 15, predecessors: 'k', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '13', name: 'm', duration: 30, predecessors: 'g, j, l', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '14', name: 'n', duration: 15, predecessors: 'm', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '15', name: 'o', duration: 30, predecessors: 'n', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '16', name: 'p', duration: 15, predecessors: 'm', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '17', name: 'q', duration: 15, predecessors: 'o', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '18', name: 'r', duration: 15, predecessors: 'q', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '19', name: 's', duration: 30, predecessors: 'q', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '20', name: 't', duration: 7, predecessors: 'p', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '21', name: 'u', duration: 4, predecessors: 'r, t', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '22', name: 'v', duration: 2, predecessors: 's, t', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: '23', name: 'w', duration: 7, predecessors: 'r, s', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
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
    toast({ title: "Calculs réinitialisés", description: "Toutes les données de planning ont été effacées." });
  }, [toast]);

  const handleUpdateTask = (id: string, field: keyof Task, value: any) => {
    const newTasks = tasks.map((task) =>
      task.id === id ? { ...task, [field]: value } : task
    );
    setTasks(newTasks);
    handleReset();
  };

  const handleAddTask = () => {
    const newId = (tasks.length > 0 ? Math.max(...tasks.map(t => parseInt(t.id, 10))) : 0) + 1).toString();

    const existingNames = new Set(tasks.map(t => t.name));
    let newName = '';
    for (let i = 0; ; i++) {
        let temp = i;
        let name = '';
        while (temp >= 0) {
            name = String.fromCharCode(temp % 26 + 97) + name;
            temp = Math.floor(temp / 26) - 1;
        }
        if (!existingNames.has(name)) {
            newName = name;
            break;
        }
    }

    const newTask: Task = {
      id: newId,
      name: newName,
      duration: 1,
      predecessors: '',
      successors: [],
      es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false
    };
    setTasks([...tasks, newTask]);
    handleReset();
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
      toast({ title: "Calcul des dates au plus tôt terminé", description: "Toutes les tâches ont été traitées." });
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
      toast({ variant: "destructive", title: "Prérequis non satisfait", description: "Veuillez d'abord terminer le calcul des dates au plus tôt." });
      return;
    }
    if (lsStep >= sortedTasks.length - 1) {
      toast({ title: "Calcul des dates au plus tard terminé", description: "Toutes les tâches ont été traitées. La marge et le chemin critique sont à jour." });
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
        projectDescription: "Optimiser ce planning de projet pour une durée minimale.",
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
      toast({ title: "Planning optimisé par l'IA", description: response.summary, duration: 8000 });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "L'optimisation a échoué", description: "Une erreur est survenue lors de la communication avec l'IA." });
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
          <h1 className="text-2xl font-bold text-primary font-headline">Planificateur de Tâches Pro</h1>
          <div className="flex items-center gap-2">
            {isCyclic && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-destructive-foreground bg-destructive p-2 rounded-md">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Dépendance Cyclique Détectée!</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Les calculs sont désactivés. Veuillez résoudre la boucle dans vos tâches.</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button onClick={handleAddTask} variant="outline" size="sm"><PlusCircle className="mr-2" />Ajouter Tâche</Button>
            <Button onClick={handleOptimize} disabled={isOptimizing || isCyclic} variant="outline" size="sm">
              {isOptimizing ? <Loader className="mr-2 animate-spin" /> : <BrainCircuit className="mr-2" />}
              Optimiseur (IA)
            </Button>
            <Button onClick={handleEsStep} disabled={allEsDone || isCyclic} size="sm">
              <Play className="mr-2"/> Calculer au plus tôt
            </Button>
            <Button onClick={handleLsStep} disabled={!allEsDone || allLsDone || isCyclic} size="sm">
              <Play className="mr-2"/> Calculer au plus tard
            </Button>
            <Button onClick={handleReset} variant="destructive" size="sm"><RotateCcw className="mr-2" />Réinitialiser</Button>
          </div>
        </header>
        <main className="flex-grow overflow-auto p-4">
          <div className="overflow-x-auto">
            <table className="border-collapse">
              <colgroup>
                  <col className="w-[100px]" />
                  {tasks.map(task => (
                      <col key={task.id} className={cn("w-[140px]", highlightedTaskId === task.id ? 'bg-accent/20' : '')} />
                  ))}
              </colgroup>
              <thead className="text-sm">
                <tr className="border-b">
                  <th className="p-2 text-left font-semibold text-muted-foreground border-b border-r">Tâche</th>
                  {tasks.map(task => (
                    <th key={task.id} className="p-2 text-center font-bold text-primary border-b border-r">{task.name}</th>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-left font-semibold text-muted-foreground border-b border-r">Durée</td>
                  {tasks.map(task => (
                    <td key={task.id} className="p-1 border-b border-r">
                      <Input
                        type="number"
                        min="0"
                        value={task.duration}
                        onChange={(e) => handleUpdateTask(task.id, 'duration', parseInt(e.target.value) || 0)}
                        className="w-20 mx-auto h-8 text-center"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b-2">
                   <td className="p-2 text-left font-semibold text-muted-foreground border-b border-r">T.ant.</td>
                   {tasks.map(task => (
                      <td key={task.id} className="p-1 border-b border-r">
                        <Input
                            value={task.predecessors}
                            onChange={(e) => handleUpdateTask(task.id, 'predecessors', e.target.value)}
                            placeholder="Ex: a, b"
                            className="w-20 mx-auto h-8 text-center"
                        />
                      </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 text-left font-semibold text-muted-foreground border-r"></td>
                  {tasks.map(task => (
                    <td key={task.id} className="p-0 border-r align-top">
                      <div className={cn("grid grid-cols-3 grid-rows-2 h-24 font-mono text-center", task.isCritical && 'bg-destructive/5')}>
                        <div className={cn("border-r border-b p-1 flex items-center justify-center", task.isCritical && 'text-destructive font-bold')}>{task.es ?? ''}</div>
                        <div className="border-r border-b p-1 flex items-center justify-center font-sans font-bold text-primary">{task.name}</div>
                        <div className={cn("border-b p-1 flex items-center justify-center", task.isCritical && 'text-destructive font-bold')}>{task.ef ?? ''}</div>
                        
                        <div className={cn("border-r p-1 flex items-center justify-center", task.isCritical && 'text-destructive font-bold')}>{task.ls ?? ''}</div>
                        <div className="border-r p-1 flex items-center justify-center font-sans text-xs text-muted-foreground">{task.predecessors}{task.duration}</div>
                        <div className={cn("p-1 flex items-center justify-center", task.isCritical && 'text-destructive font-bold')}>{task.lf ?? ''}</div>
                      </div>
                    </td>
                  ))}
                </tr>
                 <tr>
                    <td className="border-r"></td>
                    {tasks.map(task => (
                      <td key={task.id} className="p-1 text-center border-r">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Supprimer la tâche</p>
                            </TooltipContent>
                        </Tooltip>
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
