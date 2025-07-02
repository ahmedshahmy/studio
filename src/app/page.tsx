'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { GameStatus, Scenario } from '@/lib/types';
import { scenarios as defaultScenarios } from '@/lib/scenarios';
import { GameDashboard } from '@/components/game-dashboard';
import { GameOverDialog } from '@/components/game-over-dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Pencil } from 'lucide-react';

function ScenarioSelector({ scenarios, onSelectScenario }: { scenarios: Scenario[], onSelectScenario: (scenario: Scenario) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to NephroSim</CardTitle>
          <CardDescription className="text-lg">Select a clinical scenario to begin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{scenario.title}</CardTitle>
                <CardDescription>{scenario.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" onClick={() => onSelectScenario(scenario)}>Start Scenario</Button>
              </CardFooter>
            </Card>
          ))}
        </CardContent>
         <CardFooter className="flex-col items-center gap-2 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Want to create your own cases?</p>
            <Button variant="outline" asChild>
                <Link href="/editor">
                    <Pencil className="mr-2" />
                    Go to Scenario Editor
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Home() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('welcome');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    // This runs only on the client, where localStorage is available.
    try {
      const storedScenarios = localStorage.getItem('nephrosim-scenarios');
      if (storedScenarios) {
        setScenarios(JSON.parse(storedScenarios));
      } else {
        // If nothing is in localStorage, initialize with default scenarios
        setScenarios(defaultScenarios);
        localStorage.setItem('nephrosim-scenarios', JSON.stringify(defaultScenarios));
      }
    } catch (error) {
        console.error("Failed to parse scenarios from localStorage", error);
        // Fallback to default scenarios if parsing fails
        setScenarios(defaultScenarios);
        localStorage.setItem('nephrosim-scenarios', JSON.stringify(defaultScenarios));
    }
  }, []);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setGameStatus('playing');
  };

  const handleGameOver = (status: GameStatus) => {
    setGameStatus(status);
  };

  const handleRestart = () => {
    setSelectedScenario(null);
    setGameStatus('welcome');
  };

  return (
    <>
      {gameStatus === 'welcome' && <ScenarioSelector scenarios={scenarios} onSelectScenario={handleSelectScenario} />}
      {selectedScenario && gameStatus === 'playing' && (
        <GameDashboard scenario={selectedScenario} onGameOver={handleGameOver} />
      )}
      {selectedScenario && ['won', 'lost_time', 'lost_budget', 'lost_death'].includes(gameStatus) && (
        <GameOverDialog status={gameStatus} onRestart={handleRestart} />
      )}
    </>
  );
}
