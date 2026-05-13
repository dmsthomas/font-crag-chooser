import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ListView } from './pages/ListView';
import { CragDetail } from './pages/CragDetail';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListView />} />
        <Route path="/crag/:id" element={<CragDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
