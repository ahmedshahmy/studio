export interface Parameter {
  value: number;
  unit: string;
  normalRange: [number, number];
  deteriorationRate: number; // How much the value changes per second naturally
}

export type PatientParameters = Record<string, Parameter>;

export interface Intervention {
  id: string;
  name: string;
  cost: number;
  description: string;
  effects: Partial<Record<keyof PatientParameters, number>>;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  patient: {
    name: string;
    age: number;
    sex: 'Male' | 'Female';
    history: string;
  };
  initialBudget: number;
  timeLimit: number; // in seconds
  initialClinicalParams: PatientParameters;
  initialLabParams: PatientParameters;
  availableInterventions: Intervention[];
}

export type GameStatus = 'welcome' | 'playing' | 'won' | 'lost_time' | 'lost_budget' | 'lost_death';

export interface GameEvent {
  time: number;
  message: string;
  type: 'intervention' | 'change' | 'system' | 'critical';
}
