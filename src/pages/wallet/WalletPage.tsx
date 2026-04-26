import React, { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, CircleDollarSign, HandCoins } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { findUserById, getUsersByRole } from '../../data/users';
import { useWalletStore, getTransactionsForUser } from '../../features/wallet/store';
import { WalletTransaction } from '../../features/wallet/types';

function formatMoney(amount: number) {
  return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function statusBadge(status: WalletTransaction['status']) {
  if (status === 'completed') return <Badge variant="success">Completed</Badge>;
  if (status === 'pending') return <Badge variant="warning">Pending</Badge>;
  return <Badge variant="error">Failed</Badge>;
}

function typeLabel(type: WalletTransaction['type']) {
  switch (type) {
    case 'deposit':
      return 'Deposit';
    case 'withdraw':
      return 'Withdraw';
    case 'transfer':
      return 'Transfer';
    case 'deal_funding':
      return 'Deal funding';
  }
}

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const wallet = useWalletStore();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer' | 'fund'>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [counterpartyId, setCounterpartyId] = useState('');
  const [dealName, setDealName] = useState('');
  const [uiError, setUiError] = useState<string | null>(null);

  const currentUserId = user?.id ?? '';
  const role = user?.role ?? 'entrepreneur';
  const balance = currentUserId ? wallet.getBalance(currentUserId) : 0;
  const counterpartRole = role === 'investor' ? 'entrepreneur' : 'investor';
  const counterpartOptions = useMemo(() => getUsersByRole(counterpartRole), [counterpartRole]);

  const myTransactions = useMemo(
    () => (currentUserId ? getTransactionsForUser(wallet.state, currentUserId) : []),
    [wallet.state, currentUserId]
  );

  const parsedAmount = Number(amount);
  const amountIsValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const submit = () => {
    setUiError(null);
    if (!amountIsValid) {
      setUiError('Enter a valid amount greater than 0.');
      return;
    }

    try {
      if (activeTab === 'deposit') {
        wallet.deposit({ userId: user.id, amount: parsedAmount, note: note.trim() || undefined });
      } else if (activeTab === 'withdraw') {
        wallet.withdraw({ userId: user.id, amount: parsedAmount, note: note.trim() || undefined });
      } else if (activeTab === 'transfer') {
        if (!counterpartyId) {
          setUiError(`Select a ${counterpartRole} to transfer to.`);
          return;
        }
        wallet.transfer({
          senderId: user.id,
          receiverId: counterpartyId,
          amount: parsedAmount,
          note: note.trim() || undefined,
        });
      } else if (activeTab === 'fund') {
        if (user.role !== 'investor') {
          setUiError('Only investors can fund deals in this mock flow.');
          return;
        }
        if (!counterpartyId) {
          setUiError('Select an entrepreneur to fund.');
          return;
        }
        wallet.fundDeal({
          investorId: user.id,
          entrepreneurId: counterpartyId,
          amount: parsedAmount,
          dealName: dealName.trim() || undefined,
        });
      }

      setAmount('');
      setNote('');
      setDealName('');
      setCounterpartyId('');
    } catch (e) {
      setUiError((e as Error).message);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600">Mock payments system (frontend only)</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Balance: {formatMoney(balance)}</Badge>
        </div>
      </div>

      {uiError && (
        <div className="rounded-md border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
          {uiError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Actions</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('deposit')}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'deposit' ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'withdraw' ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Withdraw
              </button>
              <button
                onClick={() => setActiveTab('transfer')}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'transfer' ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Transfer
              </button>
              <button
                onClick={() => setActiveTab('fund')}
                disabled={user.role !== 'investor'}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'fund' ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                } ${user.role !== 'investor' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Fund deal
              </button>
            </div>

            <div className="rounded-md border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">
                  {activeTab === 'deposit'
                    ? 'Deposit'
                    : activeTab === 'withdraw'
                      ? 'Withdraw'
                      : activeTab === 'transfer'
                        ? 'Transfer'
                        : 'Funding deal'}
                </div>
                <Badge variant="gray" size="sm">Mock</Badge>
              </div>

              {(activeTab === 'transfer' || activeTab === 'fund') && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {activeTab === 'fund' ? 'Entrepreneur' : `To (${counterpartRole})`}
                  </label>
                  <select
                    value={counterpartyId}
                    onChange={e => setCounterpartyId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select</option>
                    {counterpartOptions.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'fund' && (
                <Input
                  label="Deal name (optional)"
                  value={dealName}
                  onChange={e => setDealName(e.target.value)}
                  fullWidth
                  placeholder="e.g. TechWave AI Series A"
                />
              )}

              <Input
                label="Amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                fullWidth
                placeholder="1000"
                startAdornment={<CircleDollarSign size={18} />}
              />

              <Input
                label="Note (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
                fullWidth
                placeholder="Add a reference…"
              />

              <Button
                onClick={submit}
                fullWidth
                leftIcon={
                  activeTab === 'deposit' ? <ArrowDownToLine size={18} /> :
                  activeTab === 'withdraw' ? <ArrowUpFromLine size={18} /> :
                  activeTab === 'transfer' ? <ArrowLeftRight size={18} /> :
                  <HandCoins size={18} />
                }
              >
                Confirm
              </Button>

              <div className="text-xs text-gray-500">
                Deposits/withdrawals are simulated. Transfers and deal funding move balances between mock users.
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Transaction history</h2>
            <Badge variant="gray" size="sm">{myTransactions.length}</Badge>
          </CardHeader>
          <CardBody>
            {myTransactions.length === 0 ? (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                No transactions yet. Try a deposit or transfer to see activity here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {myTransactions.slice(0, 20).map(tx => {
                      const sender = tx.senderId ? findUserById(tx.senderId) : null;
                      const receiver = tx.receiverId ? findUserById(tx.receiverId) : null;
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{typeLabel(tx.type)}</div>
                            {tx.note && <div className="text-xs text-gray-500 truncate max-w-[280px]">{tx.note}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {sender?.name ?? (tx.type === 'deposit' ? 'External' : '—')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {receiver?.name ?? (tx.type === 'withdraw' ? 'External' : '—')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatMoney(tx.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{statusBadge(tx.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

