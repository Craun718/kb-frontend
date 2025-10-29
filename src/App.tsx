import './App.css';
import '@/styles/global.css';
import { Toaster } from '@/components/ui/sonner';
import { HomePage } from './pages';

const App = () => {
  return (
    <>
      <div className="content">
        <HomePage />
      </div>
      <Toaster position="top-center" />
    </>
  );
};

export default App;
