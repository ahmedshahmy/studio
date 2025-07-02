'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scenario } from '@/lib/types';
import { scenarios as defaultScenarios } from '@/lib/scenarios';
import { ScenarioEditorForm } from '@/components/scenario-editor-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, PlusCircle } from 'lucide-react';

export default function EditorPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedScenarios = localStorage.getItem('nephrosim-scenarios');
      if (storedScenarios) {
        const parsed = JSON.parse(storedScenarios);
        if (Array.isArray(parsed)) {
            setScenarios(parsed);
            return;
        }
      }
      setScenarios(defaultScenarios);
      localStorage.setItem('nephrosim-scenarios', JSON.stringify(defaultScenarios));
    } catch (error) {
      console.error("Failed to parse scenarios from localStorage", error);
      setScenarios(defaultScenarios);
      localStorage.setItem('nephrosim-scenarios', JSON.stringify(defaultScenarios));
    }
  }, []);

  const handleSaveScenario = (data: Scenario) => {
    let updatedScenarios;
    const existingIndex = scenarios.findIndex(s => s.id === data.id);

    if (existingIndex > -1) {
      updatedScenarios = [...scenarios];
      updatedScenarios[existingIndex] = data;
    } else {
      updatedScenarios = [...scenarios, data];
    }

    setScenarios(updatedScenarios);
    localStorage.setItem('nephrosim-scenarios', JSON.stringify(updatedScenarios));
    setSelectedScenario(null); // Go back to list view
  };

  const handleCreateNew = () => {
    // A simple way to generate a unique enough ID for this context
    const newId = `custom-${new Date().getTime()}`;
    const newScenarioTemplate: Scenario = {
      id: newId,
      title: 'New Custom Scenario',
      description: '',
      patient: { name: '', age: 0, sex: 'Male', history: '' },
      initialBudget: 5000,
      timeLimit: 300,
      initialClinicalParams: {},
      initialLabParams: {},
      availableInterventions: [],
    };
    setSelectedScenario(newScenarioTemplate);
  };
  
  const handleDeleteScenario = (id: string) => {
      const updatedScenarios = scenarios.filter(s => s.id !== id);
      setScenarios(updatedScenarios);
      localStorage.setItem('nephrosim-scenarios', JSON.stringify(updatedScenarios));
      setSelectedScenario(null);
  }

  if (selectedScenario) {
    return (
      <div className="container mx-auto p-4">
        <ScenarioEditorForm
          scenario={selectedScenario}
          onSave={handleSaveScenario}
          onCancel={() => setSelectedScenario(null)}
          onDelete={handleDeleteScenario}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Scenario Editor</h1>
            <Button asChild variant="outline">
                <Link href="/"><Home className="mr-2"/> Back to Home</Link>
            </Button>
        </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Existing Scenarios</CardTitle>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="mr-2"/> Create New Scenario
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {scenarios.map(scenario => (
              <div key={scenario.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-semibold">{scenario.title}</p>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {!scenario.id.startsWith('custom-') && <span className="text-xs text-muted-foreground">(Default)</span>}
                    <Button variant="secondary" onClick={() => setSelectedScenario(scenario)}>Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
