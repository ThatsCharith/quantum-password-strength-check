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
  const terminalRef = useRef(null);

  // ✅ 5-level mapping: 0=Critical, 1=Weak, 2=Fair, 3=Strong, 4=Perfect
  const strengthLabels = ["CRITICAL", "WEAK", "FAIR", "STRONG", "PERFECT"];

  // Auto-scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // ✅ Direct backend integration (no remapping needed)
  const checkPasswordStrength = async (pwd) => {
    try {
      setIsAnalyzing(true);
      setTerminalLines(prev => [...prev, `$ ANALYZING PASSWORD: ${pwd ? '****' : 'EMPTY'} → CONNECTED TO BACKEND`]);
      
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });

      const data = await response.json();
      
      if (data.error) {
        setTerminalLines(prev => [...prev, `$ ANALYSIS FAILED: ${data.error}`]);
        return;
      }

      // ✅ Use backend values directly - no remapping
      setStrength({
        score: data.score, // 0-4 from backend
        feedback: data.suggestions || []
      });

      setTerminalLines(prev => [
        ...prev, 
        `$ ANALYSIS COMPLETE: ${data.strength} (${data.score}/4)`,
        `$ THREAT LEVEL: ${data.strength}`,
        ...data.suggestions.slice(0, 3).map(s => `$ RECOMMENDATION: ${s}`)
      ]);

    } catch (error) {
      setTerminalLines(prev => [...prev, `$ CONNECTION FAILED: ${error.message}`]);
      console.error("Backend connection failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSecurePassword = async () => {
    try {
      setTerminalLines(prev => [...prev, `$ GENERATING PASSWORD: CONNECTING TO BACKEND`]);
      
      const response = await fetch('/api/generate');
      const data = await response.json();

      if (data.error) {
        setTerminalLines(prev => [...prev, `$ GENERATION FAILED: ${data.error}`]);
        return;
      }

      const pass = data.password;
      setGenerated(pass);
      setPassword(pass);
      
      setTerminalLines(prev => [
        ...prev,
        `$ PASSWORD GENERATED: SUCCESS`,
        `$ LENGTH: ${pass.length}`,
        `$ STRENGTH: ${pass.length >= 12 ? 'PERFECT' : 'STRONG'}`
      ]);

    } catch (error) {
      setTerminalLines(prev => [...prev, `$ GENERATION FAILED: ${error.message}`]);
    }
  };

  // Check password on change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (password) {
        checkPasswordStrength(password);
      } else {
        setStrength({ score: 0, feedback: [] });
        setTerminalLines(prev => [...prev, `$ PASSWORD CLEARED`]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [password]);

  // Password visibility
  useEffect(() => {
    if (password && showPassword) {
      setTerminalLines(prev => [...prev, `$ VISIBILITY: ENABLED`]);
    } else if (password) {
      setTerminalLines(prev => [...prev, `$ VISIBILITY: ENCRYPTED`]);
    }
  }, [showPassword, password]);

  const isSecure = strength.score >= 3;
  const currentStrength = strengthLabels[strength.score] || "CRITICAL";

  return (
    <div className="absolute inset-0 bg-black text-green-400 font-mono overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/10 to-green-900/20 pointer-events-none"></div>
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        ></div>
        {/* Falling Code */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-400 text-xs whitespace-nowrap font-mono"
              style={{
                left: `${i * 5}%`,
                top: '-20px',
              }}
              animate={{
                y: ['0px', '100vh'],
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 3
              }}
            >
              {Array.from({length: 30}, () => Math.random() > 0.85 ? '1' : '0').join('')}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <div>
              <div className="text-green-400 font-bold text-lg">QUANTUM SECURITY TERMINAL</div>
              <div className="text-green-600 text-sm">AI-Powered Analysis</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xs px-3 py-1 rounded font-bold ${
              isSecure 
                ? 'bg-green-900/70 text-green-400 border border-green-600' 
                : 'bg-red-900/70 text-red-400 border border-red-600'
            }`}>
              {isAnalyzing ? 'SCANNING...' : (isSecure ? 'SECURE' : 'VULNERABLE')}
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Panel */}
          <div className="w-1/2 border-r border-green-600 bg-black/85 p-6 flex flex-col">
            {/* Input Section */}
            <div className="mb-6">
              <div className="text-green-600 text-sm font-bold mb-3">PASSWORD ANALYSIS</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-sm min-w-24">PASSWORD:</span>
                  <div className="flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full bg-black border border-green-600 p-2 outline-none text-green-400 font-mono text-sm focus:border-green-400 transition-colors"
                      style={{ minWidth: '150px' }}
                    />
                  </div>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-green-600 hover:text-green-400 px-2 py-1 border border-green-600 hover:border-green-400 transition-colors text-xs"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>

                <button
                  onClick={generateSecurePassword}
                  disabled={isAnalyzing}
                  className="w-full bg-green-900 hover:bg-green-800 border border-green-600 text-green-400 px-3 py-2 text-sm font-bold transition-all duration-200 hover:border-green-400 disabled:opacity-50"
                >
                  {isAnalyzing ? "PROCESSING..." : "$ GENERATE SECURE PASSWORD"}
                </button>
              </div>
            </div>

            {/* Strength Bar */}
            {password && (
              <div className="space-y-4 flex-1">
                <div>
                  <div className="text-green-600 text-sm font-bold">SECURITY STRENGTH</div>
                  <div className="flex items-center gap-2 mt-1">
                    {/* ✅ Fixed 5-segment bar */}
                    <div className="flex-1 h-3 bg-green-900/50 rounded overflow-hidden flex">
                      {[0, 1, 2, 3, 4].map((segment) => (
                        <motion.div
                          key={segment}
                          className={`h-full ${
                            segment <= strength.score
                              ? segment < 2 
                                ? 'bg-red-500' 
                                : segment < 3 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                              : 'bg-gray-800'
                          } ${segment !== 4 ? 'border-r border-black' : ''}`}
                          style={{ width: '20%' }}
                          transition={{ duration: 0.5 }}
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-bold min-w-20 text-center ${
                      strength.score >= 3 ? 'text-green-400' : 'text-red-500'
                    }`}>
                      {currentStrength}
                    </span>
                  </div>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {strength.feedback && strength.feedback.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-l-2 border-red-500 pl-3"
                    >
                      <div className="text-red-400 text-xs font-bold">$ VULNERABILITIES:</div>
                      {strength.feedback.map((tip, i) => (
                        <div key={i} className="text-red-300 text-xs ml-2">
                          → {tip}
                        </div>
                      ))}
                    </motion.div>
                  ) : password && !isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-green-400 text-xs font-bold"
                    >
                      $ ✓ ALL SYSTEMS SECURE
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-1/2 bg-black/85 p-6 flex flex-col">
            <div className="text-green-600 text-sm font-bold mb-3">REAL-TIME LOG</div>
            
            {/* Generated Password */}
            {generated && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-600 rounded">
                <div className="text-green-600 text-xs font-bold">$ GENERATED:</div>
                <div className="text-green-300 font-mono text-xs break-all bg-black/50 p-1 rounded">
                  {generated}
                </div>
              </div>
            )}

            {/* Terminal Log */}
            <div 
              ref={terminalRef}
              className="flex-1 bg-black/60 p-3 rounded border border-green-600 overflow-y-auto text-xs space-y-1 pr-2"
              style={{ scrollbarWidth: 'none' }}
            >
              <style jsx>{`div::-webkit-scrollbar { width: 0px; }`}</style>
              <AnimatePresence>
                {terminalLines.slice(-20).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-green-500 font-mono leading-tight"
                  >
                    {line}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 border-t border-green-600 px-6 py-2">
          <div className="text-center text-green-600 text-xs">
            CONNECTED TO BACKEND • REAL ANALYSIS • NO DATA RETENTION
          </div>
        </div>
      </div>
    </div>
  );
}