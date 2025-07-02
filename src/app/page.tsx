'use client';

import { useState } from 'react';
import type { GameStatus, Scenario } from '@/lib/types';
import { scenarios } from '@/lib/scenarios';
import { GameDashboard } from '@/components/game-dashboard';
import { GameOverDialog } from '@/components/game-over-dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

function ScenarioSelector({ onSelectScenario }: { onSelectScenario: (scenario: Scenario) => void }) {
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
      </Card>
    </div>
  );
}

export default function Home() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('welcome');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

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
      {gameStatus === 'welcome' && <ScenarioSelector onSelectScenario={handleSelectScenario} />}
      {selectedScenario && gameStatus === 'playing' && (
        <GameDashboard scenario={selectedScenario} onGameOver={handleGameOver} />
      )}
      {selectedScenario && ['won', 'lost_time', 'lost_budget', 'lost_death'].includes(gameStatus) && (
        <GameOverDialog status={gameStatus} onRestart={handleRestart} />
      )}
    </>
  );
}
