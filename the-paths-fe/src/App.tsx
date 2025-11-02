import React, { useState } from 'react';

interface TreeNode {
  id: string;
  text: string;
  timestamp: number;
  type?: 'positive' | 'neutral' | 'negative';
  children: TreeNode[];
  isSelected: boolean;
}

function App() {
  const [input, setInput] = useState('');
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

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

  const handleSubmit = async (promptText: string, nodeId: string | null = null) => {
    console.log('handleSubmit called with:', promptText, 'nodeId:', nodeId);
    
    if (!promptText.trim()) return;
    
    setLoading(true);
    
    try {
      console.log('Making fetch request...');
      
      const response = await fetch('/.netlify/functions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: promptText })
      });
      
      console.log('Fetch response received:', response.status);
      
      const data = await response.json();
      const parsedScenarios = parseScenarios(data.scenarios);
      setScenarios(parsedScenarios);
      
      // Add children to the tree
      if (nodeId && tree) {
        const children: TreeNode[] = parsedScenarios.map((scenario, index) => ({
          id: `${nodeId}-${index}`,
          text: scenario,
          timestamp: Date.now(),
          type: getScenarioType(scenario),
          children: [],
          isSelected: false
        }));
        
        updateNodeChildren(tree, nodeId, children);
        setTree({...tree});
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const updateNodeChildren = (node: TreeNode, targetId: string, children: TreeNode[]): TreeNode => {
    if (node.id === targetId) {
      return { ...node, children };
    }
    
    if (node.children.length > 0) {
      return {
        ...node,
        children: node.children.map(child => updateNodeChildren(child, targetId, children))
      };
    }
    
    return node;
  };

  const markNodeAsSelected = (node: TreeNode, targetId: string): TreeNode => {
    if (node.id === targetId) {
      return { ...node, isSelected: true };
    }
    
    if (node.children.length > 0) {
      return {
        ...node,
        children: node.children.map(child => markNodeAsSelected(child, targetId))
      };
    }
    
    return node;
  };

  const handleScenarioClick = (scenario: string, index: number) => {
    if (!currentNodeId) return;
    
    const newNodeId = `${currentNodeId}-${index}`;
    
    // Mark this node as selected in the tree
    setTree(currentTree => {
      if (!currentTree) return currentTree;
      return markNodeAsSelected(currentTree, newNodeId);
    });
    
    setCurrentNodeId(newNodeId);
    
    const cleanScenario = scenario
      .replace(/\*\*/g, '')
      .replace(/^(Positive|Neutral|Negative)\n/i, '')
      .trim();
    
    const prompt = `Given that this happened: "${cleanScenario}", what are 3 possible next outcomes?`;
    handleSubmit(prompt, newNodeId);
  };
=======
  const handleScenarioClick = (scenario: string) => {
  const type = getScenarioType(scenario);
  const cleanScenario = scenario
    .replace(/\*\*/g, '')
    .replace(/^(Positive|Neutral|Negative)\n/i, '')
    .trim();
  
  const prompt = `Given that this happened: "${cleanScenario}", what are 3 possible next outcomes?`;
  handleSubmit(prompt, false, type);
};
>>>>>>> parent of 64c20cb (actual app.tsx version)

  const handleInitialGenerate = () => {
    console.log('handleInitialGenerate called with input:', input);
    
    const rootId = 'root';
    const root: TreeNode = {
      id: rootId,
      text: input,
      timestamp: Date.now(),
      children: [],
      isSelected: true
    };
    
    console.log('Setting tree to:', root);
    console.log('Setting currentNodeId to:', rootId);
    
    setTree(root);
    setCurrentNodeId(rootId);
    handleSubmit(input, rootId);
  };

  const getButtonColor = (index: number) => {
    const colors = [
      'bg-green-50 hover:bg-green-100 border-green-600',
      'bg-yellow-50 hover:bg-yellow-100 border-yellow-600',
      'bg-red-50 hover:bg-red-100 border-red-600'
    ];
    return colors[index] || 'bg-gray-50 hover:bg-gray-100 border-gray-800';
  };

  const getNodeColor = (node: TreeNode) => {
    if (node.isSelected) {
      switch(node.type) {
        case 'positive': return 'bg-green-200 border-green-700';
        case 'neutral': return 'bg-yellow-200 border-yellow-700';
        case 'negative': return 'bg-red-200 border-red-700';
        default: return 'bg-blue-200 border-blue-700';
      }
    } else {
      switch(node.type) {
        case 'positive': return 'bg-green-50 border-green-400';
        case 'neutral': return 'bg-yellow-50 border-yellow-400';
        case 'negative': return 'bg-red-50 border-red-400';
        default: return 'bg-blue-50 border-blue-400';
      }
    }
  };

  const TreeNodeComponent = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
    console.log('Rendering node:', node.id, 'Children:', node.children?.length || 0);
    
    const hasChildren = node.children && node.children.length > 0;
    const cleanText = node.text.replace(/\*\*/g, '').trim();
    const displayText = cleanText.length > 100 ? cleanText.substring(0, 100) + '...' : cleanText;
    
    return (
      <div className="flex flex-col items-center">
        <div className={`border-2 rounded-lg p-3 ${getNodeColor(node)} min-w-[150px] max-w-[200px] text-center`}>
          <div className="text-xs font-bold mb-1">
            {level === 0 ? 'Start' : node.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : 'Option'}
          </div>
          <div className="text-xs leading-tight">
            {displayText}
          </div>
        </div>
        
        {hasChildren && (
          <>
            <div className="h-6 w-0.5 bg-gray-400" />
            <div className="flex gap-8 relative">
              {node.children.length > 1 && (
                <div className="absolute top-0 h-0.5 bg-gray-400" 
                     style={{ 
                       left: `calc(50% - ${(node.children.length - 1) * 100}px)`,
                       width: `${(node.children.length - 1) * 200}px`
                     }} 
                />
              )}
              {node.children.map((child) => (
                <div key={child.id} className="relative">
                  <div className="h-6 w-0.5 bg-gray-400 mx-auto" />
                  <TreeNodeComponent node={child} level={level + 1} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="border-2 border-gray-800 rounded-lg p-4 md:p-8 bg-white mb-8">
          <div className="text-center mb-4 md:mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">The Paths</h1>
            <p className="text-base md:text-lg text-gray-600">A tool to help pathing out scenarios</p>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your situation..."
            className="w-full p-4 border-2 border-gray-800 rounded-lg mb-4 md:mb-6 text-base md:text-lg resize-none focus:outline-none focus:border-gray-600"
            style={{ height: '150px' }}
          />

          <div className="flex justify-center mb-4 md:mb-6">
            <button 
              onClick={handleInitialGenerate} 
              disabled={loading || !input.trim()}
              className="px-8 md:px-12 py-2 md:py-3 border-2 border-gray-800 rounded-lg text-base md:text-lg hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.length > 0 ? (
              scenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => handleScenarioClick(scenario, index)}
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
        </div>

        {tree && (
          <div className="border-2 border-gray-800 rounded-lg p-8 bg-white overflow-x-auto">
            <h2 className="font-bold text-xl mb-6 text-center">Your Decision Tree</h2>
            <div className="flex justify-center pb-8">
              <TreeNodeComponent node={tree} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;