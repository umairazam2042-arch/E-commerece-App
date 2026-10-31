import { Link, useLocation } from 'react-router-dom';

const OrderPlacedPage = () => {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber;
  const orderId = location.state?.orderId;

  return (
    <div className="animate-reveal mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
      <div className="text-5xl">✅</div>
      <h1 className="text-2xl font-bold text-slate-800">Aap ka order place ho gaya</h1>
      {orderNumber && (
        <p className="text-sm text-slate-500">
          Order number: <span className="font-semibold text-slate-800">{orderNumber}</span>
        </p>
      )}
      <p className="text-slate-600">
        Shukriya! Aap is order ko 2 ghante ke andar cancel kar sakte hain.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {orderId && (
          <Link
            to={`/orders/${orderId}`}
            className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Order dekhein / cancel karein
          </Link>
        )}
        <Link
          to="/products"
          className="btn-sheen inline-block rounded-full px-6 py-2.5 text-sm font-bold text-white"
        >
          Shopping jaari rakhein
        </Link>
      </div>
    </div>
  );
};

export default OrderPlacedPage;