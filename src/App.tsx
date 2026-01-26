import './App.css';
import '@/styles/global.css';
import { Toaster } from '@/components/ui/sonner';
import { HomePage } from './pages';

const App = () => {
  return (
    <div className="content min-h-screen bg-linear-to-b from-sky-300 to-white flex py-6">
      <HomePage />
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
