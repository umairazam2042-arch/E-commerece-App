import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorApi } from '../../api/vendorApi';
import { getErrorMessage } from '../../utils/getErrorMessage';

const emptyForm = {
  storeName: '',
  description: '',
  ownerType: 'individual',
  cnic: '',
  registrationNumber: '',
  city: '',
  addressLine: '',
  bankName: '',
  accountTitle: '',
  accountNumber: '',
};

const STEPS = ['Store', 'Business', 'Bank'];

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
    <input
      {...props}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
    />
  </label>
);

const StatusCard = ({ title, text, tone, children }) => (
  <div className={`animate-reveal rounded-2xl p-6 ring-1 ${tone}`}>
    <h2 className="text-xl font-bold">{title}</h2>
    <p className="mt-2 text-sm opacity-90">{text}</p>
    {children && <div className="mt-4">{children}</div>}
  </div>
);

const VendorApplyPage = () => {
  // undefined = load ho raha hai, null = koi application nahi, object = existing application
  const [vendor, setVendor] = useState(undefined);
  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    vendorApi
      .myVendor()
      .then((v) => !ignore && setVendor(v))
      .catch(() => !ignore && setVendor(null));
    return () => {
      ignore = true;
    };
  }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validateStep = () => {
    if (step === 0) {
      if (form.storeName.trim().length < 3) return 'Store ka naam kam az kam 3 characters ka ho';
      if (form.description.trim().length < 10) return 'Description kam az kam 10 characters ki ho';
    }
    if (step === 1) {
      if (form.ownerType === 'individual' && !/^\d{5}-\d{7}-\d$/.test(form.cnic))
        return 'CNIC format 12345-1234567-1 jaisa hona chahiye';
      if (form.ownerType === 'company' && form.registrationNumber.trim().length < 3)
        return 'Company ka registration number likhein';
      if (form.city.trim().length < 2) return 'City likhein';
      if (form.addressLine.trim().length < 5) return 'Address likhein';
    }
    if (step === 2) {
      if (form.bankName.trim().length < 2) return 'Bank ka naam likhein';
      if (form.accountTitle.trim().length < 3) return 'Account title likhein';
      if (form.accountNumber.trim().length < 8) return 'Account number kam az kam 8 digits ka ho';
    }
    return '';
  };

  const next = () => {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError('');
    setStep((s) => s + 1);
  };

  const submit = async (e) => {
    e.preventDefault();
    const msg = validateStep();
    if (msg) return setError(msg);

    const isIndividual = form.ownerType === 'individual';
    const payload = {
      storeName: form.storeName.trim(),
      description: form.description.trim(),
      businessInfo: {
        ownerType: form.ownerType,
        city: form.city.trim(),
        addressLine: form.addressLine.trim(),
        ...(isIndividual
          ? { cnic: form.cnic.trim() }
          : { registrationNumber: form.registrationNumber.trim() }),
      },
      bankDetails: {
        bankName: form.bankName.trim(),
        accountTitle: form.accountTitle.trim(),
        accountNumber: form.accountNumber.trim(),
      },
    };

    setSubmitting(true);
    setError('');
    try {
      setVendor(await vendorApi.apply(payload));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (vendor === undefined) {
    return <p className="py-20 text-center text-slate-500">Loading...</p>;
  }

  if (vendor?.status === 'approved') {
    return (
      <StatusCard
        title="Aap approved vendor hain"
        text="Aap ka store active hai. Vendor panel se products aur orders manage karein."
        tone="bg-emerald-50 text-emerald-900 ring-emerald-200"
      >
        <Link to="/vendor" className="btn-sheen inline-block rounded-full px-5 py-2 text-sm font-bold text-white">
          Vendor panel kholein
        </Link>
      </StatusCard>
    );
  }

  if (vendor?.status === 'pending') {
    return (
      <StatusCard
        title="Application review mein hai"
        text="Admin aap ki application check kar raha hai. Approval ke baad yahan notification dikhe ga."
        tone="bg-amber-50 text-amber-900 ring-amber-200"
      />
    );
  }


  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-reveal">
        <h1 className="text-2xl font-bold text-slate-800">Vendor bano</h1>
        <p className="text-sm text-slate-500">Apna store kholne ke liye ye form bharein.</p>
      </div>

      {vendor?.status === 'rejected' && (
        <StatusCard
          title="Pichli application reject hui thi"
          text={vendor.rejectionReason || 'Wajah mention nahi ki gayi.'}
          tone="bg-rose-50 text-rose-900 ring-rose-200"
        />
      )}

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                i <= step ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-sm ${i <= step ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-300" />}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="animate-reveal space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        {step === 0 && (
          <>
            <Field label="Store ka naam" value={form.storeName} onChange={update('storeName')} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={update('description')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <div className="flex gap-2">
              {['individual', 'company'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, ownerType: t }))}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize transition ${
                    form.ownerType === t
                      ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t === 'individual' ? 'Individual' : 'Company'}
                </button>
              ))}
            </div>
            {form.ownerType === 'individual' ? (
              <Field label="CNIC (12345-1234567-1)" value={form.cnic} onChange={update('cnic')} />
            ) : (
              <Field label="Registration number" value={form.registrationNumber} onChange={update('registrationNumber')} />
            )}
            <Field label="City" value={form.city} onChange={update('city')} />
            <Field label="Address" value={form.addressLine} onChange={update('addressLine')} />
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Bank ka naam" value={form.bankName} onChange={update('bankName')} />
            <Field label="Account title" value={form.accountTitle} onChange={update('accountTitle')} />
            <Field label="Account number" value={form.accountNumber} onChange={update('accountNumber')} />
          </>
        )}

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={() => { setError(''); setStep((s) => s - 1); }}
            disabled={step === 0}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            Wapas
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn-sheen rounded-full px-6 py-2 text-sm font-bold ">
              Aage
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="btn-sheen rounded-full px-6 py-2 text-sm font-bold text-white disabled:opacity-60">
              {submitting ? 'Bheja ja raha hai...' : 'Application bhejein'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VendorApplyPage;