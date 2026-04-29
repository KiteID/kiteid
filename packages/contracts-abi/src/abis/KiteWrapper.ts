// Auto-generated from KiteWrapper.sol
export const KiteWrapperAbi = [
  {
    type: 'function',
    name: 'wrap',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'owner', type: 'address' },
      { name: 'fuses', type: 'uint96' },
      { name: 'expiry', type: 'uint64' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unwrap',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'owner', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setFuses',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'fuses', type: 'uint96' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'bindPassport',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'passportCommitment', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unbindPassport',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'authorizeAgent',
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'agentNode', type: 'bytes32' },
      { name: 'agentAddress', type: 'address' },
      { name: 'spendCapPerTx', type: 'uint256' },
      { name: 'expiry', type: 'uint64' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeAgent',
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'agentNode', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getFuses',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getExpiry',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPassportCommitment',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAgent',
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'agentNode', type: 'bytes32' },
    ],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'agentAddress', type: 'address' },
          { name: 'spendCapPerTx', type: 'uint256' },
          { name: 'expiry', type: 'uint64' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isAgentAuthorized',
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'agentNode', type: 'bytes32' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'NameWrapped',
    inputs: [
      { indexed: true, name: 'node', type: 'bytes32' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'fuses', type: 'uint96' },
      { indexed: false, name: 'expiry', type: 'uint64' },
    ],
  },
  {
    type: 'event',
    name: 'NameUnwrapped',
    inputs: [
      { indexed: true, name: 'node', type: 'bytes32' },
      { indexed: true, name: 'owner', type: 'address' },
    ],
  },
  {
    type: 'event',
    name: 'FusesBurned',
    inputs: [
      { indexed: true, name: 'node', type: 'bytes32' },
      { indexed: false, name: 'fuses', type: 'uint96' },
    ],
  },
  {
    type: 'event',
    name: 'PassportBound',
    inputs: [
      { indexed: true, name: 'node', type: 'bytes32' },
      { indexed: true, name: 'passportCommitment', type: 'bytes32' },
    ],
  },
  {
    type: 'event',
    name: 'PassportUnbound',
    inputs: [{ indexed: true, name: 'node', type: 'bytes32' }],
  },
  {
    type: 'event',
    name: 'AgentAuthorized',
    inputs: [
      { indexed: true, name: 'parentNode', type: 'bytes32' },
      { indexed: true, name: 'agentNode', type: 'bytes32' },
      { indexed: true, name: 'agentAddress', type: 'address' },
      { indexed: false, name: 'spendCapPerTx', type: 'uint256' },
      { indexed: false, name: 'expiry', type: 'uint64' },
    ],
  },
  {
    type: 'event',
    name: 'AgentRevoked',
    inputs: [
      { indexed: true, name: 'parentNode', type: 'bytes32' },
      { indexed: true, name: 'agentNode', type: 'bytes32' },
      { indexed: true, name: 'agentAddress', type: 'address' },
    ],
  },
] as const;
