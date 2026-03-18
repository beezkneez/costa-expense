import { useState } from 'react';
import { Plus, Trash2, Receipt, DollarSign } from 'lucide-react';
import { fileToBase64 } from '../utils/storage';

const CATEGORIES = [
  'Clothing',
  'Toiletries',
  'Medication',
  'Electronics',
  'Luggage',
  'Transportation',
  'Food & Meals',
  'Communication',
  'Other',
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'CAD', symbol: 'C$', label: 'CAD' },
  { code: 'CRC', symbol: '₡', label: 'CRC (Colón)' },
];

function formatAmount(amount, currency = 'USD') {
  const c = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  return `${c.symbol}${Number(amount).toFixed(2)}`;
}

export default function ExpenseTracker({ expenses, onChange }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Clothing',
    description: '',
    amount: '',
    currency: 'USD',
    receipt: null,
    receiptName: '',
  });

  const totals = expenses.reduce((acc, e) => {
    const cur = e.currency || 'USD';
    acc[cur] = (acc[cur] || 0) + Number(e.amount);
    return acc;
  }, {});

  const handleReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await fileToBase64(file);
    setForm(f => ({ ...f, receipt: data, receiptName: file.name }));
  };

  const addExpense = () => {
    if (!form.description || !form.amount) return;
    onChange([...expenses, { ...form, id: Date.now() }]);
    setForm({
      date: form.date,
      category: form.category,
      description: '',
      amount: '',
      currency: form.currency,
      receipt: null,
      receiptName: '',
    });
  };

  const removeExpense = (id) => {
    onChange(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="section">
      <h2><Receipt size={20} /> Expenses</h2>

      <div className="total-bar">
        <DollarSign size={20} />
        <span>Total Claimed: <strong>
          {Object.keys(totals).length === 0
            ? '$0.00'
            : Object.entries(totals).map(([cur, amt]) => formatAmount(amt, cur)).join(' + ')
          }
        </strong></span>
        <span className="expense-count">{expenses.length} item{expenses.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="expense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What did you purchase?" />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group file-input-group">
            <label>Receipt (optional)</label>
            <input type="file" accept="image/*,.pdf" onChange={handleReceipt} />
            {form.receiptName && <span className="file-name">{form.receiptName}</span>}
          </div>
          <button className="btn btn-primary" onClick={addExpense} disabled={!form.description || !form.amount}>
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="expense-table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Receipt</th>
                <th className="text-right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td><span className="category-badge">{e.category}</span></td>
                  <td>{e.description}</td>
                  <td>
                    {e.receipt ? (
                      <a href={e.receipt} target="_blank" rel="noreferrer" className="receipt-link">View</a>
                    ) : (
                      <span className="no-receipt">—</span>
                    )}
                  </td>
                  <td className="text-right">{formatAmount(e.amount, e.currency)}</td>
                  <td>
                    <button className="btn-icon" onClick={() => removeExpense(e.id)} title="Remove">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
