import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Send, Sparkles, MessageSquare, HelpCircle, ArrowRight, Volume2, VolumeX } from 'lucide-react';

const Chatbot = () => {
  const { apiCall } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const chatEndRef = useRef(null);

  const speak = (text) => {
    if (speechEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Suggestions chips for quick query insertion
  const suggestionChips = [
    { label: "What courses are offered?", query: "what courses are offered in engineering?" },
    { label: "Tuition fee structure?", query: "tell me about the annual tuition fee structure" },
    { label: "Exam schedules & rules?", query: "when are end-semester exams and what are the rules?" },
    { label: "Placement cell statistics?", query: "what is the average placement package and recruitment rate?" },
    { label: "Library timings & books?", query: "what are the library hours and how many books can I borrow?" },
    { label: "Hostel & canteen facilities?", query: "tell me about hostel accommodation and canteen facilities" }
  ];

  const fetchChatHistory = async () => {
    try {
      const data = await apiCall('/chatbot/history');
      // Format backend chat history (user_message, bot_response) into flat message array
      const flatMessages = [];
      data.history.forEach((chat) => {
        flatMessages.push({ id: `u-${chat.id}`, text: chat.user_message, sender: 'user', time: chat.timestamp });
        flatMessages.push({ id: `b-${chat.id}`, text: chat.bot_response, sender: 'bot', time: chat.timestamp });
      });
      setMessages(flatMessages);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputValue.trim();
    if (!query) return;

    // Clear input
    setInputValue('');

    // Append user message locally
    const userMsgId = Date.now();
    setMessages((prev) => [...prev, { id: userMsgId, text: query, sender: 'user', time: new Date().toISOString() }]);
    
    setSending(true);

    try {
      const data = await apiCall('/chatbot/query', {
        method: 'POST',
        body: JSON.stringify({ message: query })
      });

      // Append bot response locally
      setMessages((prev) => [
        ...prev,
        { id: `bot-${data.chat.id}`, text: data.chat.bot_response, sender: 'bot', time: data.chat.timestamp }
      ]);
      
      // Read aloud if enabled
      if (speechEnabled) {
        speak(data.chat.bot_response);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { 
          id: `err-${Date.now()}`, 
          text: "I encountered an error connecting to the AI brain. Please check if backend/run.py is running and try again.", 
          sender: 'bot', 
          time: new Date().toISOString(),
          isError: true 
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <div className="pl-64">
        <Navbar title="AI Smart Campus Chatbot" />
        
        <main className="p-8 pt-24 h-[calc(100vh-16px)] flex flex-col max-w-5xl mx-auto">
          {/* Chat Container */}
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden h-full">
            {/* Header banner */}
            <div className="p-4 bg-indigo-50/50 border-b border-slate-100 dark:bg-indigo-950/20 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">AI Assistant</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Ask about courses, fees, exams, placements, and campus rules.</p>
                </div>
              </div>
              
              {/* Read Aloud Toggle */}
              <button
                onClick={() => {
                  setSpeechEnabled(!speechEnabled);
                  if (speechEnabled && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${speechEnabled ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
              >
                {speechEnabled ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
                Read Aloud
              </button>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 chat-bg-light dark:chat-bg-dark transition-all">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                  <p className="text-xs text-slate-400 mt-2">Loading conversation...</p>
                </div>
              ) : messages.length === 0 ? (
                /* Empty Chat Board */
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-12">
                  <div className="h-14 w-14 bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Campus Knowledge Engine</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Hello! I'm your Hugging Face-powered Smart Assistant. Ask me anything about XYZ college campus operations or use the suggestion chips below to test.
                  </p>
                </div>
              ) : (
                /* Message Bubbles */
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : msg.isError 
                          ? 'bg-red-50 border border-red-100 text-red-800 rounded-bl-none dark:bg-red-950/20 dark:border-red-900 dark:text-red-400'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span
                        className={`text-[9px] mt-1 block text-right font-medium ${
                          msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* Typing Indicator */}
              {sending && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-6 py-4 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center">
                    <div className="dot-flashing"></div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Suggestion Chips */}
            {messages.length === 0 && !historyLoading && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
                  Suggested Inquiries
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestionChips.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => handleSend(chip.query)}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400 bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-900 transition-all flex items-center gap-1 focus:outline-none"
                    >
                      {chip.label}
                      <ArrowRight className="h-3 w-3 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a campus-related question..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !inputValue.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chatbot;
