import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CreatePasteForm } from './components/CreatePasteForm';
import { ViewPaste } from './components/ViewPaste';

const App: React.FC = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<CreatePasteForm />} />
        <Route path="/p/:id" element={<ViewPaste />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);

export default App;
