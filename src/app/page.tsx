
"use client";

import React, { useState, useMemo, useCallback } from "react";
import type { Task } from "./types";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Play, RotateCcw, AlertCircle } from "lucide-react";
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

const CalculationCell = ({ task, allTasks, calculationMode }: { task: Task; allTasks: Task[], calculationMode: 'earliest' | 'latest' }) => {
    const predecessorTasks = task.predecessors
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)
        .map(name => allTasks.find(t => t.name === name))
        .filter((t): t is Task => !!t);

    const cellClasses = cn(
        "bg-white w-48 shrink-0 border border-black flex flex-col justify-between",
        task.isCritical && "border-destructive"
    );

    const textClasses = (isCrit: boolean) => cn(isCrit ? "text-destructive font-bold" : "font-normal");
    const latestTextClasses = (isCrit: boolean) => cn(isCrit ? "text-destructive font-bold" : "text-blue-600 font-bold");

    return (
        <div className={cellClasses} style={{ minHeight: '150px' }}>
            <div className={cn("p-2 text-center border-b border-black", task.isCritical && "border-destructive")}>
                <div className="flex justify-between items-center">
                    <span className={cn(textClasses(task.isCritical), "font-bold")}>{task.es ?? ''}</span>
                    <span className={cn(textClasses(task.isCritical), "font-bold text-lg")}>{task.name.toUpperCase()}</span>
                    <span className={cn(textClasses(task.isCritical), "font-bold")}>{task.duration}</span>
                    <span className={cn(textClasses(task.isCritical), "font-bold")}>{task.ef ?? ''}</span>
                </div>
            </div>

            <div className="p-2 flex-grow flex flex-col justify-center">
                {predecessorTasks.map(p => (
                    <div key={p.id} className={cn("flex justify-around text-sm", textClasses(p.isCritical))}>
                        <span>{p.ef ?? ''}</span>
                        <span>{p.name}</span>
                        <span>{p.duration}</span>
                    </div>
                ))}
            </div>
            
            <div className={cn("p-2 text-center border-t border-black", task.isCritical && "border-destructive")}>
                 <div className="flex justify-between items-center">
                    <span className={cn(latestTextClasses(task.isCritical), "font-bold")}>{task.ls ?? ''}</span>
                    <span className="text-sm text-muted-foreground">{task.float !== null ? `marge=${task.float}` : ''}</span>
                    <span className={cn(latestTextClasses(task.isCritical), "font-bold")}>{task.lf ?? ''}</span>
                </div>
            </div>
        </div>
    );
};


const CalculationView = ({ tasks, criticalPath, calculationMode }: { tasks: Task[], criticalPath: string | null, calculationMode: 'earliest' | 'latest' }) => {
    if (tasks.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">Aucune tâche à afficher.</div>
    }
    return (
        <div className="flex-grow overflow-auto p-8 bg-slate-200">
            <div className="overflow-x-auto pb-4">
                <div className="flex flex-nowrap gap-px bg-black border border-black p-px">
                     {tasks.map(task => (
                        <CalculationCell key={task.id} task={task} allTasks={tasks} calculationMode={calculationMode}/>
                    ))}
                </div>
            </div>
             {criticalPath && (
                <div className="mt-6 p-4 border-t-2 border-black text-center">
                    <h2 className="text-xl font-bold">Chemin Critique:</h2>
                    <p className="text-destructive font-bold text-lg tracking-wider mt-2">{criticalPath}</p>
                    <p className="text-muted-foreground mt-4 text-sm">Remarque : Les successeurs sont calculés dès le départ pour la structure du graphe.</p>
                </div>
            )}
        </div>
    );
}

export default function Home() {
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [step, setStep] = useState(-1);
    const [calculationMode, setCalculationMode] = useState<'earliest' | 'latest'>('earliest');
    const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
    const [criticalPath, setCriticalPath] = useState<string | null>(null);

    const { sortedTasks, isCyclic } = useMemo(() => {
        const taskList = tasks.map(t => ({...t, successors: [] as string[]}));
        const taskMapByName = new Map(taskList.map(t => [t.name, t]));
        const inDegree = new Map(taskList.map(t => [t.name, 0]));

        for (const task of taskList) {
            const predNames = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);
            for (const predName of predNames) {
                const predTask = taskMapByName.get(predName);
                if (predTask) {
                    predTask.successors.push(task.name);
                }
            }
        }
        
        for (const task of taskList) {
            const predNames = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);
            inDegree.set(task.name, predNames.length);
        }

        const queue = taskList.filter(t => inDegree.get(t.name) === 0);
        const sortedNames: string[] = [];

        while (queue.length > 0) {
            const currentTask = queue.shift()!;
            sortedNames.push(currentTask.name);
            
            for (const successorName of currentTask.successors) {
                const successorTask = taskMapByName.get(successorName);
                if (successorTask) {
                    inDegree.set(successorName, inDegree.get(successorName)! - 1);
                    if (inDegree.get(successorName) === 0) {
                        queue.push(successorTask);
                    }
                }
            }
        }
        
        const isCyclic = sortedNames.length !== tasks.length;
        const finalSortedTasks = sortedNames.map(name => {
            const stateTask = tasks.find(t => t.name === name)!;
            const taskWithSuccessors = taskMapByName.get(name)!;
            return {
                ...stateTask,
                successors: taskWithSuccessors.successors
            };
        });

        return { sortedTasks: finalSortedTasks, isCyclic };
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
        setStep(-1);
        setCriticalPath(null);
        toast({ title: "Calculs réinitialisés", description: "Toutes les données de planning ont été effacées." });
    }, [toast]);

    const handleNextStep = () => {
        if (calculationMode === 'earliest') {
            handleEsStep();
        } else {
            handleLsStep();
        }
    };
    
    const handleEsStep = () => {
        if (step >= sortedTasks.length - 1) {
            toast({ title: "Calcul au plus tôt terminé.", description: "Calcul du chemin critique en cours..." });
            
            const currentTasks = [...tasks];
            const finalTask = currentTasks.find(t => t.name === 'F');
            const projectFinishDate = finalTask?.ef ?? Math.max(...currentTasks.map(t => t.ef ?? 0));
            
            let newTasks = currentTasks.map(t => ({...t, ls: null, lf: projectFinishDate, float: null, isCritical: false}));
            
            const reversedSortedTasks = [...sortedTasks].reverse();

            for(const currentTask of reversedSortedTasks) {
                const taskInArr = newTasks.find(t => t.id === currentTask.id)!;
                const successors = sortedTasks.filter(t => t.predecessors.split(',').map(p => p.trim()).includes(currentTask.name));
                const succTasks = newTasks.filter(t => successors.map(s => s.name).includes(t.name));

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
                   if (predTask && Math.abs(predTask.float ?? 1) < 0.001 && predTask.ef === task.es) {
                       findPath(predName);
                   }
               }
           };

           findPath('F');
           const finalTasksWithCritical = newTasks.map(t => ({...t, isCritical: criticalPathTasks.has(t.name) }));
           
           const criticalPathArray = sortedTasks
                .filter(t => criticalPathTasks.has(t.name))
                .map(t => t.name);
           setCriticalPath(criticalPathArray.join(' - '));
           
           setTasks(finalTasksWithCritical);
           setStep(s => s + 1);
           toast({ title: "Calcul terminé !", description: "Le chemin critique est maintenant affiché." });
           return;
        }

        const newStep = step + 1;
        const currentTask = sortedTasks[newStep];
        
        const predNames = currentTask.predecessors.split(',').map(p => p.trim()).filter(Boolean);
        const predTasks = predNames.map(name => tasks.find(t=>t.name === name)).filter(Boolean);
        
        const es = predTasks.length > 0 ? Math.max(...predTasks.map(p => p.ef ?? 0)) : 0;
        const ef = es + currentTask.duration;
        
        setTasks(prev => prev.map(t => t.id === currentTask.id ? { ...t, es, ef, isCompleted: true } : t));
        setStep(newStep);
        triggerHighlight(currentTask.id);
    };

    const handleLsStep = () => {
        const finalTaskInState = tasks.find(t => t.name === 'F');
        if (!finalTaskInState?.ef) {
            toast({ variant: "destructive", title: "Erreur", description: "Veuillez d'abord terminer le calcul 'Au plus tôt'." });
            return;
        }

        const reversedSortedTasks = [...sortedTasks].reverse();
        
        if (step >= reversedSortedTasks.length - 1) {
            toast({ title: "Calcul au plus tard terminé." });
            setStep(s => s + 1);
            return;
        }

        const newStep = step + 1;
        const currentTaskInSort = reversedSortedTasks[newStep];
        
        let newTasks = [...tasks];
        const taskIndex = newTasks.findIndex(t => t.id === currentTaskInSort.id);
        const taskToUpdate = { ...newTasks[taskIndex] };

        const successorTasks = currentTaskInSort.successors
            .map(succName => newTasks.find(t => t.name === succName))
            .filter((t): t is Task => !!t);

        const lf = successorTasks.length > 0 
            ? Math.min(...successorTasks.map(s => s.ls ?? Infinity)) 
            : finalTaskInState.ef;
            
        const ls = lf - taskToUpdate.duration;

        newTasks[taskIndex] = { ...taskToUpdate, ls, lf };
        
        setTasks(newTasks);
        setStep(newStep);
        triggerHighlight(currentTaskInSort.id);
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
                        <RadioGroup defaultValue="earliest" className="flex gap-4" onValueChange={(val: 'earliest' | 'latest') => { setCalculationMode(val); setStep(-1); }} disabled={isCyclic || (step > -1 && !isFinished)}>
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
                              <Play className="mr-2 h-4 w-4"/> {step === -1 ? "Démarrer" : isFinished ? "Terminé" : "Étape suivante"}
                            </Button>
                            <Button onClick={handleReset} variant="destructive" size="sm"><RotateCcw className="mr-2 h-4 w-4" />Réinitialiser</Button>
                        </div>
                    </div>
                </header>

                <CalculationView tasks={sortedTasks} criticalPath={criticalPath} calculationMode={calculationMode} />

                <Toaster />
            </div>
        </TooltipProvider>
    );
}
