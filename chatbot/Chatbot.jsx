import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import axios
import { SendHorizontal, Loader2 } from 'lucide-react'; // Icons for send and loading

// Base URL for the backend API - read from Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'; 
console.log('API Base URL:', API_BASE_URL); // For debugging

// Placeholder Chatbot Component
function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([ // Start with an initial greeting
    { role: 'model', text: 'Hi there! I am Rex, the AI assistant for regenmed.ai. How can I help you explore our services or schedule a consultation?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // Ref to scroll to bottom

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    // Scroll to bottom whenever messages update
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return; // Don't send empty or while loading

    const newUserMessage = { role: 'user', text: trimmedInput };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    // Prepare history for the API call (matching Gemini API format)
    const historyForAPI = messages.map(msg => ({ 
        role: msg.role, 
        parts: [{ text: msg.text }]
    }));

    try {
        // Send message and history to the backend
        const response = await axios.post(`${API_BASE_URL}/api/chat`, {
            message: trimmedInput,
            history: historyForAPI
        }, { withCredentials: true }); // <-- Important for sending session cookies

        const botReply = response.data.reply;
        if (botReply) {
            setMessages(prev => [...prev, { role: 'model', text: botReply }]);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prev => [...prev, { role: 'model', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
        setIsLoading(false);
        // Ensure scroll happens after state update
        // requestAnimationFrame(scrollToBottom);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, allow Shift+Enter for newline
      e.preventDefault(); // Prevent default form submission/newline
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1000]"> {/* Ensure high z-index */}
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-brand-primary text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
          aria-label="Open chat"
        >
          {/* Replace with a proper chat icon - using MessageSquare from lucide */} 
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 h-[500px] flex flex-col border border-brand-border overflow-hidden">
          {/* Header */}
          <div className="bg-brand-primary text-white p-3 flex justify-between items-center rounded-t-lg flex-shrink-0">
            <h3 className="font-semibold text-sm">Rex - regenmed.ai Assistant</h3>
            <button onClick={toggleChat} className="text-white hover:opacity-80" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Message Area */} 
          <div className="flex-1 p-4 overflow-y-auto bg-brand-bgSubtle space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${ 
                    msg.role === 'user' 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-gray-200 text-brand-textPrimary'
                  }`}
                >
                  {/* Basic rendering - consider markdown support later */} 
                  {msg.text.split('\n').map((line, i) => (
                      <span key={i}>{line}<br/></span>
                  ))}
                </div>
              </div>
            ))}
            {/* Empty div to target for scrolling */} 
            <div ref={messagesEndRef} /> 
          </div>

          {/* Input Area */} 
          <div className="p-3 border-t border-brand-border bg-white flex items-center gap-2 flex-shrink-0">
            <input 
              type="text" 
              placeholder="Ask Rex..." 
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading} // Disable input while loading
              className="flex-1 p-2 border border-brand-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-50"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()} // Disable if loading or input empty
              className="bg-brand-primary text-white p-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <SendHorizontal size={20} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot; 