'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Scenario, GameStatus, PatientParameters, GameEvent, Intervention } from '@/lib/types';

// Using a more robust cloning method
const deepClone = <T>(obj: T): T => {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    // Fallback for older environments, though Next.js envs should have it.
    return JSON.parse(JSON.stringify(obj));
};


export const useGameEngine = (scenario: Scenario, onGameOver: (status: GameStatus) => void) => {
  const [status, setStatus] = useState<GameStatus>('playing');
  const [timeLeft, setTimeLeft] = useState(scenario.timeLimit);
  const [budget, setBudget] = useState(scenario.initialBudget);
  const [patientParams, setPatientParams] = useState<PatientParameters>(() => 
    deepClone({ ...scenario.initialClinicalParams, ...scenario.initialLabParams })
  );
  const [log, setLog] = useState<GameEvent[]>([]);

  const addLog = useCallback((message: string, type: GameEvent['type']) => {
    // This state update depends on the `timeLeft` which is also changing,
    // so we get it directly to avoid stale closures.
    setTimeLeft(currentTime => {
      setLog(prevLog => [{ time: currentTime, message, type }, ...prevLog.slice(0, 49)]);
      return currentTime;
    });
  }, [setLog, setTimeLeft]);

  // Main game loop
  useEffect(() => {
    if (status !== 'playing') return;

    const gameTick = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      
      setPatientParams(prevParams => {
        const newParams = deepClone(prevParams);
        // Natural deterioration
        for (const key in newParams) {
          const param = newParams[key];
          const newValue = parseFloat((param.value + param.deteriorationRate).toFixed(2));
          newParams[key] = { ...param, value: newValue };
        }
        return newParams;
      });

    }, 1000);

    return () => clearInterval(gameTick);
  }, [status]);
  
  // Check for end conditions
  useEffect(() => {
    if (status !== 'playing') return;

    // Time's up
    if (timeLeft <= 0) {
      addLog('Time is up!', 'critical');
      setStatus('lost_time');
      onGameOver('lost_time');
      return;
    }

    // Patient death conditions
    const systolicBP = patientParams['Blood Pressure Systolic']?.value;
    const heartRate = patientParams['Heart Rate']?.value;
    const potassium = patientParams['Potassium (K+)']?.value;

    if (systolicBP < 60 || heartRate > 180 || heartRate < 40 || potassium > 8.5) {
      addLog('Patient has arrested!', 'critical');
      setStatus('lost_death');
      onGameOver('lost_death');
      return;
    }

    // Win condition
    const allParamsNormal = Object.values(patientParams).every(p => 
        p.value >= p.normalRange[0] && p.value <= p.normalRange[1]
    );

    if (allParamsNormal) {
      addLog('Patient is stable! Case won.', 'system');
      setStatus('won');
      onGameOver('won');
    }

  }, [timeLeft, patientParams, status, onGameOver, addLog]);

  const applyIntervention = useCallback((interventionId: string) => {
    if (status !== 'playing') return;

    const intervention = scenario.availableInterventions.find(i => i.id === interventionId);
    if (!intervention) {
      addLog(`Error: Intervention ${interventionId} not found.`, 'system');
      return;
    }
    
    if (budget < intervention.cost) {
      addLog(`Insufficient budget for ${intervention.name}.`, 'critical');
      if (budget <= 0) {
          setStatus('lost_budget');
          onGameOver('lost_budget');
      }
      return;
    }

    setBudget(prev => prev - intervention.cost);
    addLog(`Applied: ${intervention.name}. Cost: $${intervention.cost}`, 'intervention');

    setPatientParams(prevParams => {
      const newParams = deepClone(prevParams);
      for (const key in intervention.effects) {
        if (newParams[key]) {
          const change = intervention.effects[key as keyof PatientParameters]!;
          const oldValue = newParams[key].value;
          const newValue = parseFloat((oldValue + change).toFixed(2));
          newParams[key].value = newValue;
          
          const changeText = change > 0 ? `increased to ${newValue}` : `decreased to ${newValue}`;
          addLog(`${key} ${changeText}.`, 'change');
        }
      }
      return newParams;
    });

  }, [budget, scenario.availableInterventions, addLog, status, onGameOver]);

  return { status, timeLeft, budget, patientParams, log, applyIntervention };
};
