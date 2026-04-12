import { beforeEach, describe, expect, it } from 'vitest';
import { useRegistrationStore } from '../registration';
import { RegistrationState } from '../registration.types';

describe('RegistrationStore', () => {
  beforeEach(() => {
    useRegistrationStore.setState({ registrations: {} });
  });

  const mockParams = {
    owner: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    duration: 31536000n,
    secret: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as `0x${string}`,
    commitment:
      '0x1111111111111111111111111111111111111111111111111111111111111111' as `0x${string}`,
    resolver: '0x2222222222222222222222222222222222222222' as `0x${string}`,
    reverseRecord: true,
  };

  it('should start a registration', () => {
    const store = useRegistrationStore.getState();
    store.startRegistration('test', mockParams);
    const reg = store.getRegistration('test');
    expect(reg).toBeDefined();
    expect(reg?.state).toBe(RegistrationState.CONFIGURING);
    expect(reg?.name).toBe('test');
    expect(reg?.owner).toBe(mockParams.owner);
  });

  it('should update state', () => {
    const store = useRegistrationStore.getState();
    store.startRegistration('test', mockParams);
    store.updateState('test', RegistrationState.COMMITTING);
    expect(store.getRegistration('test')?.state).toBe(RegistrationState.COMMITTING);
  });

  it('should update state with error message', () => {
    const store = useRegistrationStore.getState();
    store.startRegistration('test', mockParams);
    store.updateState('test', RegistrationState.ERROR, 'Something went wrong');
    const reg = store.getRegistration('test');
    expect(reg?.state).toBe(RegistrationState.ERROR);
    expect(reg?.errorMessage).toBe('Something went wrong');
  });

  it('should set commit tx', () => {
    const store = useRegistrationStore.getState();
    store.startRegistration('test', mockParams);
    store.setCommitTx('test', '0xhash', 1000);
    const reg = store.getRegistration('test');
    expect(reg?.state).toBe(RegistrationState.COMMIT_PENDING);
    expect(reg?.commitTxHash).toBe('0xhash');
    expect(reg?.commitTimestamp).toBe(1000);
  });

  it('should clear registration', () => {
    const store = useRegistrationStore.getState();
    store.startRegistration('test', mockParams);
    store.clearRegistration('test');
    expect(store.getRegistration('test')).toBeUndefined();
  });

  it('should clear expired registrations', () => {
    const store = useRegistrationStore.getState();
    store.startRegistration('old', mockParams);
    store.setCommitTx('old', '0xhash', Math.floor(Date.now() / 1000) - 100000);
    store.startRegistration('new', mockParams);
    store.clearExpired();
    expect(store.getRegistration('old')).toBeUndefined();
    expect(store.getRegistration('new')).toBeDefined();
  });

  it('should clear completed registrations', () => {
    const store = useRegistrationStore.getState();
    store.startRegistration('done', mockParams);
    store.updateState('done', RegistrationState.COMPLETED);
    store.clearExpired();
    expect(store.getRegistration('done')).toBeUndefined();
  });

  it('should handle multiple registrations independently', () => {
    const store = useRegistrationStore.getState();
    store.startRegistration('alpha', mockParams);
    store.startRegistration('beta', mockParams);
    store.updateState('alpha', RegistrationState.COMMITTING);
    expect(store.getRegistration('alpha')?.state).toBe(RegistrationState.COMMITTING);
    expect(store.getRegistration('beta')?.state).toBe(RegistrationState.CONFIGURING);
  });

  it('should serialize duration as string', () => {
    const store = useRegistrationStore.getState();
    store.startRegistration('test', mockParams);
    const reg = store.getRegistration('test');
    expect(typeof reg?.duration).toBe('string');
    expect(reg?.duration).toBe('31536000');
  });
});
