const API_URL = typeof window !== 'undefined' ? '/api' : '/api';

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export type IndexedDomain = {
  name: string;
  tokenId: string;
  labelhash: string;
  owner: string;
  registrant: string;
  resolver: string | null;
  registeredAt: string;
  expiresAt: string;
  isPrimaryFor: string | null;
  createdAtBlock: string;
};

export type ResolverRecord = {
  id: string;
  name: string;
  recordType: string;
  key: string;
  value: string;
  updatedAt: string;
};

export type ActivityEvent = {
  id: string;
  name: string | null;
  eventType: string;
  actor: string;
  fromAddr: string | null;
  toAddr: string | null;
  priceKite: string | null;
  blockNumber: string;
  timestamp: string;
  txHash: string;
};

export type DomainStats = {
  totalDomains: number;
  activeDomains: number;
  expiredDomains: number;
};

export const ponderClient = {
  getOwnedDomains: (address: string) =>
    fetchApi<{ domains: IndexedDomain[]; count: number }>(`/names/owner/${address}`),

  getDomainDetail: (name: string) =>
    fetchApi<{ domain: IndexedDomain; records: ResolverRecord[]; events: ActivityEvent[] }>(
      `/names/${encodeURIComponent(name)}`,
    ),

  getRecentActivity: (limit = 50) =>
    fetchApi<{ events: ActivityEvent[]; count: number }>(`/names/recent?limit=${limit}`),

  getStats: () => fetchApi<DomainStats>('/names/stats'),
};
