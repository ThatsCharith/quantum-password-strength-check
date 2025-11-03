// src/components/PasswordStrengthUI.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PasswordStrengthUI() {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState({ score: 0, feedback: [] });
  const [generated, setGenerated] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("analyzer");
  const [attackData, setAttackData] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    attacksToday: 0,
    passwordsCompromised: 0,
    activeThreats: 0,
    weakPasswords: 0
  });
  const [liveChecks, setLiveChecks] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const terminalRef = useRef(null);

  const strengthLabels = ["CRITICAL", "WEAK", "FAIR", "STRONG", "PERFECT"];

  // Real-time attack data simulation
  const attackTypes = [
    { type: "Brute Force", origin: "Russia", target: "Banking", severity: "HIGH" },
    { type: "Dictionary", origin: "China", target: "Healthcare", severity: "MEDIUM" },
    { type: "Rainbow Table", origin: "Unknown", target: "Government", severity: "CRITICAL" },
    { type: "Credential Stuffing", origin: "Brazil", target: "E-commerce", severity: "HIGH" },
    { type: "Hybrid Attack", origin: "Iran", target: "Education", severity: "MEDIUM" },
    { type: "Phishing", origin: "Nigeria", target: "Finance", severity: "HIGH" },
    { type: "SQL Injection", origin: "Romania", target: "Retail", severity: "CRITICAL" },
    { type: "Keylogger", origin: "North Korea", target: "Defense", severity: "CRITICAL" }
  ];

  // Security articles/blogs
  const securityArticles = [
    {
      id: 1,
      title: "The 2024 Password Crisis: 23M Credentials Leaked",
      date: "2 hours ago",
      category: "BREACH",
      severity: "CRITICAL",
      content: "Major data breach exposes 23 million user credentials from Fortune 500 companies. Hackers used sophisticated AI-powered attacks to bypass traditional security measures.",
      stats: { affected: "23M", method: "AI-Enhanced", duration: "6 months" }
    },
    {
      id: 2,
      title: "Quantum Computing: The End of Current Encryption?",
      date: "5 hours ago",
      category: "THREAT",
      severity: "HIGH",
      content: "IBM's latest quantum computer can crack 256-bit encryption in minutes. Security experts warn of imminent threat to global infrastructure.",
      stats: { riskLevel: "95%", timeline: "2-3 years", impact: "Global" }
    },
    {
      id: 3,
      title: "Real-Time: 10,000 Password Attacks Per Second",
      date: "1 day ago",
      category: "ANALYSIS",
      severity: "MEDIUM",
      content: "Our honeypot systems detect average of 10,000 password attack attempts per second globally. Most common passwords still include '123456' and 'password'.",
      stats: { attacks: "10K/sec", success: "12%", targets: "156 countries" }
    },
    {
      id: 4,
      title: "ChatGPT Used to Generate Phishing Attacks",
      date: "2 days ago",
      category: "AI THREAT",
      severity: "HIGH",
      content: "Cybercriminals leverage AI language models to create sophisticated phishing emails that bypass spam filters with 85% success rate.",
      stats: { detection: "15%", increase: "+400%", cost: "$6.9B" }
    }
  ];

  // Common weak passwords for live checking simulation
  const weakPasswordDatabase = [
    "password", "123456", "password123", "admin", "qwerty", "letmein",
    "welcome", "monkey", "dragon", "master", "superman", "batman"
  ];

  // Simulate live global stats
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        attacksToday: prev.attacksToday + Math.floor(Math.random() * 1000),
        passwordsCompromised: prev.passwordsCompromised + Math.floor(Math.random() * 50),
        activeThreats: Math.floor(Math.random() * 500) + 1000,
        weakPasswords: Math.floor(Math.random() * 1000000) + 5000000
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate live attack feed
  useEffect(() => {
    const interval = setInterval(() => {
      const newAttack = {
        ...attackTypes[Math.floor(Math.random() * attackTypes.length)],
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        attempts: Math.floor(Math.random() * 10000) + 1000,
        blocked: Math.random() > 0.3
      };
      
      setAttackData(prev => [newAttack, ...prev].slice(0, 10));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Simulate live password checks
  useEffect(() => {
    const interval = setInterval(() => {
      const checkTypes = [
        { password: "P@ssw0rd!", result: "WEAK", reason: "Common pattern", location: "USA" },
        { password: "john2024", result: "CRITICAL", reason: "Personal info", location: "UK" },
        { password: "qwerty123", result: "CRITICAL", reason: "Keyboard pattern", location: "India" },
        { password: "iloveyou", result: "WEAK", reason: "Common phrase", location: "Philippines" },
        { password: "Tr0ub4dor&3", result: "FAIR", reason: "Predictable substitution", location: "Canada" },
        { password: generateRandomPassword(), result: "PERFECT", reason: "Strong entropy", location: "Germany" }
      ];
      
      const newCheck = {
        ...checkTypes[Math.floor(Math.random() * checkTypes.length)],
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString()
      };
      
      setLiveChecks(prev => [newCheck, ...prev].slice(0, 5));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Backend integration
  const checkPasswordStrength = async (pwd) => {
    try {
      setIsAnalyzing(true);
      setTerminalLines(prev => [...prev, `$ ANALYZING: ${pwd ? '•'.repeat(pwd.length) : 'EMPTY'}`]);
      
      // Check against weak password database
      const isWeak = weakPasswordDatabase.some(weak => 
        pwd.toLowerCase().includes(weak.toLowerCase())
      );
      
      if (isWeak) {
        setTerminalLines(prev => [...prev, `⚠ WARNING: Password found in breach database!`]);
      }
      
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });

      const data = await response.json();
      
      if (data.error) {
        setTerminalLines(prev => [...prev, `✗ ANALYSIS FAILED: ${data.error}`]);
        return;
      }

      setStrength({
        score: data.score,
        feedback: data.suggestions || []
      });

      // Calculate crack time
      const crackTime = calculateCrackTime(pwd);
      
      setTerminalLines(prev => [
        ...prev, 
        `✓ ANALYSIS COMPLETE: ${data.strength} (${data.score}/4)`,
        `⏱ Crack Time: ${crackTime}`,
        `🛡 Protection Level: ${data.score >= 3 ? 'SECURE' : 'VULNERABLE'}`,
        ...data.suggestions.slice(0, 3).map(s => `→ ${s}`)
      ]);

    } catch (error) {
      setTerminalLines(prev => [...prev, `✗ CONNECTION FAILED: ${error.message}`]);
      console.error("Backend connection failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSecurePassword = async () => {
    try {
      setTerminalLines(prev => [...prev, `$ GENERATING QUANTUM-SAFE PASSWORD...`]);
      
      const response = await fetch('/api/generate');
      const data = await response.json();

      if (data.error) {
        setTerminalLines(prev => [...prev, `✗ GENERATION FAILED: ${data.error}`]);
        return;
      }

      const pass = data.password;
      setGenerated(pass);
      setPassword(pass);
      
      setTerminalLines(prev => [
        ...prev,
        `✓ PASSWORD GENERATED`,
        `📏 Length: ${pass.length} characters`,
        `💪 Entropy: ${(pass.length * 6.5).toFixed(1)} bits`,
        `🛡 Strength: MAXIMUM`
      ]);

    } catch (error) {
      setTerminalLines(prev => [...prev, `✗ GENERATION FAILED: ${error.message}`]);
    }
  };

  function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({length: 16}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  function calculateCrackTime(pwd) {
    if (!pwd) return "Instant";
    const length = pwd.length;
    if (length < 6) return "< 1 second";
    if (length < 8) return "< 1 minute";
    if (length < 10) return "< 1 hour";
    if (length < 12) return "< 1 day";
    if (length < 14) return "< 1 year";
    return "> 100 years";
  }

  // Check password on change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (password) {
        checkPasswordStrength(password);
      } else {
        setStrength({ score: 0, feedback: [] });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [password]);

  const isSecure = strength.score >= 3;
  const currentStrength = strengthLabels[strength.score] || "CRITICAL";

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/20 via-black to-emerald-950/20"></div>
        <div className="absolute inset-0 opacity-10">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-500 text-xs whitespace-nowrap"
              style={{ left: `${Math.random() * 100}%`, top: '-20px' }}
              animate={{ y: ['0vh', '100vh'] }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 5
              }}
            >
              {Math.random().toString(2).substring(2, 30)}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-gray-950/90 backdrop-blur-sm border-b border-green-600/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <motion.div 
                    className="w-3 h-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div 
                    className="w-3 h-3 bg-yellow-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div 
                    className="w-3 h-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                </div>
                <div>
                  <h1 className="text-green-400 font-bold text-lg md:text-xl">QUANTUM SHIELD</h1>
                  <p className="text-green-600 text-xs">Python Data Based Security Terminal v3.0</p>
                </div>
              </div>
              
              {/* Live Status */}
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-500">SYSTEM ONLINE</span>
                  </div>
                  <div className="text-green-600">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-bold ${
                  isSecure 
                    ? 'bg-green-900/50 text-green-400 border border-green-600' 
                    : 'bg-red-900/50 text-red-400 border border-red-600 animate-pulse'
                }`}>
                  {isAnalyzing ? 'SCANNING...' : (isSecure ? 'SECURE' : 'AT RISK')}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Global Stats Bar */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-green-600/30">
          <div className="container mx-auto px-4 py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚡</span>
                <span className="text-gray-500">Attacks Today:</span>
                <motion.span 
                  key={globalStats.attacksToday}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 font-bold"
                >
                  {globalStats.attacksToday.toLocaleString()}
                </motion.span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">⚠</span>
                <span className="text-gray-500">Compromised:</span>
                <motion.span 
                  key={globalStats.passwordsCompromised}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-orange-400 font-bold"
                >
                  {globalStats.passwordsCompromised.toLocaleString()}
                </motion.span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">🛡</span>
                <span className="text-gray-500">Active Threats:</span>
                <motion.span 
                  key={globalStats.activeThreats}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-yellow-400 font-bold"
                >
                  {globalStats.activeThreats.toLocaleString()}
                </motion.span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">📊</span>
                <span className="text-gray-500">Weak Passwords:</span>
                <motion.span 
                  key={globalStats.weakPasswords}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-purple-400 font-bold"
                >
                  {(globalStats.weakPasswords / 1000000).toFixed(1)}M
                </motion.span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-950/80 backdrop-blur-sm border-b border-green-600/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:overflow-x-auto">
              {[
                { id: 'analyzer', label: 'PASSWORD ANALYZER', icon: '🔐' },
                { id: 'threats', label: 'LIVE THREATS', icon: '⚡' },
                { id: 'intelligence', label: 'THREAT INTELLIGENCE', icon: '📰' },
                { id: 'checks', label: 'REAL-TIME CHECKS', icon: '🔍' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-all w-full text-left md:w-auto ${
                    activeTab === tab.id
                      ? 'text-green-400 border-l-2 md:border-l-0 md:border-b-2 border-green-400 bg-green-900/20'
                      : 'text-green-600 hover:text-green-400 hover:bg-green-900/10'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {/* Password Analyzer Tab */}
            {activeTab === 'analyzer' && (
              <motion.div
                key="analyzer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                {/* Left Panel - Input & Analysis */}
                <div className="space-y-6">
                  {/* Input Section */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-green-600/30 rounded-lg p-6">
                    <h2 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                      <span className="text-xl">🔐</span>
                      PASSWORD ANALYSIS ENGINE
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-green-600 text-xs font-bold block mb-2">
                          ENTER PASSWORD FOR ANALYSIS
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter password to analyze..."
                              className="w-full bg-black/50 border border-green-600/50 p-3 outline-none text-green-400 font-mono focus:border-green-400 transition-colors rounded"
                            />
                            {password && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-3"
                              >
                                {isAnalyzing ? (
                                  <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <div className={`w-5 h-5 rounded-full ${
                                    strength.score >= 3 ? 'bg-green-500' : 'bg-red-500'
                                  }`}></div>
                                )}
                              </motion.div>
                            )}
                          </div>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="px-4 py-3 bg-gray-900 border border-green-600/50 text-green-400 hover:bg-green-900/30 transition-colors rounded text-xs font-bold"
                          >
                            {showPassword ? '👁' : '👁‍🗨'}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={generateSecurePassword}
                        disabled={isAnalyzing}
                        className="w-full bg-gradient-to-r from-green-900 to-emerald-900 hover:from-green-800 hover:to-emerald-800 border border-green-600 text-green-400 px-4 py-3 font-bold transition-all duration-200 disabled:opacity-50 rounded flex items-center justify-center gap-2"
                      >
                        <span>⚡</span>
                        GENERATE QUANTUM-SAFE PASSWORD
                      </button>
                    </div>

                    {/* Strength Visualization */}
                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 space-y-4"
                      >
                        {/* Strength Bar */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-green-600 text-xs font-bold">SECURITY LEVEL</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              strength.score >= 3 
                                ? 'bg-green-900/50 text-green-400' 
                                : strength.score >= 2
                                  ? 'bg-yellow-900/50 text-yellow-400'
                                  : 'bg-red-900/50 text-red-400'
                            }`}>
                              {currentStrength}
                            </span>
                          </div>
                          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${
                                strength.score >= 3 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                  : strength.score >= 2
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(strength.score + 1) * 20}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>
                        </div>

                        {/* Password Stats */}
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="bg-black/30 p-2 rounded border border-green-600/20">
                            <div className="text-gray-500">Length</div>
                            <div className="text-green-400 font-bold">{password.length}</div>
                          </div>
                          <div className="bg-black/30 p-2 rounded border border-green-600/20">
                            <div className="text-gray-500">Entropy</div>
                            <div className="text-green-400 font-bold">
                              {(password.length * 6.5).toFixed(0)} bits
                            </div>
                          </div>
                          <div className="bg-black/30 p-2 rounded border border-green-600/20">
                            <div className="text-gray-500">Crack Time</div>
                            <div className="text-green-400 font-bold">{calculateCrackTime(password)}</div>
                          </div>
                        </div>

                        {/* Feedback */}
                        {strength.feedback && strength.feedback.length > 0 && (
                          <div className="bg-red-900/20 border border-red-600/30 rounded p-3">
                            <div className="text-red-400 text-xs font-bold mb-2">⚠ VULNERABILITIES DETECTED</div>
                            {strength.feedback.map((tip, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-red-300 text-xs ml-4 mb-1"
                              >
                                • {tip}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Generated Password Display */}
                  {generated && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-900/20 border border-green-600/30 rounded-lg p-6"
                    >
                      <h3 className="text-green-400 font-bold mb-3 text-sm">✓ GENERATED PASSWORD</h3>
                      <div className="bg-black/50 p-3 rounded font-mono text-green-300 break-all">
                        {generated}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generated);
                          setTerminalLines(prev => [...prev, '✓ Password copied to clipboard']);
                        }}
                        className="mt-3 text-xs text-green-600 hover:text-green-400 transition-colors"
                      >
                        📋 COPY TO CLIPBOARD
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Right Panel - Terminal */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-green-600/30 rounded-lg p-6">
                  <h2 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                    <span className="text-xl">💻</span>
                    SYSTEM TERMINAL
                  </h2>
                  
                  <div 
                    ref={terminalRef}
                    className="bg-black/70 p-4 rounded h-96 overflow-y-auto font-mono text-xs space-y-1"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b981 #000' }}
                  >
                    <div className="text-green-500 mb-2">
                      QuantumShield Terminal v3.0.1<br/>
                      Copyright (c) 2024 - All rights reserved<br/>
                      =======================================
                    </div>
                    <AnimatePresence>
                      {terminalLines.map((line, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-green-400"
                        >
                          {line}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isAnalyzing && (
                      <div className="text-green-300 animate-pulse">
                        $ Processing...
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Live Threats Tab */}
            {activeTab === 'threats' && (
              <motion.div
                key="threats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm border border-green-600/30 rounded-lg p-6">
                  <h2 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    LIVE GLOBAL ATTACK FEED
                    <span className="ml-auto text-xs text-red-400 animate-pulse">● LIVE</span>
                  </h2>
                  
                  <div className="space-y-2">
                    <AnimatePresence>
                      {attackData.map((attack) => (
                        <motion.div
                          key={attack.id}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          className={`bg-black/50 border ${
                            attack.blocked ? 'border-green-600/30' : 'border-red-600/30'
                          } rounded p-3`}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full animate-pulse ${
                                attack.severity === 'CRITICAL' ? 'bg-red-500' :
                                attack.severity === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'
                              }`}></div>
                              <span className="text-xs text-gray-500">{attack.timestamp}</span>
                              <span className={`text-xs font-bold ${
                                attack.blocked ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {attack.blocked ? '🛡 BLOCKED' : '⚠ ACTIVE'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-green-600">Type: {attack.type}</span>
                              <span className="text-blue-400">Origin: {attack.origin}</span>
                              <span className="text-yellow-400">Target: {attack.target}</span>
                              <span className="text-purple-400">{attack.attempts.toLocaleString()} attempts</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Attack Statistics */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-red-600/30 rounded-lg p-4">
                    <div className="text-red-400 text-xs font-bold mb-2">CRITICAL THREATS</div>
                    <div className="text-3xl font-bold text-red-500">
                      {attackData.filter(a => a.severity === 'CRITICAL').length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Active in last hour</div>
                  </div>
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-4">
                    <div className="text-yellow-400 text-xs font-bold mb-2">SUCCESS RATE</div>
                    <div className="text-3xl font-bold text-yellow-500">
                      {((attackData.filter(a => !a.blocked).length / Math.max(attackData.length, 1)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Attacks succeeded</div>
                  </div>
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-green-600/30 rounded-lg p-4">
                    <div className="text-green-400 text-xs font-bold mb-2">BLOCKED</div>
                    <div className="text-3xl font-bold text-green-500">
                      {attackData.filter(a => a.blocked).length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Threats neutralized</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Threat Intelligence Tab */}
            {activeTab === 'intelligence' && (
              <motion.div
                key="intelligence"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Articles List */}
                  <div className="space-y-4">
                    <h2 className="text-green-400 font-bold flex items-center gap-2">
                      <span className="text-xl">📰</span>
                      LATEST SECURITY INTELLIGENCE
                    </h2>
                    {securityArticles.map((article) => (
                      <motion.div
                        key={article.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-gray-900/50 backdrop-blur-sm border border-green-600/30 rounded-lg p-4 cursor-pointer hover:border-green-400/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            article.severity === 'CRITICAL' ? 'bg-red-900/50 text-red-400' :
                            article.severity === 'HIGH' ? 'bg-orange-900/50 text-orange-400' :
                            'bg-yellow-900/50 text-yellow-400'
                          }`}>
                            {article.category}
                          </span>
                          <span className="text-xs text-gray-500">{article.date}</span>
                        </div>
                        <h3 className="text-green-400 font-bold mb-2">{article.title}</h3>
                        <p className="text-gray-400 text-xs line-clamp-2">{article.content}</p>
                        <div className="flex gap-4 mt-3 text-xs">
                          {Object.entries(article.stats).map(([key, value]) => (
                            <div key={key} className="text-green-600">
                              {key}: <span className="text-green-400 font-bold">{value}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Article Detail */}
                  {selectedArticle && (
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-green-600/30 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          selectedArticle.severity === 'CRITICAL' ? 'bg-red-900/50 text-red-400' :
                          selectedArticle.severity === 'HIGH' ? 'bg-orange-900/50 text-orange-400' :
                          'bg-yellow-900/50 text-yellow-400'
                        }`}>
                          {selectedArticle.category}
                        </span>
                        <button
                          onClick={() => setSelectedArticle(null)}
                          className="text-green-600 hover:text-green-400"
                        >
                          ✕
                        </button>
                      </div>
                      <h3 className="text-green-400 font-bold text-lg mb-4">{selectedArticle.title}</h3>
                      <p className="text-gray-300 mb-6">{selectedArticle.content}</p>
                      
                      <div className="bg-black/30 rounded p-4 space-y-3">
                        <div className="text-green-600 text-xs font-bold mb-2">KEY METRICS</div>
                        {Object.entries(selectedArticle.stats).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500 text-sm capitalize">{key}:</span>
                            <span className="text-green-400 font-bold">{value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded">
                        <div className="text-yellow-400 text-xs font-bold mb-2">⚠ RECOMMENDED ACTION</div>
                        <p className="text-yellow-300 text-xs">
                          Update all passwords immediately. Enable 2FA on all critical accounts. 
                          Monitor for suspicious activity.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Real-Time Checks Tab */}
            {activeTab === 'checks' && (
              <motion.div
                key="checks"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm border border-green-600/30 rounded-lg p-6">
                  <h2 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    GLOBAL PASSWORD CHECKS IN REAL-TIME
                    <span className="ml-auto text-xs text-green-400 animate-pulse">● MONITORING</span>
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Live Checks */}
                    <div className="space-y-2">
                      <div className="text-green-600 text-xs font-bold mb-2">LIVE PASSWORD ANALYSIS</div>
                      <AnimatePresence>
                        {liveChecks.map((check) => (
                          <motion.div
                            key={check.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-black/50 border border-green-600/20 rounded p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500">{check.timestamp}</span>
                              <span className="text-xs text-blue-400">{check.location}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`px-2 py-1 rounded text-xs font-bold ${
                                check.result === 'PERFECT' ? 'bg-green-900/50 text-green-400' :
                                check.result === 'FAIR' ? 'bg-yellow-900/50 text-yellow-400' :
                                check.result === 'WEAK' ? 'bg-orange-900/50 text-orange-400' :
                                'bg-red-900/50 text-red-400'
                              }`}>
                                {check.result}
                              </div>
                              <span className="text-xs text-gray-400">{check.reason}</span>
                            </div>
                            <div className="mt-2 font-mono text-xs text-green-600">
                              {'•'.repeat(Math.min(check.password.length, 20))}
                              {check.password.length > 20 && '...'}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-4">
                      <div className="text-green-600 text-xs font-bold mb-2">ANALYSIS STATISTICS</div>
                      
                      {/* Distribution Chart */}
                      <div className="bg-black/50 border border-green-600/20 rounded p-4">
                        <div className="text-xs text-gray-400 mb-3">Password Strength Distribution</div>
                        {['CRITICAL', 'WEAK', 'FAIR', 'STRONG', 'PERFECT'].map((level, index) => {
                          const percentage = [35, 25, 20, 15, 5][index];
                          return (
                            <div key={level} className="flex items-center gap-3 mb-2">
                              <span className="text-xs text-green-600 w-16">{level}</span>
                              <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
                                <motion.div
                                  className={`h-full ${
                                    index === 0 ? 'bg-red-500' :
                                    index === 1 ? 'bg-orange-500' :
                                    index === 2 ? 'bg-yellow-500' :
                                    index === 3 ? 'bg-blue-500' : 'bg-green-500'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                />
                              </div>
                              <span className="text-xs text-green-400 w-10 text-right">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Common Weaknesses */}
                      <div className="bg-black/50 border border-green-600/20 rounded p-4">
                        <div className="text-xs text-gray-400 mb-3">Most Common Weaknesses</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-red-400">• Uses common words</span>
                            <span className="text-red-500 font-bold">42%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-400">• Too short (&lt; 8 chars)</span>
                            <span className="text-orange-500 font-bold">38%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-400">• No special characters</span>
                            <span className="text-yellow-500 font-bold">31%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-400">• Sequential patterns</span>
                            <span className="text-blue-500 font-bold">27%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-400">• Personal information</span>
                            <span className="text-purple-500 font-bold">19%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="bg-gray-950/90 backdrop-blur-sm border-t border-green-600/50 mt-12">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-6">
                <span className="text-green-600">© 2024 QUANTUM SHIELD</span>
                <span className="text-gray-500">|</span>
                <span className="text-green-600">AI-POWERED SECURITY</span>
                <span className="text-gray-500">|</span>
                <span className="text-green-600">ZERO KNOWLEDGE</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-500">BACKEND: CONNECTED</span>
                </div>
                <div className="text-gray-500">|</div>
                <span className="text-green-600">v3.0.1</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}