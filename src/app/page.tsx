
"use client";

import React, { useState, useMemo, useCallback } from "react";
import type { Task } from "./types";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Play, RotateCcw, AlertCircle, Loader } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const INITIAL_TASKS: Task[] = [
    { id: 'D', name: 'D', duration: 0, predecessors: '', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'a', name: 'a', duration: 7, predecessors: 'D', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'b', name: 'b', duration: 7, predecessors: 'a', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'c', name: 'c', duration: 15, predecessors: 'b', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'd', name: 'd', duration: 30, predecessors: 'c', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'h', name: 'h', duration: 60, predecessors: 'd', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'i', name: 'i', duration: 20, predecessors: 'h', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'j', name: 'j', duration: 30, predecessors: 'i', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'e', name: 'e', duration: 45, predecessors: 'd', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'f', name: 'f', duration: 15, predecessors: 'e', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'k', name: 'k', duration: 30, predecessors: 'f', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'l', name: 'l', duration: 15, predecessors: 'k', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'g', name: 'g', duration: 45, predecessors: 'd', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'm', name: 'm', duration: 30, predecessors: 'g,j,l', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'p', name: 'p', duration: 15, predecessors: 'm', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'n', name: 'n', duration: 15, predecessors: 'm', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'o', name: 'o', duration: 30, predecessors: 'n', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'q', name: 'q', duration: 15, predecessors: 'o', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'r', name: 'r', duration: 15, predecessors: 'q', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 's', name: 's', duration: 30, predecessors: 'q', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'w', name: 'w', duration: 7, predecessors: 'r,s', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 't', name: 't', duration: 7, predecessors: 'p,r', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'u', name: 'u', duration: 4, predecessors: 't', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'v', name: 'v', duration: 2, predecessors: 's,t', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
    { id: 'F', name: 'F', duration: 0, predecessors: 'u,v,w', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false },
];

const CalculationCell = ({ task, taskMap }: { task: Task, taskMap: Record<string, Task> }) => {
    const preds = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);

    const cellClasses = cn(
        "bg-white w-48 shrink-0 flex flex-col",
        task.isCritical && "text-destructive"
    );

    const mainContent = (
        <div className={cn("grid grid-cols-[1fr_2fr_1fr] text-center border-t border-black", task.isCritical && "border-destructive")}>
            <div className={cn("p-1 font-bold border-r border-black", task.isCritical && "border-destructive")}>{task.es ?? ''}</div>
            <div className={cn("p-1")}>
                <span className="font-bold">{task.name}</span>
                <span> {task.duration}</span>
            </div>
            <div className={cn("p-1 font-bold border-l border-black", task.isCritical && "border-destructive")}>{task.ef ?? ''}</div>
        </div>
    );
    
    return (
        <div className={cellClasses}>
             <div className="grid grid-cols-[1fr_2fr_1fr] text-center flex-grow">
                 <div className={cn("p-1 border-r border-black", task.isCritical && "border-destructive")}>{task.ls ?? ''}</div>
                 <div className="p-1 font-bold">{task.name}</div>
                 <div className={cn("p-1 border-l border-black", task.isCritical && "border-destructive")}>{task.lf ?? ''}</div>
            </div>
            {preds.length > 1 && preds.map(predName => {
                const predTask = taskMap[predName];
                if (!predTask) return null;
                return (
                    <div key={predName} className={cn("grid grid-cols-[1fr_2fr_1fr] text-center border-t border-black text-sm text-muted-foreground", predTask.isCritical && "text-destructive", task.isCritical && "border-destructive")}>
                         <div className={cn("p-1 border-r border-black", predTask.isCritical && "border-destructive")}>{predTask.es}</div>
                         <div className="p-1 ">{predTask.name} {predTask.duration}</div>
                         <div className={cn("p-1 border-l border-black", predTask.isCritical && "border-destructive")}>{predTask.ef}</div>
                    </div>
                )
            })}
             {mainContent}
        </div>
    );
};

const CalculationView = ({ tasks, taskMap }: { tasks: Task[], taskMap: Record<string, Task> }) => {
    if (tasks.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">Aucune tâche à afficher.</div>
    }
    return (
        <div className="flex-grow overflow-auto p-8 bg-slate-200">
            <div className="overflow-x-auto pb-4">
                <div className="flex flex-nowrap gap-px bg-black border border-black p-px">
                     {tasks.map(task => (
                        <CalculationCell key={task.id} task={task} taskMap={taskMap} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [step, setStep] = useState(-1);
    const [calculationMode, setCalculationMode] = useState<'earliest' | 'latest'>('earliest');
    const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

    const taskMap = useMemo(() => {
        return tasks.reduce((acc, task) => {
            acc[task.name] = task;
            return acc;
        }, {} as Record<string, Task>);
    }, [tasks]);

    const { sortedTasks, isCyclic } = useMemo(() => {
        const localTaskMap = new Map(tasks.map((task) => [task.id, { ...task }]));
        const inDegree = new Map(tasks.map(task => [task.id, 0]));

        for (const task of tasks) {
            const predNames = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);
            if (predNames.length > 0) {
              inDegree.set(task.id, predNames.length);
            }
            for (const predName of predNames) {
                const predTask = taskMap[predName];
                if (predTask) {
                    const successorList = localTaskMap.get(predTask.id)!.successors;
                    if (!successorList.includes(task.name)) {
                       successorList.push(task.name);
                    }
                }
            }
        }

        const queue = tasks.filter(task => (inDegree.get(task.id) ?? 0) === 0);
        const sorted: Task[] = [];
        
        while (queue.length > 0) {
            const currentTask = queue.shift()!;
            sorted.push(tasks.find(t => t.id === currentTask.id)!);

            const successors = tasks.filter(t => t.predecessors.split(',').map(p => p.trim()).includes(currentTask.name));
            for (const successor of successors) {
                const newInDegree = (inDegree.get(successor.id) ?? 1) - 1;
                inDegree.set(successor.id, newInDegree);
                if (newInDegree === 0) {
                    queue.push(successor);
                }
            }
        }

        return { sortedTasks: sorted, isCyclic: sorted.length !== tasks.length };
    }, [tasks, taskMap]);
    
    const triggerHighlight = (taskId: string) => {
        setHighlightedTaskId(taskId);
        setTimeout(() => setHighlightedTaskId(null), 500);
    };
    
    const calculateAndSetCriticalPath = useCallback(() => {
        const finalTasks = tasks.map(task => {
            if (task.es !== null && task.ls !== null) {
                const float = task.ls - task.es;
                return { ...task, float };
            }
            return task;
        }).map((task, _, allTasks) => {
             const taskMap = allTasks.reduce((acc, t) => {
              acc[t.name] = t;
              return acc;
            }, {} as Record<string, Task>);

            if (task.float !== null && Math.abs(task.float) < 0.001) {
                const preds = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);
                const isCriticalPred = preds.length > 0 && preds.every(pName => {
                    const pTask = taskMap[pName];
                    return pTask && pTask.isCritical && pTask.ef === task.es;
                });
                
                if (preds.length === 0 || isCriticalPred) {
                    return { ...task, isCritical: true };
                }
            }
            return task;
        });

       let criticalPathTasks = new Set<string>();
       const endTask = finalTasks.find(t => t.name === 'F');

       const findPath = (taskName: string) => {
           if (criticalPathTasks.has(taskName)) return;
           const task = taskMap[taskName];
           if (!task || task.float === null || Math.abs(task.float) > 0.001) return;

           criticalPathTasks.add(taskName);
           const predNames = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);
           for (const predName of predNames) {
               const predTask = taskMap[predName];
               if (predTask && predTask.ef === task.es) {
                   findPath(predName);
               }
           }
       };

       if(endTask && endTask.float !== null && Math.abs(endTask.float) < 0.001){
           findPath('F');
       }

       setTasks(prev => prev.map(t => ({...t, isCritical: criticalPathTasks.has(t.name) })));
       toast({ title: "Chemin critique calculé", description: "Le chemin critique a été mis en évidence en rouge." });
    }, [tasks, toast]);


    const handleReset = useCallback(() => {
        setTasks(prevTasks => prevTasks.map(t => ({
            ...t,
            es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false
        })));
        setStep(-1);
        toast({ title: "Calculs réinitialisés", description: "Toutes les données de planning ont été effacées." });
    }, [toast]);

    const handleNextStep = () => {
        if (calculationMode === 'earliest') {
            handleEsStep();
        } else {
            toast({variant: "destructive", title: "Non implémenté", description: "Le calcul des dates au plus tard n'est pas encore disponible."})
            // handleLsStep();
        }
    };
    
    const handleEsStep = () => {
        if (step >= sortedTasks.length - 1) {
            toast({ title: "Calcul terminé.", description: "Le chemin critique est maintenant affiché." });
            // Final step: calculate critical path
            const finalTask = tasks.find(t => t.name === 'F');
            const projectFinishDate = finalTask?.ef ?? Math.max(...tasks.map(t => t.ef ?? 0));
            
            // Set all LF to project finish date to start LS calculation
            const tasksWithLf = tasks.map(t => ({...t, ls: null, lf: projectFinishDate, float: null, isCritical: false}));
            
            const reversedSortedTasks = [...sortedTasks].reverse();
            let newTasks = [...tasksWithLf];

            for(const currentTask of reversedSortedTasks) {
                const taskInArr = newTasks.find(t => t.id === currentTask.id)!;
                const succTasks = newTasks.filter(t => t.predecessors.split(',').map(p=>p.trim()).includes(currentTask.name));

                const lf = succTasks.length > 0 ? Math.min(...succTasks.map(s => s.ls ?? Infinity)) : projectFinishDate;
                const ls = lf - taskInArr.duration;
                const float = ls - (taskInArr.es ?? 0);
                
                const taskIndex = newTasks.findIndex(t => t.id === currentTask.id);
                newTasks[taskIndex] = {...taskInArr, ls, lf, float};
            }

            const criticalPathTasks = new Set<string>();
            const findPath = (taskName: string) => {
               if (criticalPathTasks.has(taskName)) return;
               const task = newTasks.find(t => t.name === taskName);
               if (!task || task.float === null || Math.abs(task.float) > 0.001) return;

               criticalPathTasks.add(taskName);
               const predNames = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);
               for (const predName of predNames) {
                   const predTask = newTasks.find(t => t.name === predName);
                   if (predTask && predTask.ef === task.es) {
                       findPath(predName);
                   }
               }
           };

           findPath('F');
           setTasks(newTasks.map(t => ({...t, isCritical: criticalPathTasks.has(t.name) })));
           setStep(s => s + 1); // Mark as finished
           return;
        }

        const newStep = step + 1;
        const currentTask = sortedTasks[newStep];
        
        const predNames = currentTask.predecessors.split(',').map(p => p.trim()).filter(Boolean);
        const predTasks = predNames.map(name => taskMap[name]).filter(Boolean);
        
        const es = predTasks.length > 0 ? Math.max(...predTasks.map(p => p.ef ?? 0)) : 0;
        const ef = es + currentTask.duration;
        
        setTasks(prev => prev.map(t => t.id === currentTask.id ? { ...t, es, ef, isCompleted: true } : t));
        setStep(newStep);
        triggerHighlight(currentTask.id);
    };

    const isFinished = step >= sortedTasks.length;

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-background text-foreground font-sans antialiased">
                <header className="flex flex-col sm:flex-row items-center justify-between p-4 border-b shrink-0 bg-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary text-primary-foreground p-2 text-center font-bold">RECHERCHE<br/>OPERATIONNELLE</div>
                        <h1 className="text-3xl font-bold text-destructive">Chemin critique (PERT)</h1>
                    </div>
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
                    <div className="flex flex-col items-center gap-4">
                        <RadioGroup defaultValue="earliest" className="flex gap-4" onValueChange={(val: 'earliest' | 'latest') => setCalculationMode(val)} disabled={isCyclic || step > -1}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="earliest" id="r1" />
                                <Label htmlFor="r1">Au plus tôt & Chemin Critique</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="latest" id="r2" />
                                <Label htmlFor="r2">Au plus tard</Label>
                            </div>
                        </RadioGroup>
                         <div className="flex items-center gap-2">
                            <Button onClick={handleNextStep} disabled={isFinished || isCyclic} size="sm">
                              <Play className="mr-2 h-4 w-4"/> {step === -1 ? "Démarrer" : "Étape suivante"}
                            </Button>
                            <Button onClick={handleReset} variant="destructive" size="sm"><RotateCcw className="mr-2 h-4 w-4" />Réinitialiser</Button>
                        </div>
                    </div>
                </header>

                <CalculationView tasks={sortedTasks} taskMap={taskMap} />

                <Toaster />
            </div>
        </TooltipProvider>
    );
}

