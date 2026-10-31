import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';

const POLL_MS = 30000;

// Notification par click karne par kahan jana hai
const targetFor = (n, role) => {
  if (role === 'vendor') {
    if (n.type === 'stock_low') return '/vendor/inventory';
    if (n.type === 'review_created' && n.data?.productId) return `/vendor/products/${n.data.productId}/edit`;
    return '/vendor/orders';
  }
  return n.data?.orderId ? `/orders/${n.data.orderId}` : '/orders';
};

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Unread count ko har 30 second mein refresh karein
  useEffect(() => {
    if (!user) return;
    const load = () => notificationApi.unreadCount().then(setUnread).catch(() => {});
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [user]);

  // Bahar click karne par panel band ho
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (!next) return;

    setLoading(true);
    try {
      const res = await notificationApi.list({ page: 1, limit: 10 });
      setItems(res.items ?? []);
    } catch {
      // Error par khaali list rahe gi
    } finally {
      setLoading(false);
    }
  };

  const openItem = (n) => {
    if (!n.isRead) {
      notificationApi.markRead(n._id).catch(() => {});
      setUnread((c) => Math.max(0, c - 1));
      setItems((list) => list.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    }
    setOpen(false);
    navigate(targetFor(n, user?.role));
  };

  const readAll = async () => {
    await notificationApi.markAllRead().catch(() => {});
    setUnread(0);
    setItems((list) => list.map((n) => ({ ...n, isRead: true })));
  };

  if (!user) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100"
      >
        🔔
        {unread > 0 && (
          <span className="animate-badge absolute -right-1 -top-1 min-w-[1.25rem] rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-reveal absolute right-0 z-40 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="font-semibold text-slate-800">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={readAll} className="text-sm font-semibold text-indigo-400 hover:cursor-pointer">
                Sab read karein
              </button>
            )}
          </div>

          <ul className="max-h-96 divide-y overflow-y-auto">
            {loading ? (
              <li className="p-4 text-center text-sm text-slate-500">Loading...</li>
            ) : items.length === 0 ? (
              <li className="p-4 text-center text-sm text-slate-500">Abhi koi notification nahi hai.</li>
            ) : (
              items.map((n) => (
                <li key={n._id}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    className={`block w-full px-4 py-3 text-left transition  ${
                      n.isRead ? '' : 'bg-indigo-50/70'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-600">{n.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleString('en-PK')}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;