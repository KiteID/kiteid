'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FadeIn } from '@/components/motion';
import { useRegisterFlow } from '@/hooks/use-register-flow';
import { celebrationConfetti } from '@/lib/confetti';
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

const STEP_LABELS: [string, string, string, string] = ['Configure', 'Commit', 'Wait', 'Register'];

function getStep(state: RegistrationState | undefined): 1 | 2 | 3 | 4 {
  switch (state) {
    case RegistrationState.CONFIGURING:
      return 1;
    case RegistrationState.COMMIT_READY:
    case RegistrationState.COMMITTING:
    case RegistrationState.COMMIT_PENDING:
      return 2;
    case RegistrationState.WAITING_MIN_AGE:
      return 3;
    case RegistrationState.READY_TO_REGISTER:
    case RegistrationState.REGISTERING:
    case RegistrationState.REGISTER_PENDING:
      return 4;
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

  // Redirect to success page on completion — fire confetti before transition
  useEffect(() => {
    if (state === RegistrationState.COMPLETED) {
      celebrationConfetti();
      router.push(`/register/${encodeURIComponent(name)}/success`);
    }
  }, [state, name, router]);

  // Error state
  if (state === RegistrationState.ERROR) {
    return (
      <div className="rounded-2xl border border-sand-core bg-cream p-6 shadow-kid-md sm:p-8">
        <ErrorDisplay
          message={registration?.errorMessage ?? 'An unknown error occurred.'}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sand-core bg-cream p-6 shadow-kid-md sm:p-8">
      <StepIndicator currentStep={currentStep} labels={STEP_LABELS} />
      <div className="mt-8">
        {/* Step 1: Configure */}
        {(!state || state === RegistrationState.CONFIGURING) && (
          <FadeIn key="configure">
            <ConfigureStep name={name} onContinue={initRegistration} />
          </FadeIn>
        )}

        {/* Step 2: Commit */}
        {(state === RegistrationState.COMMIT_READY ||
          state === RegistrationState.COMMITTING ||
          state === RegistrationState.COMMIT_PENDING) && (
          <FadeIn key="commit">
            <CommitStep
              onSubmit={submitCommit}
              isPending={isCommitPending}
              commitTxHash={registration?.commitTxHash}
              state={state}
            />
          </FadeIn>
        )}

        {/* Step 3: Wait */}
        {state === RegistrationState.WAITING_MIN_AGE && (
          <FadeIn key="wait">
            <WaitStep timer={timer} commitTxHash={registration?.commitTxHash} />
          </FadeIn>
        )}

        {/* Step 4: Register */}
        {(state === RegistrationState.READY_TO_REGISTER ||
          state === RegistrationState.REGISTERING ||
          state === RegistrationState.REGISTER_PENDING) && (
          <FadeIn key="register">
            <RegisterStep
              onSubmit={submitRegister}
              isPending={isRegisterPending}
              price={price}
              state={state}
              name={name}
            />
          </FadeIn>
        )}
      </div>
    </div>
  );
}
