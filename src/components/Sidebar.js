// src/components/Sidebar.js
import React from "react";

export default function Sidebar(props) {
  return (
    <div className="sidebar">
      {/* Music Section */}
      <h3>🎵 Jams</h3>
      <button onClick={() => props.playAudio("classic1")}>Music Track 1</button>
      <button onClick={() => props.playAudio("classic2")}>Music Track 2</button>
      <button onClick={() => props.playAudio("lofibeat")}>1 Hour Track</button>
      <button onClick={props.stopAudio}>Stop</button>

      {/* Volume Control */}
      <div className="volume-slider">
        <label htmlFor="volume">🔊 Volume</label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={props.volume}
          onChange={e => props.setVolume(parseFloat(e.target.value))}
        />
      </div>

      {/* Focus Stats */}
      <div className="focus-stats">
        <p>🕒 Total Time Studied: {props.formatTime(props.seconds)}</p>
        <p>🧠 Current Session: {props.formatTime(props.sessionSeconds)}</p>
        <p className="xp">🔥 Total XP: {props.xp}</p>
        <button
          onClick={() => props.setIsXpLogModalOpen(true)}
          className="open-log-button"
        >
          View XP Log 📊
        </button>
      </div>

      {/* Pomodoro Section */}
      <div className="pomodoro">
        <h3>🎯 Pomodoro</h3>
        {props.isPomoRunning ? (
          <>
            <p className="pomodoro-status">
              {props.isBreak ? "🌿 Break Time" : "💪 Focus Time"}
            </p>
            <p className="pomodoro-timer">{props.formatTime(props.pomoSeconds)}</p>
            <button
              onClick={() => {
                props.setIsPomoRunning(false);
                props.setIsBreak(false);
                props.setPomoSeconds(0);
                props.addNotification("Pomodoro timer stopped.");
              }}
              className="stop-pomodoro-button"
            >
              Stop Timer
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              props.setIsPomoRunning(true);
              props.setIsBreak(false);
              props.setPomoSeconds(1500);
              props.addNotification("Pomodoro focus started!");
            }}
            className="start-pomodoro-button"
          >
            Start Focus (25 min)
          </button>
        )}
        <p>🍝 Sessions Completed: {props.pomoCompleted}</p>
        <p className="xp">🔥 Pomo XP: +{props.pomoXP}</p>
      </div>

      {/* View Toggles */}
      <button onClick={() => props.setActiveView("calendar")}>
        🗓️ Open Calendar
      </button>
      <button
        onClick={() => props.setActiveView("game")}
        style={{ marginTop: "0.5rem" }}
        disabled={props.activeView === "game"}
      >
        🎮 Back to Game
      </button>
    </div>
  );
}
