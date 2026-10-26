
import React, { useCallback, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import EmployeeDetails from './pages/EmployeeDetails';

export default function App() {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={<Dashboard notify={notify} />}
          />
          <Route
            path="/employees"
            element={<Employees notify={notify} />}
          />
          <Route
            path="/employees/:id"
            element={<EmployeeDetails notify={notify} />}
          />
          <Route
            path="/projects"
            element={<Projects notify={notify} />}
          />
          <Route
            path="*"
            element={
              <div className="panel empty-state">
                <h2>Page not found</h2>
                <p>The page you requested does not exist.</p>
              </div>
            }
          />
        </Routes>
      </Layout>

      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
