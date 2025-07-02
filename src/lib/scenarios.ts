import type { Scenario } from './types';

export const scenarios: Scenario[] = [
  {
    id: 'aki-sepsis',
    title: 'Acute Kidney Injury secondary to Sepsis',
    description: 'A 68-year-old male is admitted from the ER with fever, hypotension, and decreased urine output.',
    patient: {
      name: 'John Doe',
      age: 68,
      sex: 'Male',
      history: 'History of type 2 diabetes and hypertension. No known prior kidney disease.',
    },
    initialBudget: 5000,
    timeLimit: 300, // 5 minutes
    initialClinicalParams: {
      'Heart Rate': { value: 120, unit: 'bpm', normalRange: [60, 100], deteriorationRate: 0.1 },
      'Blood Pressure Systolic': { value: 85, unit: 'mmHg', normalRange: [90, 120], deteriorationRate: -0.2 },
      'Respiratory Rate': { value: 24, unit: 'breaths/min', normalRange: [12, 20], deteriorationRate: 0.05 },
      'Temperature': { value: 39.1, unit: '°C', normalRange: [36.5, 37.5], deteriorationRate: 0 },
      'Urine Output': { value: 15, unit: 'ml/hr', normalRange: [30, 100], deteriorationRate: -0.1 },
    },
    initialLabParams: {
      'Creatinine': { value: 2.5, unit: 'mg/dL', normalRange: [0.6, 1.2], deteriorationRate: 0.005 },
      'Potassium (K+)': { value: 5.2, unit: 'mEq/L', normalRange: [3.5, 5.0], deteriorationRate: 0.002 },
      'Sodium (Na+)': { value: 135, unit: 'mEq/L', normalRange: [135, 145], deteriorationRate: 0 },
      'Bicarbonate (HCO3)': { value: 18, unit: 'mEq/L', normalRange: [22, 28], deteriorationRate: -0.01 },
      'Lactate': { value: 4.0, unit: 'mmol/L', normalRange: [0.5, 1.0], deteriorationRate: 0.01 },
    },
    availableInterventions: [
      { id: 'ivf-bolus', name: 'IV Fluid Bolus (500ml)', cost: 150, description: 'Increases intravascular volume.', effects: { 'Blood Pressure Systolic': 10, 'Urine Output': 5 } },
      { id: 'vasopressor', name: 'Start Vasopressor', cost: 800, description: 'Increases systemic vascular resistance.', effects: { 'Blood Pressure Systolic': 20, 'Heart Rate': -5 } },
      { id: 'antibiotics', name: 'Broad-Spectrum Antibiotics', cost: 500, description: 'Treats underlying infection. Effects are not immediate.', effects: {} },
      { id: 'insulin-drip', name: 'Insulin Drip for Hyperkalemia', cost: 300, description: 'Shifts potassium into cells.', effects: { 'Potassium (K+)': -0.5 } },
      { id: 'bicarb-amp', name: 'Sodium Bicarbonate Ampule', cost: 200, description: 'Corrects metabolic acidosis.', effects: { 'Bicarbonate (HCO3)': 2 } },
      { id: 'dialysis', name: 'Urgent Hemodialysis', cost: 2500, description: 'Removes waste products and excess fluid.', effects: { 'Creatinine': -1.0, 'Potassium (K+)': -1.0, 'Bicarbonate (HCO3)': 3, 'Lactate': -1.0 } },
    ],
  },
  {
    id: 'hyperkalemia-esrd',
    title: 'Severe Hyperkalemia in ESRD',
    description: 'A 55-year-old female with End-Stage Renal Disease (ESRD) on hemodialysis presents with weakness after missing a dialysis session.',
    patient: {
      name: 'Jane Smith',
      age: 55,
      sex: 'Female',
      history: 'ESRD due to polycystic kidney disease, on hemodialysis 3x/week. Missed yesterday\'s session.',
    },
    initialBudget: 3000,
    timeLimit: 300, // 5 minutes
    initialClinicalParams: {
        'Heart Rate': { value: 50, unit: 'bpm', normalRange: [60, 100], deteriorationRate: -0.1 },
        'Blood Pressure Systolic': { value: 150, unit: 'mmHg', normalRange: [90, 120], deteriorationRate: 0 },
        'Respiratory Rate': { value: 18, unit: 'breaths/min', normalRange: [12, 20], deteriorationRate: 0 },
        'Temperature': { value: 37.0, unit: '°C', normalRange: [36.5, 37.5], deteriorationRate: 0 },
        'Urine Output': { value: 0, unit: 'ml/hr', normalRange: [30, 100], deteriorationRate: 0 },
    },
    initialLabParams: {
        'Creatinine': { value: 8.9, unit: 'mg/dL', normalRange: [0.6, 1.2], deteriorationRate: 0.01 },
        'Potassium (K+)': { value: 7.8, unit: 'mEq/L', normalRange: [3.5, 5.0], deteriorationRate: 0.005 },
        'Sodium (Na+)': { value: 140, unit: 'mEq/L', normalRange: [135, 145], deteriorationRate: 0 },
        'Bicarbonate (HCO3)': { value: 15, unit: 'mEq/L', normalRange: [22, 28], deteriorationRate: -0.01 },
        'Calcium': { value: 8.0, unit: 'mg/dL', normalRange: [8.5, 10.2], deteriorationRate: -0.005 },
    },
    availableInterventions: [
        { id: 'calcium-gluconate', name: 'IV Calcium Gluconate', cost: 100, description: 'Stabilizes cardiac membrane.', effects: { 'Heart Rate': 5 } },
        { id: 'insulin-dextrose', name: 'IV Insulin & Dextrose', cost: 350, description: 'Shifts potassium into cells.', effects: { 'Potassium (K+)': -0.8 } },
        { id: 'albuterol', name: 'Nebulized Albuterol', cost: 50, description: 'Aids in shifting potassium intracellularly.', effects: { 'Potassium (K+)': -0.3, 'Heart Rate': 10 } },
        { id: 'kayexalate', name: 'Kayexalate (SPS)', cost: 80, description: 'Removes potassium via the GI tract. Slow acting.', effects: {} },
        { id: 'dialysis-urgent', name: 'Urgent Hemodialysis', cost: 2500, description: 'Definitive treatment for hyperkalemia.', effects: { 'Creatinine': -2.0, 'Potassium (K+)': -2.5, 'Bicarbonate (HCO3)': 5 } },
    ],
  },
];
