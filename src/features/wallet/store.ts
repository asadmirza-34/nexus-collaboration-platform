import { useMemo } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { TransactionStatus, WalletState, WalletTransaction } from './types';

const WALLET_STORAGE_KEY = 'business_nexus_wallet_v1';

function createId() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cryptoAny = crypto as any;
  if (typeof cryptoAny?.randomUUID === 'function') return cryptoAny.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const emptyState: WalletState = { balances: {}, transactions: [] };

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function ensureNonNegativeAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be greater than 0');
}

export function useWalletStore() {
  const [state, setState] = useLocalStorageState<WalletState>(WALLET_STORAGE_KEY, emptyState);

  const api = useMemo(() => {
    const getBalance = (userId: string) => state.balances[userId] ?? 0;

    const setBalance = (userId: string, nextBalance: number) => {
      setState(prev => ({
        ...prev,
        balances: { ...prev.balances, [userId]: round2(nextBalance) },
      }));
    };

    const addTransaction = (tx: Omit<WalletTransaction, 'id' | 'createdAt'>) => {
      const createdAt = new Date().toISOString();
      const transaction: WalletTransaction = { ...tx, id: createId(), createdAt };
      setState(prev => ({ ...prev, transactions: [transaction, ...prev.transactions] }));
      return transaction;
    };

    const deposit = (input: { userId: string; amount: number; note?: string }) => {
      ensureNonNegativeAmount(input.amount);
      const current = getBalance(input.userId);
      setBalance(input.userId, current + input.amount);
      return addTransaction({
        type: 'deposit',
        receiverId: input.userId,
        amount: round2(input.amount),
        status: 'completed',
        note: input.note,
      });
    };

    const withdraw = (input: { userId: string; amount: number; note?: string }) => {
      ensureNonNegativeAmount(input.amount);
      const current = getBalance(input.userId);
      if (current < input.amount) {
        return addTransaction({
          type: 'withdraw',
          senderId: input.userId,
          amount: round2(input.amount),
          status: 'failed',
          note: input.note ?? 'Insufficient balance',
        });
      }
      setBalance(input.userId, current - input.amount);
      return addTransaction({
        type: 'withdraw',
        senderId: input.userId,
        amount: round2(input.amount),
        status: 'completed',
        note: input.note,
      });
    };

    const transfer = (input: { senderId: string; receiverId: string; amount: number; note?: string }) => {
      ensureNonNegativeAmount(input.amount);
      if (input.senderId === input.receiverId) throw new Error('Receiver must be different');

      const senderBalance = getBalance(input.senderId);
      if (senderBalance < input.amount) {
        return addTransaction({
          type: 'transfer',
          senderId: input.senderId,
          receiverId: input.receiverId,
          amount: round2(input.amount),
          status: 'failed',
          note: input.note ?? 'Insufficient balance',
        });
      }

      setBalance(input.senderId, senderBalance - input.amount);
      const receiverBalance = getBalance(input.receiverId);
      setBalance(input.receiverId, receiverBalance + input.amount);

      return addTransaction({
        type: 'transfer',
        senderId: input.senderId,
        receiverId: input.receiverId,
        amount: round2(input.amount),
        status: 'completed',
        note: input.note,
      });
    };

    const fundDeal = (input: {
      investorId: string;
      entrepreneurId: string;
      amount: number;
      dealName?: string;
    }) => {
      ensureNonNegativeAmount(input.amount);
      const note = input.dealName ? `Funding: ${input.dealName}` : 'Deal funding';
      // For now this behaves like a transfer with a distinct type
      const investorBalance = getBalance(input.investorId);
      if (investorBalance < input.amount) {
        return addTransaction({
          type: 'deal_funding',
          senderId: input.investorId,
          receiverId: input.entrepreneurId,
          amount: round2(input.amount),
          status: 'failed',
          note: 'Insufficient balance',
        });
      }

      setBalance(input.investorId, investorBalance - input.amount);
      const entrepreneurBalance = getBalance(input.entrepreneurId);
      setBalance(input.entrepreneurId, entrepreneurBalance + input.amount);

      return addTransaction({
        type: 'deal_funding',
        senderId: input.investorId,
        receiverId: input.entrepreneurId,
        amount: round2(input.amount),
        status: 'completed',
        note,
      });
    };

    const setTransactionStatus = (transactionId: string, status: TransactionStatus) => {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => (t.id === transactionId ? { ...t, status } : t)),
      }));
    };

    const reset = () => setState(emptyState);

    return {
      state,
      getBalance,
      deposit,
      withdraw,
      transfer,
      fundDeal,
      setTransactionStatus,
      reset,
    };
  }, [setState, state]);

  return api;
}

export function getTransactionsForUser(state: WalletState, userId: string) {
  return state.transactions.filter(t => t.senderId === userId || t.receiverId === userId);
}

