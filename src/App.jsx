import { useState, useEffect, useCallback } from 'react';
import { FileDown, Luggage, Save } from 'lucide-react';
import ClaimInfo from './components/ClaimInfo';
import ExpenseTracker from './components/ExpenseTracker';
import Documents from './components/Documents';
import WriteUp from './components/WriteUp';
import { loadData, saveData } from './utils/storage';
import { generatePdf } from './utils/generatePdf';
import './App.css';

const TABS = [
  { id: 'claim', label: 'Claim Info' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'documents', label: 'Documents' },
  { id: 'writeup', label: 'Write-Up' },
];

export default function App() {
  const [data, setData] = useState(loadData);
  const [activeTab, setActiveTab] = useState('claim');
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);

  const save = useCallback(() => {
    saveData(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [data]);

  // Auto-save on changes
  useEffect(() => {
    const timer = setTimeout(() => saveData(data), 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const update = (field) => (value) => {
    setData(d => ({ ...d, [field]: value }));
  };

  const handleGeneratePdf = async () => {
    setGenerating(true);
    try {
      await generatePdf(data);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
    setGenerating(false);
  };

  const total = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amt);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <Luggage size={28} />
            <div>
              <h1>Lost Baggage Claim Tracker</h1>
              <p className="header-subtitle">Track expenses, collect documents, and generate your claim report</p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-stat">
              <span className="stat-label">Total Claim</span>
              <span className="stat-value">{formatCurrency(total)}</span>
            </div>
            <button className="btn btn-secondary" onClick={save}>
              <Save size={16} /> {saved ? 'Saved!' : 'Save'}
            </button>
            <button className="btn btn-primary" onClick={handleGeneratePdf} disabled={generating}>
              <FileDown size={16} /> {generating ? 'Generating...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'expenses' && data.expenses.length > 0 && (
              <span className="tab-badge">{data.expenses.length}</span>
            )}
            {tab.id === 'documents' && data.documents.length > 0 && (
              <span className="tab-badge">{data.documents.length}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === 'claim' && <ClaimInfo claimInfo={data.claimInfo} onChange={update('claimInfo')} />}
        {activeTab === 'expenses' && <ExpenseTracker expenses={data.expenses} onChange={update('expenses')} />}
        {activeTab === 'documents' && <Documents documents={data.documents} onChange={update('documents')} />}
        {activeTab === 'writeup' && <WriteUp writeup={data.writeup} onChange={update('writeup')} />}
      </main>
    </div>
  );
}
