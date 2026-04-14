# Multi-Step Form Example

Handling multi-step wizards requires holding progressive state on the client until the final step. Here is the pattern using a single `useForm` instance spanning multiple render views.

## 1. Schema (`src/components/features/wizard/validations.ts`)

```ts
import { z } from 'zod';

export const step1Schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

export const step2Schema = z.object({
  company: z.string().min(1),
  role: z.enum(['developer', 'designer', 'manager']),
});

// The full schema is the intersection
export const wizardSchema = step1Schema.and(step2Schema);
export type WizardValues = z.infer<typeof wizardSchema>;
```

## 2. Client Wizard (`src/components/forms/wizard-form.tsx`)

```tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  wizardSchema,
  step1Schema,
  step2Schema,
  type WizardValues,
} from '@/lib/validations/wizard.schema';
import { submitWizardAction } from '@/actions/wizard.actions';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function WizardForm() {
  const [step, setStep] = React.useState(1);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      role: 'developer',
    },
    mode: 'onTouched', // Validates fields as the user interacts
  });

  // Validate only the current step before advancing
  const nextStep = async () => {
    let isValid = false;

    if (step === 1) {
      // Trigger validation specifically for Step 1 fields
      isValid = await form.trigger(['firstName', 'lastName']);
    }

    if (isValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = (values: WizardValues) => {
    startTransition(async () => {
      const result = await submitWizardAction(values);
      if (result?.success) {
        setStep(3); // Success View
      } else {
        // Handle global or field errors from server
      }
    });
  };

  // --- Views ---

  if (step === 3) {
    return (
      <div>
        <h3>Success!</h3>
        <p>Your data was saved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-between text-sm text-muted-foreground mb-4">
        <span>Step {step} of 2</span>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <div>
            <label>First Name</label>
            <Input {...form.register('firstName')} />
            {form.formState.errors.firstName && (
              <span className="text-destructive text-sm">
                {form.formState.errors.firstName.message}
              </span>
            )}
          </div>
          <div>
            <label>Last Name</label>
            <Input {...form.register('lastName')} />
          </div>

          <Button type="button" onClick={nextStep}>
            Next step
          </Button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <div>
            <label>Company</label>
            <Input {...form.register('company')} />
          </div>
          <div>
            <label>Role</label>
            <select {...form.register('role')} className="border p-2 rounded">
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Submit'}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
```
