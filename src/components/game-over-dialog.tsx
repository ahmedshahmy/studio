'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { GameStatus } from '@/lib/types';
import { Award, Frown, Hourglass, Skull, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const outcomes = {
  won: {
    title: 'Case Won!',
    description: "Congratulations! You've successfully stabilized the patient.",
    Icon: Award,
    color: 'text-green-500',
  },
  lost_time: {
    title: 'Out of Time',
    description: 'You ran out of time to treat the patient.',
    Icon: Hourglass,
    color: 'text-yellow-500',
  },
  lost_budget: {
    title: 'Budget Depleted',
    description: 'You ran out of funds before the patient could be stabilized.',
    Icon: Wallet,
    color: 'text-orange-500',
  },
  lost_death: {
    title: 'Patient Lost',
    description: 'The patient\\'s condition deteriorated beyond recovery.',
    Icon: Skull,
    color: 'text-destructive',
  },
  welcome: {
    title: 'Error',
    description: 'An unexpected game state was reached.',
    Icon: Frown,
    color: 'text-muted-foreground',
  },
  playing: {
    title: 'Error',
    description: 'An unexpected game state was reached.',
    Icon: Frown,
    color: 'text-muted-foreground',
  }
};

export function GameOverDialog({ status, onRestart }: { status: GameStatus; onRestart: () => void; }) {
  const { title, description, Icon, color } = outcomes[status];

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center text-center">
          <Icon className={cn("h-16 w-16 mb-4", color)} />
          <AlertDialogTitle className="text-2xl">{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onRestart} className="w-full">
            Play Another Case
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
