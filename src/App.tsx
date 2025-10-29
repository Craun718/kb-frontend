import './App.css';
import '@/styles/global.css';
import { Toaster } from '@/components/ui/sonner';
import { HomePage } from './pages';

const App = () => {
  return (
    <>
      <div className="content px-10">
        <HomePage />
      </div>
      <Toaster />
    </>
  );
};

export default App;
