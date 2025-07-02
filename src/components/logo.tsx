import { Stethoscope } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-2xl font-bold text-primary">
      <Stethoscope className="h-8 w-8" />
      <h1 className="font-headline">NephroSim</h1>
    </div>
  );
}
