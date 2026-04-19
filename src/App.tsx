import { AccountSummaryCard } from './components/AccountSummaryCard';
import './App.css';

export function App() {
  return (
    <div data-testid="app-root" className="page">
      <header className="hero">
        <p className="eyebrow">QA demo</p>
        <h1>Demo Bank</h1>
        <p className="lede">A tiny sample app for unit tests, coverage, and Playwright smoke checks.</p>
      </header>
      <AccountSummaryCard accountNumber="1000456012345678" balance={48250.75} status="active" />
    </div>
  );
}
