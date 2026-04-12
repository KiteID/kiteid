export enum RegistrationState {
  IDLE = 'idle',
  CHECKING_AVAILABILITY = 'checking_availability',
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  CONFIGURING = 'configuring',
  COMMITTING = 'committing',
  COMMIT_PENDING = 'commit_pending',
  WAITING_MIN_AGE = 'waiting_min_age',
  READY_TO_REGISTER = 'ready_to_register',
  REGISTERING = 'registering',
  REGISTER_PENDING = 'register_pending',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export interface RegistrationEntry {
  name: string;
  secret: string;
  commitment: string;
  commitTxHash?: string;
  commitTimestamp?: number;
  owner: string;
  duration: string; // bigint serialized as string
  resolver: string;
  reverseRecord: boolean;
  state: RegistrationState;
  errorMessage?: string;
}

export interface RegistrationStore {
  registrations: Record<string, RegistrationEntry>;
  startRegistration: (
    name: string,
    params: {
      owner: `0x${string}`;
      duration: bigint;
      secret: `0x${string}`;
      commitment: `0x${string}`;
      resolver: `0x${string}`;
      reverseRecord: boolean;
    },
  ) => void;
  updateState: (name: string, state: RegistrationState, errorMessage?: string) => void;
  setCommitTx: (name: string, hash: string, timestamp: number) => void;
  clearRegistration: (name: string) => void;
  clearExpired: () => void;
  getRegistration: (name: string) => RegistrationEntry | undefined;
}
