import { useState } from 'react';
import { Plus, Trash2, Receipt, DollarSign, Pencil, X, Check } from 'lucide-react';
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

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  category: 'Clothing',
  description: '',
  amount: '',
  currency: 'USD',
  notes: '',
  receipt: null,
  receiptName: '',
};

export default function ExpenseTracker({ expenses, onChange }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const totals = expenses.reduce((acc, e) => {
    const cur = e.currency || 'USD';
    acc[cur] = (acc[cur] || 0) + Number(e.amount);
    return acc;
  }, {});

  const handleReceipt = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await fileToBase64(file);
    if (isEdit) {
      setEditForm(f => ({ ...f, receipt: data, receiptName: file.name }));
    } else {
      setForm(f => ({ ...f, receipt: data, receiptName: file.name }));
    }
  };

  const addExpense = () => {
    if (!form.description || !form.amount) return;
    onChange([...expenses, { ...form, id: Date.now() }]);
    setForm({
      ...emptyForm,
      date: form.date,
      category: form.category,
      currency: form.currency,
    });
  };

  const removeExpense = (id) => {
    onChange(expenses.filter(e => e.id !== id));
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({ ...expense });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm.description || !editForm.amount) return;
    onChange(expenses.map(e => e.id === editingId ? { ...editForm } : e));
    setEditingId(null);
    setEditForm(null);
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
        <div className="form-group" style={{ marginTop: '12px' }}>
          <label>Notes (optional)</label>
          <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details about this purchase..." />
        </div>
        <div className="form-row">
          <div className="form-group file-input-group">
            <label>Receipt (optional)</label>
            <input type="file" accept="image/*,.pdf" onChange={e => handleReceipt(e)} />
            {form.receiptName && <span className="file-name">{form.receiptName}</span>}
          </div>
          <button className="btn btn-primary" onClick={addExpense} disabled={!form.description || !form.amount}>
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="expense-list">
          {expenses.map(e => (
            <div key={e.id} className="expense-card">
              {editingId === e.id ? (
                <div className="expense-edit-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" value={editForm.date} onChange={ev => setEditForm(f => ({ ...f, date: ev.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select value={editForm.category} onChange={ev => setEditForm(f => ({ ...f, category: ev.target.value }))}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input value={editForm.description} onChange={ev => setEditForm(f => ({ ...f, description: ev.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select value={editForm.currency} onChange={ev => setEditForm(f => ({ ...f, currency: ev.target.value }))}>
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input type="number" step="0.01" min="0" value={editForm.amount} onChange={ev => setEditForm(f => ({ ...f, amount: ev.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>Notes</label>
                    <textarea rows={2} value={editForm.notes || ''} onChange={ev => setEditForm(f => ({ ...f, notes: ev.target.value }))} placeholder="Additional details about this purchase..." />
                  </div>
                  <div className="form-group" style={{ marginTop: '8px' }}>
                    <label>Receipt</label>
                    <input type="file" accept="image/*,.pdf" onChange={ev => handleReceipt(ev, true)} />
                    {editForm.receiptName && <span className="file-name">{editForm.receiptName}</span>}
                  </div>
                  <div className="edit-actions">
                    <button className="btn btn-primary btn-sm-action" onClick={saveEdit}><Check size={14} /> Save</button>
                    <button className="btn btn-cancel btn-sm-action" onClick={cancelEdit}><X size={14} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="expense-card-header">
                    <div className="expense-card-left">
                      <span className="expense-date">{e.date}</span>
                      <span className="category-badge">{e.category}</span>
                    </div>
                    <div className="expense-card-right">
                      <span className="expense-amount">{formatAmount(e.amount, e.currency)}</span>
                      <div className="expense-card-actions">
                        {e.receipt && (
                          <a href={e.receipt} target="_blank" rel="noreferrer" className="btn-sm">Receipt</a>
                        )}
                        <button className="btn-icon" onClick={() => startEdit(e)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn-icon" onClick={() => removeExpense(e.id)} title="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="expense-description">{e.description}</p>
                  {e.notes && <p className="expense-notes">{e.notes}</p>}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
