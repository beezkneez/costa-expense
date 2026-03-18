import { Plane } from 'lucide-react';

export default function ClaimInfo({ claimInfo, onChange }) {
  const update = (field, value) => {
    onChange({ ...claimInfo, [field]: value });
  };

  return (
    <div className="section">
      <h2><Plane size={20} /> Claim Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Airline</label>
          <input value={claimInfo.airline} onChange={e => update('airline', e.target.value)} placeholder="e.g. Delta Airlines" />
        </div>
        <div className="form-group">
          <label>Flight Number</label>
          <input value={claimInfo.flightNumber} onChange={e => update('flightNumber', e.target.value)} placeholder="e.g. DL 1234" />
        </div>
        <div className="form-group">
          <label>Flight Date</label>
          <input type="date" value={claimInfo.flightDate} onChange={e => update('flightDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Bag Tag Numbers</label>
          <input value={claimInfo.bagTagNumbers} onChange={e => update('bagTagNumbers', e.target.value)} placeholder="e.g. DL 123456" />
        </div>
        <div className="form-group">
          <label>Reference / PIR Number</label>
          <input value={claimInfo.referenceNumber} onChange={e => update('referenceNumber', e.target.value)} placeholder="Airline reference number" />
        </div>
        <div className="form-group">
          <label>Passenger Name(s)</label>
          <input value={claimInfo.passengerNames} onChange={e => update('passengerNames', e.target.value)} placeholder="Full name(s)" />
        </div>
      </div>
      <div className="form-group" style={{ marginTop: '12px' }}>
        <label>Description of Bag &amp; Contents</label>
        <textarea rows={3} value={claimInfo.description} onChange={e => update('description', e.target.value)} placeholder="Describe the bag, color, brand, and notable contents..." />
      </div>
    </div>
  );
}
