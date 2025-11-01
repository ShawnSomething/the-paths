import React, { useState } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

const parseScenarios = (text: string): string[] => {
  // Split by **Positive**, **Neutral**, **Negative**
  const parts = text.split(/\*\*(Positive|Neutral|Negative)\*\*/i);
  const scenarios: string[] = [];
  
  for (let i = 1; i < parts.length; i += 2) {
    const type = parts[i];
    const content = parts[i + 1]?.trim();
    if (content) {
      scenarios.push(`**${type}**\n${content}`);
    }
  }
  
  return scenarios.length === 3 ? scenarios : [text];
};
  const handleSubmit = async (promptText: string) => {
    if (!promptText.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/submit', {
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
    handleSubmit(`Based on this scenario: "${scenario}", provide 3 possible next scenarios. One positive, one neutral, and one negative.`);
  };

  const getButtonColor = (index: number) => {
    const colors = [
      'bg-green-50 hover:bg-green-100 border-green-600',
      'bg-yellow-50 hover:bg-yellow-100 border-yellow-600',
      'bg-red-50 hover:bg-red-100 border-red-600'
    ];
    return colors[index] || 'bg-gray-50 hover:bg-gray-100 border-gray-800';
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full h-full max-w-7xl border-2 border-gray-800 rounded-lg p-4 md:p-8 bg-white flex flex-col">
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">The Paths</h1>
          <p className="text-base md:text-lg text-gray-600">A tool to help pathing out decisions</p>
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
            onClick={() => handleSubmit(input)} 
            disabled={loading}
            className="px-8 md:px-12 py-2 md:py-3 border-2 border-gray-800 rounded-lg text-base md:text-lg hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
          {scenarios.length > 0 ? (
            scenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => handleScenarioClick(scenario)}
                disabled={loading}
                className={`p-4 border-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left overflow-y-auto ${getButtonColor(index)}`}
              >
                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{scenario}</div>
              </button>
            ))
          ) : (
            <>
              <div className="border-2 border-gray-800 rounded-lg p-6 flex items-center justify-center bg-gray-50">
                <div className="text-gray-400 text-center">Scenario 1</div>
              </div>
              <div className="border-2 border-gray-800 rounded-lg p-6 flex items-center justify-center bg-gray-50">
                <div className="text-gray-400 text-center">Scenario 2</div>
              </div>
              <div className="border-2 border-gray-800 rounded-lg p-6 flex items-center justify-center bg-gray-50">
                <div className="text-gray-400 text-center">Scenario 3</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;