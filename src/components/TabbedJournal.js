import React, { useState, useEffect } from "react";

const TabbedJournal = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("comunaNotebookTabs");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTabs(parsed);
          setActiveTabId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse stored tabs:", e);
      }
    } else {
      // Only initialize if localStorage is actually empty
      const defaultTab = {
        id: Date.now().toString(),
        title: "Feelings",
        content: "",
      };
      setTabs([defaultTab]);
      setActiveTabId(defaultTab.id);
    }
  }, []);
  

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("comunaNotebookTabs", JSON.stringify(tabs));
  }, [tabs]);

  const addTab = () => {
    const newTab = {
      id: Date.now().toString(),
      title: `Untitled ${tabs.length + 1}`,
      content: "",
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const deleteTab = (id) => {
    const filtered = tabs.filter(tab => tab.id !== id);
    setTabs(filtered);
    if (activeTabId === id && filtered.length > 0) {
      setActiveTabId(filtered[0].id);
    } else if (filtered.length === 0) {
      setActiveTabId(null);
    }
  };

  const updateContent = (newContent) => {
    setTabs(prev =>
      prev.map(tab =>
        tab.id === activeTabId ? { ...tab, content: newContent } : tab
      )
    );
  };

  const renameTab = (id, newTitle) => {
    setTabs(prev =>
      prev.map(tab =>
        tab.id === id ? { ...tab, title: newTitle } : tab
      )
    );
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="journal-container">
      <div className="tab-bar">
        {tabs.map((tab) => (
          <div key={tab.id} className={`tab ${tab.id === activeTabId ? "active" : ""}`}>
            <input
              value={tab.title}
              onChange={(e) => renameTab(tab.id, e.target.value)}
              className="tab-title"
            />
            <button onClick={() => setActiveTabId(tab.id)}>📖</button>
            <button onClick={() => deleteTab(tab.id)}>❌</button>
          </div>
        ))}
        <button className="add-tab" onClick={addTab}>➕ Add Tab</button>
      </div>

      {activeTab && (
        <textarea
          className="journal-textarea"
          value={activeTab.content}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Write your thoughts here..."
        />
      )}
    </div>
  );
};

export default TabbedJournal;
