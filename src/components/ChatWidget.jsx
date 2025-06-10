// src/components/ChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react';

export default function ChatWidget() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Predefined multiplayer script events
  const script = [
  { from: 'player2', text: 'whats up chat', delay: 2000 },
  { from: 'player3', text: 'lol just glitched through a wall?', delay: 6000 },
  { from: 'player2', text: 'teach me that trick dawg', delay: 9000 },
  { from: 'player4', text: '/e dance', delay: 13000 },
  { from: 'player3', text: 'this is NOT roblox what are you doing', delay: 17000 },
  { from: 'player5', text: "bro miku just sent me to a youtube video about armored mma", delay: 22000 },
  { from: 'player2', text: 'miku just stole my ip address?', delay: 28000 },
  { from: 'player4', text: 'bro who th put gurt in the game', delay: 34000 },
  { from: 'SYSTEM', text: '⚠ player2 has been kicked for “getting humbled by a hologram”', delay: 40000 },
  { from: 'player5', text: 'nah he ascended', delay: 46000 },
  { from: 'player6', text: 'who submitted the assignment with comic sans???', delay: 48000 },
  { from: 'player7', text: 'that’s wild accusations, i didn’t even OPEN the doc yet', delay: 52000 },
  { from: 'player8', text: 'ngl it was me but i thought it looked “fun” 😭', delay: 56000 },
  { from: 'player6', text: 'bro you put a doge meme in the references section', delay: 60000 },
  { from: 'player7', text: 'i cant even log in without seeing a minion gif now', delay: 64000 },
  { from: 'player8', text: 'yall said make it engaging 😐', delay: 68000 },
  { from: 'SYSTEM', text: '⚠ player8 has been reported for “graphic design crimes”', delay: 72000 },
  { from: 'player6', text: 'nah he’s fighting for his creative vision i respect it', delay: 76000 }
];

  // Schedule scripted messages
  useEffect(() => {
    let total = 1000; // start after 1s
    const timers = script.map(evt => {
      total += evt.delay;
      return setTimeout(() => {
        setMessages(prev => [...prev, { text: evt.text, from: evt.from }]);
      }, total);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // auto-scroll on new message
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleOpen = () => setOpen(prev => !prev);
  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, from: 'player1' }]);
    setInput('');
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter') sendMessage();
  };

  // Shared header styles
  const headerStyles = {
    height: '32px',
    lineHeight: '32px',
    padding: open ? '0 8px' : '0',
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: open ? 'space-between' : 'center',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  // Close button styles
  const closeButtonStyles = {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0',
    margin: '0',
  };

  // Open icon/button styles
  const openButtonStyles = {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0',
    margin: '0',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: open ? '220px' : '32px',
        height: open ? '180px' : '32px',
        background: 'rgba(33,33,33,0.8)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#fff',
        boxShadow: '0 0 5px rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* header with visible close/open button */}
      <div style={headerStyles}>
        {open ? (
          <>
            <span>Chat</span>
            <button onClick={toggleOpen} style={closeButtonStyles}>✕</button>
          </>
        ) : (
          <button onClick={toggleOpen} style={openButtonStyles}>💬</button>
        )}
      </div>

      {/* chat log */}
      {open && (
        <>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '4px',
              height: 'calc(100% - 64px)',
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '2px' }}>
                <span style={{ color: '#00FF00', fontWeight: 'bold' }}>{m.from}:</span>{' '}
                <span style={{ color: '#fff' }}>{m.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* input area */}
          <div style={{ borderTop: '1px solid #555', padding: '4px' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="To chat click here or press /"
              style={{
                width: '100%',
                padding: '4px',
                border: 'none',
                borderRadius: '2px',
                background: '#222',
                color: '#fff',
                outline: 'none',
                fontSize: '12px',
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
