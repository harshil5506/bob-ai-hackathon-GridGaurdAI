import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import './BobPanel.css';

export const BobPanel: React.FC = () => {
  const [messages, setMessages] = useState<{sender: 'user'|'bob', text: string}[]>([
    { sender: 'bob', text: 'Hello! I am IBM Bob, your Grid Advisor. How can I help you manage grid risk today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const lowerInput = userMsg.toLowerCase();
      let bobReply = "I am monitoring the grid. Ask me about 'risks', 'recommendations', or 'weather' for specific insights.";
      const backendUrl = (import.meta as any).env?.VITE_API_URL || 'https://backend-omega-ten-80.vercel.app';
      
      // Fetch dynamic data based on keywords
      try {
        if (lowerInput.includes('risk') || lowerInput.includes('critical') || lowerInput.includes('status')) {
          const res = await fetch(`${backendUrl}/api/risk-assessments`);
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            const topRisk = data.data[0];
            bobReply = `The highest risk asset is currently ${topRisk.asset_name} (${topRisk.asset_id}) with a risk score of ${topRisk.outage_risk_score}. The primary risk driver is: ${topRisk.primary_risk_driver}.`;
          } else {
            bobReply = "Currently, there are no critical risk assessments in the database.";
          }
        } else if (lowerInput.includes('recommend') || lowerInput.includes('crew') || lowerInput.includes('action') || lowerInput.includes('fix')) {
          const res = await fetch(`${backendUrl}/api/recommendations`);
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            const topRec = data.data[0];
            bobReply = `Recommendation for ${topRec.asset_name}: ${topRec.recommended_action}. ${topRec.bob_reasoning_summary} Required crew: ${topRec.crew_type_required}.`;
          } else {
            bobReply = "I don't have any immediate maintenance recommendations at this time.";
          }
        } else if (lowerInput.includes('weather') || lowerInput.includes('storm') || lowerInput.includes('lightning')) {
          const res = await fetch(`${backendUrl}/api/weather/alerts`);
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            const topAlert = data.data[0];
            bobReply = `There is a ${topAlert.storm_alert_level} weather alert for ${topAlert.substation_name}. Wind gusts up to ${topAlert.wind_gust_kmh} km/h are expected.`;
          } else {
            bobReply = "There are no severe weather alerts active at this time.";
          }
        }
      } catch (err) {
        console.warn('Backend fetch fallback:', err);
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bob', text: bobReply }]);
        setIsTyping(false);
      }, 800);
      
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bob', text: "I'm having trouble connecting to the grid telemetry servers at the moment." }]);
        setIsTyping(false);
      }, 800);
    }
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
        <div ref={messagesEndRef} />
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
