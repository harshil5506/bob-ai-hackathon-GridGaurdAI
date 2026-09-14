import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import './BobPanel.css';

export const BobPanel: React.FC = () => {
  const [messages, setMessages] = useState<{sender: 'user'|'bob', text: string}[]>([
    { sender: 'bob', text: 'Hello! I am IBM Bob, your Grid Advisor. How can I help you manage grid risk today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Mock Bob's response
    setTimeout(() => {
      let bobReply = "I've analyzed the grid data. Please refer to the maintenance and risk dashboards for specific actionable insights.";
      
      const lowerInput = userMsg.toLowerCase();
      if (lowerInput.includes('why') && lowerInput.includes('sub-001')) {
        bobReply = "Northside Substation Alpha (SUB-001) is critical because it has sustained partial discharge over 400pC, and there is a severe thunderstorm forecasted. This combination historically leads to failure.";
      } else if (lowerInput.includes('recommendation') || lowerInput.includes('crew')) {
        bobReply = "I recommend dispatching a diagnostic team immediately to Downtown Staging Point B before 18:00 local time to mitigate the risk of catastrophic failure.";
      }

      setMessages(prev => [...prev, { sender: 'bob', text: bobReply }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="bob-panel">
      <div className="bob-header">
        <Bot size={20} className="text-blue" />
        <h3>IBM Bob Advisor</h3>
      </div>
      <div className="bob-chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble bob typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
      </div>
      <div className="bob-input-area">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Bob about grid risk..."
        />
        <button onClick={handleSend} className="btn-send">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
