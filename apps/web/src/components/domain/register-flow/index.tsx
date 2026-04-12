'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@kiteid/ui';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useRegisterFlow } from '@/hooks/use-register-flow';
import { TLD } from '@/lib/constants';
import { RegistrationState } from '@/stores/registration.types';
import { CommitStep } from './commit-step';
import { ConfigureStep } from './configure-step';
import { ErrorDisplay } from './error-display';
import { RegisterStep } from './register-step';
import { StepIndicator } from './step-indicator';
import { WaitStep } from './wait-step';

interface RegisterFlowProps {
  name: string;
}

const STEP_LABELS: [string, string, string] = ['Configure', 'Request', 'Register'];

function getStep(state: RegistrationState | undefined): 1 | 2 | 3 {
  switch (state) {
    case RegistrationState.CONFIGURING:
      return 1;
    case RegistrationState.COMMIT_READY:
    case RegistrationState.COMMITTING:
    case RegistrationState.COMMIT_PENDING:
    case RegistrationState.WAITING_MIN_AGE:
      return 2;
    case RegistrationState.READY_TO_REGISTER:
    case RegistrationState.REGISTERING:
    case RegistrationState.REGISTER_PENDING:
      return 3;
    default:
      return 1;
  }
}

export function RegisterFlow({ name }: RegisterFlowProps) {
  const router = useRouter();
  const {
    registration,
    timer,
    price,
    isCommitPending,
    isRegisterPending,
    initRegistration,
    submitCommit,
    submitRegister,
    retry,
  } = useRegisterFlow(name);

  const state = registration?.state;
  const currentStep = getStep(state);

  // Redirect to success page on completion
  useEffect(() => {
    if (state === RegistrationState.COMPLETED) {
      router.push(`/register/${encodeURIComponent(name)}/success`);
    }
  }, [state, name, router]);

  // Error state
  if (state === RegistrationState.ERROR) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {name}
            <span className="text-gold">{TLD}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorDisplay
            message={registration?.errorMessage ?? 'An unknown error occurred.'}
            onRetry={retry}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="text-center">
          Register <span className="text-carbon">{name}</span>
          <span className="text-gold">{TLD}</span>
        </CardTitle>
        <StepIndicator currentStep={currentStep} labels={STEP_LABELS} />
      </CardHeader>
      <CardContent>
        {/* Step 1: Configure (also shown when no registration exists yet) */}
        {(!state || state === RegistrationState.CONFIGURING) && (
          <ConfigureStep name={name} onContinue={initRegistration} />
        )}

        {/* Step 2: Commit */}
        {(state === RegistrationState.COMMIT_READY ||
          state === RegistrationState.COMMITTING ||
          state === RegistrationState.COMMIT_PENDING) && (
          <CommitStep
            onSubmit={submitCommit}
            isPending={isCommitPending}
            commitTxHash={registration?.commitTxHash}
            state={state}
          />
        )}

        {/* Step 2: Wait */}
        {state === RegistrationState.WAITING_MIN_AGE && <WaitStep timer={timer} />}

        {/* Step 3: Register */}
        {(state === RegistrationState.READY_TO_REGISTER ||
          state === RegistrationState.REGISTERING ||
          state === RegistrationState.REGISTER_PENDING) && (
          <RegisterStep
            onSubmit={submitRegister}
            isPending={isRegisterPending}
            price={price}
            state={state}
          />
        )}
      </CardContent>
    </Card>
  );
}
