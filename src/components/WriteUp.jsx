import { PenLine } from 'lucide-react';

export default function WriteUp({ writeup, onChange }) {
  return (
    <div className="section">
      <h2><PenLine size={20} /> Statement / Write-Up</h2>
      <p className="section-desc">
        Write your account of what happened. This will be included in the PDF report sent to the airline and credit card company.
      </p>
      <textarea
        className="writeup-textarea"
        rows={12}
        value={writeup}
        onChange={e => onChange(e.target.value)}
        placeholder={`Example:\n\nOn [date], I traveled on [airline] flight [number] from [origin] to [destination]. Upon arrival at baggage claim, my checked bag (tag number [tag]) did not appear on the carousel.\n\nI immediately reported the missing bag to the airline's baggage service office and was given reference number [ref]. I was told the bag would be delivered within 24-48 hours.\n\nAfter [X] days with no bag, I was forced to purchase essential items including clothing, toiletries, and medications. All replacement purchases are documented with receipts below.\n\nI am requesting reimbursement for all reasonable expenses incurred as a direct result of the airline's failure to deliver my checked baggage.`}
      />
      <div className="char-count">{writeup.length} characters</div>
    </div>
  );
}
