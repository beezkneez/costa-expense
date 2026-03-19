import { useState } from 'react';
import { FolderOpen, Upload, Trash2, FileText, Pencil, Check, X } from 'lucide-react';
import { fileToBase64 } from '../utils/storage';

export default function Documents({ documents, onChange }) {
  const [notes, setNotes] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const addFiles = async (files) => {
    const newDocs = [];
    for (const file of files) {
      const fileData = await fileToBase64(file);
      newDocs.push({
        id: Date.now() + Math.random(),
        name: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        fileName: file.name,
        fileType: file.type,
        fileData,
        notes,
        addedAt: new Date().toISOString(),
      });
    }
    onChange([...documents, ...newDocs]);
    setNotes('');
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length) addFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(Array.from(e.dataTransfer.files));
  };

  const removeDoc = (id) => {
    onChange(documents.filter(d => d.id !== id));
  };

  const startEdit = (doc) => {
    setEditingId(doc.id);
    setEditForm({ name: doc.name, notes: doc.notes || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    onChange(documents.map(d => d.id === editingId ? { ...d, name: editForm.name, notes: editForm.notes } : d));
    setEditingId(null);
    setEditForm(null);
  };

  const isImage = (type) => type && type.startsWith('image/');

  return (
    <div className="section">
      <h2><FolderOpen size={20} /> Supporting Documents</h2>
      <p className="section-desc">Upload bag tags, incident reports, airline correspondence, screenshots, and any other supporting evidence.</p>

      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload size={32} />
        <p>Drag &amp; drop files here, or click to browse</p>
        <input type="file" multiple onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.txt" />
      </div>

      <div className="form-group" style={{ marginTop: '12px' }}>
        <label>Notes for next upload (optional)</label>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Bag tag photo from check-in counter" />
      </div>

      {documents.length > 0 && (
        <div className="doc-grid">
          {documents.map(d => (
            <div key={d.id} className="doc-card">
              <div className="doc-preview">
                {isImage(d.fileType) ? (
                  <img src={d.fileData} alt={d.name} />
                ) : d.fileType === 'application/pdf' ? (
                  <div className="doc-icon"><FileText size={40} /><span>PDF</span></div>
                ) : (
                  <div className="doc-icon"><FileText size={40} /><span>{d.fileName.split('.').pop().toUpperCase()}</span></div>
                )}
              </div>
              <div className="doc-info">
                {editingId === d.id ? (
                  <div className="doc-edit-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ marginTop: '8px' }}>
                      <label>Notes</label>
                      <textarea rows={3} value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="Describe this document..." />
                    </div>
                    <div className="edit-actions">
                      <button className="btn btn-primary btn-sm-action" onClick={saveEdit}><Check size={14} /> Save</button>
                      <button className="btn btn-cancel btn-sm-action" onClick={cancelEdit}><X size={14} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="doc-name">{d.name}</p>
                    {d.notes && <p className="doc-notes">{d.notes}</p>}
                    <div className="doc-actions">
                      <a href={d.fileData} download={d.fileName} className="btn-sm">Download</a>
                      <div className="doc-action-btns">
                        <button className="btn-icon" onClick={() => startEdit(d)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn-icon" onClick={() => removeDoc(d.id)} title="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
