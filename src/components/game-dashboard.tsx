'use client';

import type { Scenario, GameStatus } from '@/lib/types';
import { useGameEngine } from '@/hooks/use-game-engine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo, useEffect } from 'react';
import { User, HeartPulse, FlaskConical, CircleDollarSign, Timer, ListCollapse, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

function ParameterItem({ name, param }: { name: string; param: any }) {
    const isNormal = param.value >= param.normalRange[0] && param.value <= param.normalRange[1];
    const [flash, setFlash] = useState('');

    useEffect(() => {
        setFlash(isNormal ? 'flash-green' : 'flash-red');
        const timer = setTimeout(() => setFlash(''), 500);
        return () => clearTimeout(timer);
    }, [param.value, isNormal]);
    
    return (
        <div className={`flex justify-between items-baseline p-2 rounded-md ${flash}`}>
            <style jsx>{`
                @keyframes flash-green { 0%, 100% { background-color: transparent; } 50% { background-color: rgba(74, 222, 128, 0.2); } }
                @keyframes flash-red { 0%, 100% { background-color: transparent; } 50% { background-color: rgba(248, 113, 113, 0.2); } }
                .flash-green { animation: flash-green 0.5s ease-out; }
                .flash-red { animation: flash-red 0.5s ease-out; }
            `}</style>
            <span className="font-medium text-sm">{name}</span>
            <div className="text-right">
                <span className={cn("text-lg font-bold tabular-nums", !isNormal && "text-destructive")}>
                    {param.value.toFixed(param.unit === '°C' || param.unit === 'mg/dL' ? 1 : 2)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">{param.unit}</span>
                <p className="text-xs text-muted-foreground">({param.normalRange[0]} - {param.normalRange[1]})</p>
            </div>
        </div>
    );
}

export function GameDashboard({ scenario, onGameOver }: { scenario: Scenario; onGameOver: (status: GameStatus) => void; }) {
    const { timeLeft, budget, patientParams, log, applyIntervention } = useGameEngine(scenario, onGameOver);
    const [selectedIntervention, setSelectedIntervention] = useState<string>('');

    const clinicalParams = useMemo(() => Object.fromEntries(Object.entries(patientParams).filter(([key]) => key in scenario.initialClinicalParams)), [patientParams, scenario.initialClinicalParams]);
    const labParams = useMemo(() => Object.fromEntries(Object.entries(patientParams).filter(([key]) => key in scenario.initialLabParams)), [patientParams, scenario.initialLabParams]);

    const handleApplyIntervention = () => {
        if (selectedIntervention) {
            applyIntervention(selectedIntervention);
        }
    };
    
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="flex items-center justify-between p-4 border-b bg-card">
                 <h1 className="text-xl font-bold font-headline">{scenario.title}</h1>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <CircleDollarSign className="w-6 h-6" />
                        <span className="text-lg tabular-nums">${budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-destructive font-bold">
                        <Timer className="w-6 h-6" />
                        <span className="text-lg tabular-nums">{formatTime(timeLeft)}</span>
                    </div>
                 </div>
            </header>
            <main className="flex-1 overflow-hidden p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                    <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
                        <Card>
                             <CardHeader className="flex flex-row items-center gap-2">
                                <User className="w-5 h-5 text-primary"/>
                                <CardTitle className="text-lg">Patient Details</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <p><strong>Name:</strong> {scenario.patient.name}</p>
                                <p><strong>Age:</strong> {scenario.patient.age} ({scenario.patient.sex})</p>
                                <p><strong>History:</strong> {scenario.patient.history}</p>
                            </CardContent>
                        </Card>
                         <div className="grid md:grid-cols-2 gap-4 flex-1 overflow-hidden">
                             <Card className="flex flex-col">
                                 <CardHeader className="flex flex-row items-center gap-2">
                                    <HeartPulse className="w-5 h-5 text-primary"/>
                                    <CardTitle className="text-lg">Clinical Parameters</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-hidden">
                                    <ScrollArea className="h-full">
                                        <div className="space-y-2 pr-4">
                                            {Object.entries(clinicalParams).map(([key, param]) => <ParameterItem key={key} name={key} param={param} />)}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                             </Card>
                              <Card className="flex flex-col">
                                 <CardHeader className="flex flex-row items-center gap-2">
                                    <FlaskConical className="w-5 h-5 text-primary"/>
                                    <CardTitle className="text-lg">Laboratory Results</CardTitle>
                                 </CardHeader>
                                 <CardContent className="flex-1 overflow-hidden">
                                     <ScrollArea className="h-full">
                                        <div className="space-y-2 pr-4">
                                            {Object.entries(labParams).map(([key, param]) => <ParameterItem key={key} name={key} param={param} />)}
                                        </div>
                                    </ScrollArea>
                                 </CardContent>
                             </Card>
                         </div>
                    </div>
                    <div className="flex flex-col gap-4 overflow-hidden">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2">
                                <Pill className="w-5 h-5 text-primary"/>
                                <CardTitle className="text-lg">Interventions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <Select value={selectedIntervention} onValueChange={setSelectedIntervention}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an intervention..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scenario.availableInterventions.map(int => (
                                            <SelectItem key={int.id} value={int.id}>
                                                <div className="flex justify-between w-full">
                                                    <span>{int.name}</span>
                                                    <span className="text-muted-foreground">${int.cost}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                 <Button className="w-full" onClick={handleApplyIntervention} disabled={!selectedIntervention}>
                                    Apply Intervention
                                 </Button>
                            </CardContent>
                        </Card>
                        <Card className="flex-1 flex flex-col overflow-hidden">
                            <CardHeader className="flex flex-row items-center gap-2">
                                <ListCollapse className="w-5 h-5 text-primary"/>
                                <CardTitle className="text-lg">Event Log</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto">
                                <ScrollArea className="h-full">
                                <div className="space-y-2 pr-4">
                                    {log.map((event, index) => (
                                        <div key={index} className="text-sm">
                                            <span className="font-mono text-muted-foreground mr-2">[{formatTime(event.time)}]</span>
                                            <span className={cn(
                                                event.type === 'intervention' && 'font-bold text-accent-foreground bg-accent/80 px-1 rounded-sm',
                                                event.type === 'critical' && 'font-bold text-destructive-foreground bg-destructive px-1 rounded-sm'
                                            )}>{event.message}</span>
                                        </div>
                                    ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
