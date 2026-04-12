export type Price = {
  base: bigint;
  premium: bigint;
};

export type RegistrationParams = {
  name: string;
  owner: `0x${string}`;
  duration: bigint;
  secret: `0x${string}`;
  resolver: `0x${string}`;
  data: `0x${string}`[];
  reverseRecord: boolean;
};
