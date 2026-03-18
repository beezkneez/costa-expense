const STORAGE_KEY = 'costa-expense-data';

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

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed, claimInfo: { ...defaultData.claimInfo, ...parsed.claimInfo } };
  } catch {
    return { ...defaultData };
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
