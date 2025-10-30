import './App.css';
import '@/styles/global.css';
import { Toaster } from '@/components/ui/sonner';
import { HomePage } from './pages';

const App = () => {
  return (
    <div className="content min-h-screen bg-linear-to-b from-sky-300 to-white flex py-6">
      <div className="w-full max-w-5xl px-4">
        <HomePage />
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
