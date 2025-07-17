
"use client";

import React, { useState, useMemo, useCallback } from "react";
import type { Task } from "./types";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Trash2, Plus, ChevronsRight, ChevronsLeft } from "lucide-react";
import {
    Tooltip,
    TooltipProvider,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
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

const CalculationCell = ({ task }: { task: Task }) => {
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
                    <span className={cn(textClasses(task.isCritical), "font-bold text-lg")}>{task.duration}</span>
                    <span className={cn(textClasses(task.isCritical), "font-bold")}>{task.ef ?? ''}</span>
                </div>
            </div>

            <div className="p-2 flex-grow flex flex-col justify-center">
                <div className={cn("text-center font-bold", textClasses(task.isCritical))}>
                    {task.name.toUpperCase()}
                </div>
                 <div className="text-center text-sm text-muted-foreground">
                    ({task.predecessors})
                </div>
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


const CalculationView = ({ tasks, criticalPath }: { tasks: Task[], criticalPath: string | null }) => {
    if (tasks.length === 0) {
        return null;
    }
    return (
        <div className="flex-grow overflow-auto p-8 bg-slate-200">
            <div className="overflow-x-auto pb-4">
                <div className="flex flex-nowrap gap-px bg-black border border-black p-px">
                     {tasks.map(task => (
                        <CalculationCell key={task.id} task={task} />
                    ))}
                </div>
            </div>
             {criticalPath && (
                <div className="mt-6 p-4 border-t-2 border-black text-center">
                    <h2 className="text-xl font-bold">Chemin Critique:</h2>
                    <p className="text-destructive font-bold text-lg tracking-wider mt-2">{criticalPath}</p>
                </div>
            )}
        </div>
    );
}

export default function Home() {
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [calculatedTasks, setCalculatedTasks] = useState<Task[]>([]);
    const [criticalPath, setCriticalPath] = useState<string | null>(null);
    const [earliestDone, setEarliestDone] = useState(false);

    const handleTaskChange = (id: string, field: keyof Task, value: string | number) => {
        setTasks(prevTasks =>
            prevTasks.map(task => (task.id === id ? { ...task, [field]: value } : task))
        );
        // Reset calculations if tasks change
        setCalculatedTasks([]);
        setCriticalPath(null);
        setEarliestDone(false);
    };

    const handleAddTask = () => {
        const newId = `task_${Date.now()}`;
        setTasks(prevTasks => [
            ...prevTasks,
            { id: newId, name: '', duration: 0, predecessors: '', successors: [], es: null, ef: null, ls: null, lf: null, float: null, isCritical: false, isCompleted: false }
        ]);
    };

    const handleRemoveTask = (id: string) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        // Reset calculations if tasks change
        setCalculatedTasks([]);
        setCriticalPath(null);
        setEarliestDone(false);
    };

    const { sortedTasks: topologicallySorted, isCyclic } = useMemo(() => {
        if (!tasks || tasks.length === 0) {
             return { sortedTasks: [], isCyclic: false };
        }
        const taskList = tasks.map(t => ({...t, successors: [] as string[]}));
        const taskMapByName = new Map(taskList.map(t => [t.name, t]));
        
        for (const task of taskList) {
            const predNames = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);
            for (const predName of predNames) {
                const predTask = taskMapByName.get(predName);
                if (predTask) {
                    predTask.successors.push(task.name);
                }
            }
        }
        
        const inDegree = new Map(taskList.map(t => [t.name, 0]));
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
                inDegree.set(successorName, inDegree.get(successorName)! - 1);
                if (inDegree.get(successorName) === 0) {
                    const successorTask = taskMapByName.get(successorName);
                    if(successorTask) queue.push(successorTask);
                }
            }
        }
        
        const isCyclicCheck = sortedNames.length !== tasks.length;
        const finalSortedTasks = sortedNames.map(name => {
            const stateTask = tasks.find(t => t.name === name)!;
            const taskWithSuccessors = taskMapByName.get(name)!;
            return {
                ...stateTask,
                successors: taskWithSuccessors.successors
            };
        });

        return { sortedTasks: finalSortedTasks, isCyclic: isCyclicCheck };
    }, [tasks]);

    const handleCalculateEarliest = useCallback(() => {
        if (isCyclic) {
            toast({ variant: "destructive", title: "Erreur", description: "Dépendance cyclique détectée. Veuillez corriger les prédécesseurs." });
            return;
        }

        // --- Earliest Times Calculation ---
        let processedTasks = new Map<string, Task>();
        for (const currentTask of topologicallySorted) {
            const predNames = currentTask.predecessors.split(',').map(p => p.trim()).filter(Boolean);
            const predTasks = predNames.map(name => processedTasks.get(name)).filter((t): t is Task => !!t);

            const es = predTasks.length > 0 ? Math.max(...predTasks.map(p => p.ef ?? 0)) : 0;
            const ef = es + currentTask.duration;
            
            processedTasks.set(currentTask.name, { ...currentTask, es, ef, ls: null, lf: null, float: null, isCritical: false });
        }
        const tasksWithES = Array.from(processedTasks.values());

        // --- Latest Times Calculation (for critical path) ---
        const reversedSortedTasks = [...topologicallySorted].reverse();
        const projectFinishDate = Math.max(...tasksWithES.map(t => t.ef ?? 0));
        
        let finalTasksMap = new Map<string, Task>(tasksWithES.map(t => [t.name, {...t, lf: projectFinishDate}]));

        for(const currentTask of reversedSortedTasks) {
            const taskToUpdate = finalTasksMap.get(currentTask.name)!;
            const successors = topologicallySorted.filter(t => t.predecessors.split(',').map(p => p.trim()).includes(currentTask.name));
            const succTasks = successors.map(s => finalTasksMap.get(s.name)).filter((t): t is Task => !!t);

            const lf = succTasks.length > 0 ? Math.min(...succTasks.map(s => s.ls ?? Infinity)) : projectFinishDate;
            const ls = lf - taskToUpdate.duration;
            const float = ls - (taskToUpdate.es ?? 0);
            
            finalTasksMap.set(currentTask.name, {...taskToUpdate, ls, lf, float});
        }
        
        // --- Critical Path Identification ---
        const criticalPathTasks = new Set<string>();
        const findPath = (taskName: string) => {
            if (criticalPathTasks.has(taskName)) return;
            const task = finalTasksMap.get(taskName);
            if (!task || task.float === null || Math.abs(task.float) > 0.001) return;

            criticalPathTasks.add(taskName);
            const predNames = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);
            for (const predName of predNames) {
                const predTask = finalTasksMap.get(predName);
                if (predTask && Math.abs(predTask.float ?? 1) < 0.001 && predTask.ef === task.es) {
                    findPath(predName);
                }
            }
        };

        const endNode = reversedSortedTasks[0]?.name;
        if(endNode) {
          findPath(endNode);
        }

        const finalTasksWithCritical = Array.from(finalTasksMap.values()).map(t => ({
            ...t, 
            isCritical: criticalPathTasks.has(t.name),
            // We hide LS/LF values until the user clicks the "latest" button
            ls: null, 
            lf: null
        }));
        
        const criticalPathArray = topologicallySorted
             .filter(t => criticalPathTasks.has(t.name))
             .map(t => t.name);
             
        setCriticalPath(criticalPathArray.join(' - '));
        setCalculatedTasks(finalTasksWithCritical.sort((a, b) => topologicallySorted.findIndex(t => t.name === a.name) - topologicallySorted.findIndex(t => t.name === b.name)));
        setEarliestDone(true);
        toast({ title: "Calcul au plus tôt terminé!", description: "Le chemin critique a été calculé. Vous pouvez maintenant calculer les dates au plus tard." });
    }, [isCyclic, topologicallySorted, toast]);


    const handleCalculateLatest = useCallback(() => {
        if (!earliestDone || calculatedTasks.length === 0) {
            toast({ variant: "destructive", title: "Erreur", description: "Veuillez d'abord calculer les dates au plus tôt." });
            return;
        }

        const reversedSortedTasks = [...topologicallySorted].reverse();
        const projectFinishDate = Math.max(...calculatedTasks.map(t => t.ef ?? 0));
        
        let finalTasksMap = new Map<string, Task>(calculatedTasks.map(t => [t.name, {...t, lf: projectFinishDate}]));

        for(const currentTask of reversedSortedTasks) {
            const taskToUpdate = finalTasksMap.get(currentTask.name)!;
            const successors = topologicallySorted.filter(t => t.predecessors.split(',').map(p => p.trim()).includes(currentTask.name));
            const succTasks = successors.map(s => finalTasksMap.get(s.name)).filter((t): t is Task => !!t);

            const lf = succTasks.length > 0 ? Math.min(...succTasks.map(s => s.ls ?? Infinity)) : projectFinishDate;
            const ls = lf - taskToUpdate.duration;
            
            finalTasksMap.set(currentTask.name, {...taskToUpdate, ls, lf});
        }
        
        const finalTasksWithLatest = Array.from(finalTasksMap.values());
        
        setCalculatedTasks(finalTasksWithLatest.sort((a, b) => topologicallySorted.findIndex(t => t.name === a.name) - topologicallySorted.findIndex(t => t.name === b.name)));
        toast({ title: "Calcul au plus tard terminé!", description: "Les dates au plus tard ont été affichées." });
    }, [earliestDone, calculatedTasks, topologicallySorted, toast]);


    return (
        <TooltipProvider>
            <div className="flex flex-col min-h-screen bg-background text-foreground font-sans antialiased">
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
                            <p>Veuillez résoudre la boucle dans les prédécesseurs.</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </header>
                
                <main className="p-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-semibold mb-4">Saisie des Tâches</h2>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Nom de la Tâche</TableHead>
                                        <TableHead>Durée (jours)</TableHead>
                                        <TableHead>Prédécesseurs (séparés par virgule)</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.map((task) => (
                                        <TableRow key={task.id}>
                                            <TableCell>
                                                <Input
                                                    value={task.name}
                                                    onChange={(e) => handleTaskChange(task.id, 'name', e.target.value)}
                                                    placeholder="Ex: a, b, c..."
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={task.duration}
                                                    onChange={(e) => handleTaskChange(task.id, 'duration', parseInt(e.target.value, 10) || 0)}
                                                    placeholder="Ex: 5"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={task.predecessors}
                                                    onChange={(e) => handleTaskChange(task.id, 'predecessors', e.target.value)}
                                                    placeholder="Ex: a,b"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveTask(task.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-between mt-4">
                            <Button onClick={handleAddTask}>
                                <Plus className="mr-2 h-4 w-4" /> Ajouter une tâche
                            </Button>
                             <div className="flex gap-4">
                                <Button onClick={handleCalculateEarliest} disabled={isCyclic} size="lg" variant="outline">
                                    <ChevronsRight className="mr-2 h-5 w-5" /> Calculer au plus tôt & Chemin Critique
                                </Button>
                                <Button onClick={handleCalculateLatest} disabled={!earliestDone || isCyclic} size="lg">
                                    <ChevronsLeft className="mr-2 h-5 w-5" /> Calculer au plus tard
                                </Button>
                             </div>
                        </div>
                    </div>
                </main>

                <CalculationView tasks={calculatedTasks} criticalPath={criticalPath} />

                <Toaster />
            </div>
        </TooltipProvider>
    );
}

    