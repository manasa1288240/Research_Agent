/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Background } from './components/Background';
import { Login } from './components/Login';
import { ResearchDashboard } from './components/ResearchDashboard';
import { LanguageSelector } from './components/LanguageSelector';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [language, setLanguage] = useState("English");

  const handleLogin = (username: string) => {
    setUser(username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser("");
  };

  return (
    <Background>
      <LanguageSelector 
        current={language} 
        onSelect={setLanguage} 
      />
      
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ResearchDashboard 
          user={user} 
          language={language}
          onLogout={handleLogout} 
        />
      )}
    </Background>
  );
}

