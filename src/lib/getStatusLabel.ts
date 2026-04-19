export type AccountStatus = 'active' | 'pending' | 'closed';

const labels: Record<AccountStatus, string> = {
  active: 'Active',
  pending: 'Pending review',
  closed: 'Closed',
};

/**
 * Human-readable label for a simple account status code.
 */
export function getStatusLabel(status: AccountStatus): string {
  return labels[status] ?? 'Unknown';
}
