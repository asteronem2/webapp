import React, { useEffect, useState } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Auth from './Auth.jsx';
import Home from './Home.jsx';
import { axiinstance } from './config.jsx';
import Admin from "./Admin.jsx";

function ProtectedRoute({ isAuthenticated, redirectTo, children }) {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }
  return children;
}

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await axiinstance.get('auth/check_auth/');
        setIsAuthenticated(response.data.valid_auth);
        if (response.data.valid_auth) setUserId(response.data.id);
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, []);

  if (!authChecked) {
    // Показываем индикатор загрузки, пока не проверена авторизация
    return <div className='loading'>.</div>;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
            path='/admin/*'
            element={<Admin/>}
        />

        {/* Если пользователь авторизован, перенаправляем на /profile */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/profile' : '/auth'} />} />

        {/* Доступ только для неавторизованных пользователей */}
        <Route path="/auth" element={isAuthenticated ? <Navigate to="/profile" /> : <Auth />} />

        {/* Используем обертку ProtectedRoute для защищённых маршрутов */}
        <Route
          path="/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/auth">
              <Home id={userId} />
            </ProtectedRoute>
          }
        />

        {/* Редирект на 404 для любых неизвестных путей */}
        <Route path="*" element={<h1>404 - Страница не найдена</h1>} />
      </Routes>
    </Router>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
