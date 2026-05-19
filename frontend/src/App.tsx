/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { Login } from './components/Login';
import { ResearchDashboard } from './components/ResearchDashboard';
import { LanguageSelector } from './components/LanguageSelector';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [language, setLanguage] = useState("English");
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(savedUser);
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (username: string) => {
    setUser(username);
    setIsLoggedIn(true);
    localStorage.setItem('user', username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser("");
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return null;
  }

  return (
    <Background>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <LanguageSelector 
            current={language} 
            onSelect={setLanguage} 
          />
          <ResearchDashboard 
            user={user} 
            language={language}
            onLogout={handleLogout} 
          />
        </>
      )}
    </Background>
  );
}

