export const ADDRESS_FIELDS = [
  { name: 'fullName', label: 'Pura naam', type: 'text' },
  { name: 'phone', label: 'Phone number', type: 'tel' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'addressLine', label: 'Address (ghar / mohalla)', type: 'text', wide: true },
];

export const EMPTY_ADDRESS = {
  fullName: '',
  phone: '',
  city: '',
  addressLine: '',
  postalCode: '',
  country: 'Pakistan',
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const AddressForm = ({ value, onChange }) => {
  const set = (name) => (e) => onChange({ ...value, [name]: e.target.value });

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ADDRESS_FIELDS.map((f) => (
        <label key={f.name} className={`block text-sm ${f.wide ? 'sm:col-span-2' : ''}`}>
          <span className="mb-1 block font-medium text-slate-700">{f.label}</span>
          <input type={f.type} value={value[f.name]} onChange={set(f.name)} className={inputClass} />
        </label>
      ))}
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Postal code (optional)</span>
        <input value={value.postalCode} onChange={set('postalCode')} className={inputClass} />
      </label>
    </div>
  );
};

export default AddressForm;