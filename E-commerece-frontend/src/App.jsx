import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';
import ThemeToggle from './components/common/ThemeToggle';

const App = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <Navbar />
    <main className="mx-auto max-w-7xl px-4 py-8">
      <ThemeToggle />
      <AppRoutes />
    </main>
  </div>
);

export default App;