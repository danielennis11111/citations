import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Minimize2, Maximize2, RotateCcw, FolderOpen } from 'lucide-react';

interface TerminalSession {
  id: string;
  command: string;
  output: string;
  exitCode: number;
  timestamp: Date;
  workingDirectory: string;
}

interface EmbeddedTerminalProps {
  workingDirectory: string;
  isVisible: boolean;
  onClose: () => void;
  onDirectoryChange: (newDirectory: string) => void;
}

const EmbeddedTerminal: React.FC<EmbeddedTerminalProps> = ({
  workingDirectory,
  isVisible,
  onClose,
  onDirectoryChange
}) => {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible, isMinimized]);

  useEffect(() => {
    // Auto-scroll to bottom when new content is added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [sessions]);

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsExecuting(true);
    const sessionId = Date.now().toString();
    
    // Add command to session immediately
    const newSession: TerminalSession = {
      id: sessionId,
      command: command.trim(),
      output: 'Executing...',
      exitCode: 0,
      timestamp: new Date(),
      workingDirectory
    };
    
    setSessions(prev => [...prev, newSession]);
    setCurrentCommand('');

    try {
      // Handle built-in commands
      if (command.trim().startsWith('cd ')) {
        const newDir = command.trim().substring(3).trim();
        let targetDir = newDir;
        
        // Handle relative paths
        if (!newDir.startsWith('/')) {
          targetDir = `${workingDirectory}/${newDir}`.replace(/\/+/g, '/');
        }
        
        // Validate directory exists
        const response = await fetch('http://localhost:3001/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            command: `test -d "${targetDir}" && echo "valid" || echo "invalid"`,
            cwd: workingDirectory 
          })
        });
        
        const result = await response.json();
        
        if (result.success && result.stdout.trim() === 'valid') {
          onDirectoryChange(targetDir);
          setSessions(prev => prev.map(s => 
            s.id === sessionId 
              ? { ...s, output: `Changed directory to: ${targetDir}`, exitCode: 0 }
              : s
          ));
        } else {
          setSessions(prev => prev.map(s => 
            s.id === sessionId 
              ? { ...s, output: `cd: ${newDir}: No such file or directory`, exitCode: 1 }
              : s
          ));
        }
        return;
      }

      // Execute command via backend API
      const response = await fetch('http://localhost:3001/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: command.trim(),
          cwd: workingDirectory 
        })
      });

      const result = await response.json();
      
      // Update session with result
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { 
              ...s, 
              output: result.stdout || result.stderr || 'Command completed',
              exitCode: result.code || (result.success ? 0 : 1)
            }
          : s
      ));

    } catch (error) {
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { 
              ...s, 
              output: `Error: ${error instanceof Error ? error.message : String(error)}`,
              exitCode: 1
            }
          : s
      ));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExecuting) {
      executeCommand(currentCommand);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic tab completion could be added here
    }
  };

  const clearTerminal = () => {
    setSessions([]);
  };

  const getPrompt = () => {
    const dirName = workingDirectory.split('/').pop() || 'root';
    return `${dirName} $`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">Terminal</span>
          <div className="text-xs text-gray-400 font-mono">
            {workingDirectory.length > 30 
              ? `...${workingDirectory.slice(-30)}` 
              : workingDirectory
            }
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          
          <button
            onClick={clearTerminal}
            className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
            title="Clear terminal"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            title="Close terminal"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="bg-gray-900 text-green-400 p-3 rounded-b-lg">
          {/* Terminal Content */}
          <div 
            ref={terminalRef}
            className="font-mono text-sm max-h-64 overflow-y-auto space-y-1"
          >
            {sessions.map((session) => (
              <div key={session.id} className="space-y-1">
                {/* Command */}
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">{getPrompt()}</span>
                  <span className="text-white">{session.command}</span>
                </div>
                
                {/* Output */}
                <div className={`pl-4 whitespace-pre-wrap text-xs ${
                  session.exitCode === 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {session.output}
                </div>
              </div>
            ))}
            
            {/* Current Input */}
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">{getPrompt()}</span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isExecuting}
                className="flex-1 bg-transparent text-white outline-none"
                placeholder={isExecuting ? 'Executing...' : 'Type a command...'}
              />
            </div>
          </div>
          
          {/* Terminal Shortcuts */}
          <div className="mt-3 pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-500 space-y-1">
              <div>• <kbd className="bg-gray-800 px-1 rounded">Enter</kbd> to execute</div>
              <div>• <kbd className="bg-gray-800 px-1 rounded">cd [dir]</kbd> to change directory</div>
              <div>• Common: <span className="text-blue-400">ls, pwd, npm start, git status</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbeddedTerminal; 