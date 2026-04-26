export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'deal_funding';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  senderId?: string; // deposit has no sender (external), withdraw has sender=current user
  receiverId?: string; // withdraw has no receiver (external)
  amount: number; // stored as number for calculations (USD-style)
  status: TransactionStatus;
  note?: string;
  createdAt: string; // ISO
}

export interface WalletState {
  balances: Record<string, number>; // userId -> balance
  transactions: WalletTransaction[];
}

