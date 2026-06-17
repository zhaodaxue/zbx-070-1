import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import CreateGroup from '@/pages/CreateGroup';
import GroupDetail from '@/pages/GroupDetail';
import Navbar from '@/components/Navbar';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateGroup />} />
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}
