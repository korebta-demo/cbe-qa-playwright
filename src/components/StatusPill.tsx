import type { AccountStatus } from '../lib/getStatusLabel';

const tone: Record<AccountStatus, { bg: string; fg: string }> = {
  active: { bg: 'rgba(34, 197, 94, 0.2)', fg: '#86efac' },
  pending: { bg: 'rgba(234, 179, 8, 0.2)', fg: '#fde047' },
  closed: { bg: 'rgba(148, 163, 184, 0.2)', fg: '#e2e8f0' },
};

type Props = { status: AccountStatus };

export function StatusPill({ status }: Props) {
  const { bg, fg } = tone[status];
  return (
    <span
      data-testid="status-pill"
      style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.2rem 0.55rem',
        borderRadius: 999,
        background: bg,
        color: fg,
      }}
    >
      {status}
    </span>
  );
}
