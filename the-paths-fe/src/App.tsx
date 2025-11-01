import React, { useState } from 'react';

interface PathNode {
  text: string;
  timestamp: number;
  type?: 'positive' | 'neutral' | 'negative';
}

function App() {
  const [input, setInput] = useState('');
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<PathNode[]>([]);

  const parseScenarios = (text: string): string[] => {
    let parts = text.split(/\*\*(Positive|Neutral|Negative)\*\*/i);
    
    if (parts.length >= 7) {
      const scenarios: string[] = [];
      for (let i = 1; i < parts.length; i += 2) {
        const type = parts[i];
        const content = parts[i + 1]?.trim();
        if (content) {
          scenarios.push(`**${type}**\n${content}`);
        }
      }
      if (scenarios.length === 3) return scenarios;
    }
    
    parts = text.split(/\n\n+/);
    if (parts.length >= 3) {
      return parts.filter(s => s.trim().length > 50).slice(0, 3);
    }
    
    return [text, '', ''];
  };

  const getScenarioType = (scenario: string): 'positive' | 'neutral' | 'negative' | undefined => {
    if (scenario.includes('**Positive**')) return 'positive';
    if (scenario.includes('**Neutral**')) return 'neutral';
    if (scenario.includes('**Negative**')) return 'negative';
    return undefined;
  };

  const handleSubmit = async (promptText: string, isInitial: boolean = false, type?: 'positive' | 'neutral' | 'negative') => {
    if (!promptText.trim()) return;
    
    setLoading(true);
    
    if (!isInitial) {
      setPath(prev => [...prev, { text: promptText, timestamp: Date.now(), type }]);
    }
    
    try {
      const response = await fetch('http://3.26.216.181:4000/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: promptText })
      });
      
      const data = await response.json();
      setScenarios(parseScenarios(data.scenarios));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioClick = (scenario: string) => {
    const type = getScenarioType(scenario);
    handleSubmit(scenario, false, type);
  };

  const handleInitialGenerate = () => {
    setPath([{ text: input, timestamp: Date.now() }]);
    handleSubmit(input, true);
  };

  const getButtonColor = (index: number) => {
    const colors = [
      'bg-green-50 hover:bg-green-100 border-green-600',
      'bg-yellow-50 hover:bg-yellow-100 border-yellow-600',
      'bg-red-50 hover:bg-red-100 border-red-600'
    ];
    return colors[index] || 'bg-gray-50 hover:bg-gray-100 border-gray-800';
  };

  const getNodeColor = (type?: 'positive' | 'neutral' | 'negative') => {
    switch(type) {
      case 'positive': return 'bg-green-100 border-green-600';
      case 'neutral': return 'bg-yellow-100 border-yellow-600';
      case 'negative': return 'bg-red-100 border-red-600';
      default: return 'bg-blue-100 border-blue-600';
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full h-full max-w-7xl border-2 border-gray-800 rounded-lg p-4 md:p-8 bg-white flex flex-col overflow-hidden">
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">The Paths</h1>
          <p className="text-base md:text-lg text-gray-600">A tool to help pathing out scenarios. Totally trustworthy, follow it with your life</p>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your situation..."
          className="w-full p-4 border-2 border-gray-800 rounded-lg mb-4 md:mb-6 flex-shrink-0 text-base md:text-lg resize-none focus:outline-none focus:border-gray-600"
          style={{ height: '150px' }}
        />

        <div className="flex justify-center mb-4 md:mb-6">
          <button 
            onClick={handleInitialGenerate} 
            disabled={loading}
            className="px-8 md:px-12 py-2 md:py-3 border-2 border-gray-800 rounded-lg text-base md:text-lg hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
            {scenarios.length > 0 ? (
              scenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => handleScenarioClick(scenario)}
                  disabled={loading}
                  className={`p-4 border-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left ${getButtonColor(index)}`}
                  style={{ minHeight: '200px' }}
                >
                  <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{scenario}</div>
                </button>
              ))
            ) : (
              <>
                <div className="border-2 border-gray-800 rounded-lg p-6 flex items-center justify-center bg-gray-50" style={{ minHeight: '200px' }}>
                  <div className="text-gray-400 text-center">Scenario 1</div>
                </div>
                <div className="border-2 border-gray-800 rounded-lg p-6 flex items-center justify-center bg-gray-50" style={{ minHeight: '200px' }}>
                  <div className="text-gray-400 text-center">Scenario 2</div>
                </div>
                <div className="border-2 border-gray-800 rounded-lg p-6 flex items-center justify-center bg-gray-50" style={{ minHeight: '200px' }}>
                  <div className="text-gray-400 text-center">Scenario 3</div>
                </div>
              </>
            )}
          </div>

          {path.length > 0 && (
            <div className="border-2 border-gray-800 rounded-lg p-6 bg-white flex-shrink-0">
              <h2 className="font-bold text-lg mb-4">Your Decision Tree</h2>
              <div className="flex flex-col items-center gap-2">
                {path.map((node, index) => (
                  <React.Fragment key={node.timestamp}>
                    <div className={`border-2 rounded-lg p-4 ${getNodeColor(node.type)} w-full max-w-md`}>
                      <div className="text-sm font-bold mb-2">
                        {index === 0 ? 'Start' : node.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : 'Decision'}
                      </div>
                      <div className="text-sm">
                        {node.text.length > 150 ? node.text.substring(0, 150) + '...' : node.text}
                      </div>
                    </div>
                    {index < path.length - 1 && (
                      <div className="flex justify-center">
                        <svg width="2" height="30" className="text-gray-400">
                          <line x1="1" y1="0" x2="1" y2="30" stroke="currentColor" strokeWidth="2"/>
                          <polygon points="1,30 4,25 -2,25" fill="currentColor"/>
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;