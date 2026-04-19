import { formatCurrency } from '../lib/formatCurrency';
import { getStatusLabel, type AccountStatus } from '../lib/getStatusLabel';
import { maskAccountNumber } from '../lib/maskAccountNumber';
import { StatusPill } from './StatusPill';

type Props = {
  accountNumber: string;
  balance: number;
  status: AccountStatus;
};

export function AccountSummaryCard({ accountNumber, balance, status }: Props) {
  return (
    <article
      data-testid="account-summary"
      style={{
        maxWidth: 360,
        padding: '1.25rem',
        borderRadius: 12,
        background: 'linear-gradient(145deg, #0f172a, #1e293b)',
        color: '#f8fafc',
        boxShadow: '0 12px 40px rgba(15, 23, 42, 0.35)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Savings</span>
        <StatusPill status={status} />
      </header>
      <p style={{ margin: '0.75rem 0 0.25rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
        {maskAccountNumber(accountNumber)}
      </p>
      <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>{formatCurrency(balance)}</p>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
        {getStatusLabel(status)}
      </p>
    </article>
  );
}
