const defaultData = {
  expenses: [],
  documents: [],
  writeup: '',
  claimInfo: {
    airline: '',
    flightNumber: '',
    flightDate: '',
    bagTagNumbers: '',
    referenceNumber: '',
    passengerNames: '',
    description: '',
  },
};

export async function loadData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    return { ...defaultData, ...data, claimInfo: { ...defaultData.claimInfo, ...data.claimInfo } };
  } catch (err) {
    console.error('Load failed, using defaults:', err);
    return { ...defaultData };
  }
}

export async function saveData(data) {
  try {
    await fetch('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error('Save failed:', err);
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
