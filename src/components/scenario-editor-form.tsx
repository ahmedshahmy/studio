
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Scenario, Intervention, Parameter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash, PlusCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Zod schemas for validation
const parameterSchema = z.object({
  value: z.coerce.number(),
  unit: z.string().min(1),
  normalRange: z.tuple([z.coerce.number(), z.coerce.number()]),
  deteriorationRate: z.coerce.number(),
});

const interventionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cost: z.coerce.number().min(0),
  description: z.string(),
  // Allow strings for a better editing experience. This will be parsed in onSubmit.
  effects: z.record(z.string(), z.string().optional()),
});

const scenarioSchema = z.object({
  id: z.string(),
  title: z.string().min(3, 'Title is required.'),
  description: z.string().min(10, 'Description is required.'),
  patient: z.object({
    name: z.string().min(1, 'Patient name is required.'),
    age: z.coerce.number().min(0).max(120),
    sex: z.enum(['Male', 'Female']),
    history: z.string().min(1, 'Patient history is required.'),
  }),
  initialBudget: z.coerce.number().min(0),
  timeLimit: z.coerce.number().min(1),
  initialClinicalParams: z.record(z.string(), parameterSchema),
  initialLabParams: z.record(z.string(), parameterSchema),
  availableInterventions: z.array(interventionSchema),
});

// Helper to convert object to array for form
const paramsToArray = (params: Record<string, Parameter>) => {
    return Object.entries(params).map(([key, value]) => ({ name: key, ...value }));
}
// Helper to convert array back to object for saving
const arrayToParams = (arr: {name: string, value: number, unit: string, normalRange: [number, number], deteriorationRate: number}[]) => {
    return arr.reduce((acc, curr) => {
        if (curr.name) {
            acc[curr.name] = { value: curr.value, unit: curr.unit, normalRange: curr.normalRange, deteriorationRate: curr.deteriorationRate };
        }
        return acc;
    }, {} as Record<string, Parameter>);
}

export function ScenarioEditorForm({ scenario, onSave, onCancel, onDelete }: { scenario: Scenario, onSave: (data: Scenario) => void, onCancel: () => void, onDelete: (id: string) => void }) {
  const form = useForm({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
        ...scenario,
        initialClinicalParams: paramsToArray(scenario.initialClinicalParams),
        initialLabParams: paramsToArray(scenario.initialLabParams),
        // Convert effects numbers to strings for form editing
        availableInterventions: scenario.availableInterventions.map(iv => ({
            ...iv,
            effects: Object.fromEntries(Object.entries(iv.effects).map(([k, v]) => [k, String(v)]))
        }))
    },
  });

  const { fields: clinicalFields, append: appendClinical, remove: removeClinical } = useFieldArray({ control: form.control, name: "initialClinicalParams" as any });
  const { fields: labFields, append: appendLab, remove: removeLab } = useFieldArray({ control: form.control, name: "initialLabParams" as any });
  const { fields: interventionFields, append: appendIntervention, remove: removeIntervention } = useFieldArray({ control: form.control, name: "availableInterventions" });

  const onSubmit = (data: any) => {
    // Manually parse intervention effects from string to number, filtering empty/invalid ones.
    const parsedInterventions = data.availableInterventions.map((intervention: any) => {
        const parsedEffects: Record<string, number> = {};
        if (intervention.effects) {
            for (const key in intervention.effects) {
                const value = intervention.effects[key];
                if (value !== null && value !== undefined && value !== '') {
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                        parsedEffects[key] = num;
                    }
                }
            }
        }
        return { ...intervention, effects: parsedEffects };
    });

    const finalData = {
        ...data,
        initialClinicalParams: arrayToParams(data.initialClinicalParams),
        initialLabParams: arrayToParams(data.initialLabParams),
        availableInterventions: parsedInterventions,
    };
    onSave(finalData);
  };

  const allParamNames = [...new Set([...form.watch('initialClinicalParams' as any), ...form.watch('initialLabParams' as any)].map(p => p.name).filter(Boolean))];

  const handleAddIntervention = () => {
    const newEffects: Record<string, string> = {};
    // Pre-populate effects for all existing parameters to ensure fields are registered
    allParamNames.forEach(paramName => {
      newEffects[paramName] = '';
    });
    
    appendIntervention({
      id: `new-intervention-${Date.now()}`, // Add a unique default ID to pass validation
      name: '',
      cost: 0,
      description: '',
      effects: newEffects,
    });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Scenario Details</CardTitle>
            <CardDescription>Basic information about the clinical case.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="patient.name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="patient.age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="patient.sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="patient.history" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>History</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Game Parameters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="initialBudget" render={({ field }) => (<FormItem><FormLabel>Initial Budget ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="timeLimit" render={({ field }) => (<FormItem><FormLabel>Time Limit (seconds)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Initial Clinical Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {clinicalFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 border rounded-md items-end">
                       <FormField control={form.control} name={`initialClinicalParams.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} placeholder="Heart Rate" /></FormControl></FormItem>)} />
                       <FormField control={form.control} name={`initialClinicalParams.${index}.value`} render={({ field }) => (<FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                       <FormField control={form.control} name={`initialClinicalParams.${index}.unit`} render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><FormControl><Input {...field} placeholder="bpm"/></FormControl></FormItem>)} />
                       <FormField control={form.control} name={`initialClinicalParams.${index}.normalRange.0`} render={({ field }) => (<FormItem><FormLabel>Normal Min</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                       <FormField control={form.control} name={`initialClinicalParams.${index}.normalRange.1`} render={({ field }) => (<FormItem><FormLabel>Normal Max</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                       <div className="flex items-center gap-2">
                           <FormField control={form.control} name={`initialClinicalParams.${index}.deteriorationRate`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Deterioration/sec</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl></FormItem>)} />
                           <Button type="button" variant="destructive" size="icon" onClick={() => removeClinical(index)}><Trash/></Button>
                       </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendClinical({ name: '', value: 0, unit: '', normalRange: [0,0], deteriorationRate: 0 })}><PlusCircle className="mr-2"/>Add Clinical Parameter</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Initial Laboratory Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 {labFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 border rounded-md items-end">
                       <FormField control={form.control} name={`initialLabParams.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} placeholder="Creatinine" /></FormControl></FormItem>)} />
                       <FormField control={form.control} name={`initialLabParams.${index}.value`} render={({ field }) => (<FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl></FormItem>)} />
                       <FormField control={form.control} name={`initialLabParams.${index}.unit`} render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><FormControl><Input {...field} placeholder="mg/dL"/></FormControl></FormItem>)} />
                       <FormField control={form.control} name={`initialLabParams.${index}.normalRange.0`} render={({ field }) => (<FormItem><FormLabel>Normal Min</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl></FormItem>)} />
                       <FormField control={form.control} name={`initialLabParams.${index}.normalRange.1`} render={({ field }) => (<FormItem><FormLabel>Normal Max</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl></FormItem>)} />
                       <div className="flex items-center gap-2">
                           <FormField control={form.control} name={`initialLabParams.${index}.deteriorationRate`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Deterioration/sec</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl></FormItem>)} />
                           <Button type="button" variant="destructive" size="icon" onClick={() => removeLab(index)}><Trash/></Button>
                       </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendLab({ name: '', value: 0, unit: '', normalRange: [0,0], deteriorationRate: 0 })}><PlusCircle className="mr-2"/>Add Lab Parameter</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Available Interventions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {interventionFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-start">
                             <h4 className="text-lg font-semibold mb-2">Intervention #{index + 1}</h4>
                             <Button type="button" variant="destructive" size="icon" onClick={() => removeIntervention(index)}><Trash/></Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <FormField control={form.control} name={`availableInterventions.${index}.id`} render={({ field }) => (<FormItem><FormLabel>ID</FormLabel><FormControl><Input {...field} placeholder="ivf-bolus"/></FormControl></FormItem>)} />
                             <FormField control={form.control} name={`availableInterventions.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} placeholder="IV Fluid Bolus (500ml)"/></FormControl></FormItem>)} />
                             <FormField control={form.control} name={`availableInterventions.${index}.cost`} render={({ field }) => (<FormItem><FormLabel>Cost ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        </div>
                         <FormField control={form.control} name={`availableInterventions.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                        <div>
                            <Label>Effects</Label>
                            <CardDescription>Define how this intervention affects patient parameters.</CardDescription>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                {allParamNames.map((paramName) => (
                                    <FormField
                                        key={`${field.id}-${paramName}`}
                                        control={form.control}
                                        name={`availableInterventions.${index}.effects.${paramName}`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{paramName}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    placeholder="e.g. -0.5 or 10"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                 <Button type="button" variant="outline" onClick={handleAddIntervention}><PlusCircle className="mr-2"/>Add Intervention</Button>
            </CardContent>
        </Card>

        <CardFooter className="flex justify-between">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!scenario.id.startsWith('custom-') }>Delete Scenario</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this scenario.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(scenario.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Scenario</Button>
            </div>
        </CardFooter>
      </form>
    </Form>
  );
}

    