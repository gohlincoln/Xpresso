// src/App.js - Updated with Modal Integration (Same as previous response)
import React, { useEffect, useRef, useState } from "react";
import EventCalendar from "./components/EventCalendar";
import { getTodaysEvents } from "./components/getTodaysEvents";
import XpLogModal from "./components/XpLogModal"; // Import the new modal component
import TabbedJournal from "./components/TabbedJournal"; //Import the Notes App
import "./App.css";
// Make sure you have the 'Press Start 2P' font available or remove the reference if not.

const formatTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600));
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const App = () => {
  // predetermined route for the bot to follow
  const route = [
    { x: 900, y: 560 }, // top-right
    { x: 500, y: 560 }, // top-left
    { x: 500, y: 400 }, // bottom-left
    { x: 900, y: 400 }, // bottom-right
  ];
  // track which waypoint we’re heading toward
  const [routeIndex, setRouteIndex] = useState(0);
  const [botPosition, setBotPosition] = useState({ x: 900, y: 560 }); // Add this line
  const botPositionRef = useRef(botPosition);

  const mikuSprite = new window.Image();
  mikuSprite.src = process.env.PUBLIC_URL + "/mikusprite1.jpg";
  const mikuPosition = { x: 900, y: 120 }; // wherever you want her to stand
  const mikuSize = { w: 200, h: 200 }; // adjust to taste
  const [mikuMessage, setMikuMessage] = useState("");
  const [mikuDialogueStage, setMikuDialogueStage] = useState("idle");
  const gurtBot = { w: 40, h: 40 }; // Adjust as needed
  const gurtPosition = { x: 1400, y: 480 }; // Wherever you want him
  const [isNearGurt, setIsNearGurt] = useState(false);
  const [showGurtDialogue, setShowGurtDialogue] = useState(false);
  const [gurtMessage, setGurtMessage] = useState("");

  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const [activeView, setActiveView] = useState("game");
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem("calendarCompleted");
    return saved ? JSON.parse(saved) : [];
  });
  const [showJournal, setShowJournal] = useState(false);

  // --- XP Log State ---
  const [xpLog, setXpLog] = useState(() => {
    const savedLog = localStorage.getItem("xpLog");
    return savedLog ? JSON.parse(savedLog) : [];
  });

  // --- Modal State ---
  const [isXpLogModalOpen, setIsXpLogModalOpen] = useState(false); // State to control modal visibility

  useEffect(() => {
    localStorage.setItem("calendarCompleted", JSON.stringify(completedTasks));
  }, [completedTasks]);
  //botmovement
  useEffect(() => {
    const moveBot = () => {
      setBotPosition((prev) => {
        const target = route[routeIndex];
        const step = 5; // pixels per tick
        let dx = target.x - prev.x;
        let dy = target.y - prev.y;

        // normalize movement so we don’t overshoot
        const dist = Math.hypot(dx, dy) || 1;
        const vx = (dx / dist) * step;
        const vy = (dy / dist) * step;

        const newX = Math.abs(dx) < step ? target.x : prev.x + vx;
        const newY = Math.abs(dy) < step ? target.y : prev.y + vy;
        const updated = { x: newX, y: newY };
        botPositionRef.current = updated;

        // once we reach the target, advance to the next waypoint
        if (newX === target.x && newY === target.y) {
          setRouteIndex((idx) => (idx + 1) % route.length);
        }

        return updated;
      });
    };

    const interval = setInterval(moveBot, 200); // adjust speed here
    return () => clearInterval(interval);
  }, [routeIndex]); // re-run effect whenever we advance to a new waypoint
  // --- Save XP Log to localStorage ---
  useEffect(() => {
    localStorage.setItem("xpLog", JSON.stringify(xpLog));
  }, [xpLog]);

  const toggleTask = (title) => {
    const isCompletedNow = !completedTasks.includes(title); // Check *before* updating state
    setCompletedTasks((prev) =>
      isCompletedNow ? [...prev, title] : prev.filter((t) => t !== title)
    );
  };

  const coachBot = {
    w: 90,
    h: 140,
    sprite: new window.Image(),
    getDialogue: (xp) => {
      if (xp < 10) return "Welcome to the grind! Let’s get started. 💼";
      if (xp < 30) return "You're picking up speed! Proud of you. 🚀";
      if (xp < 60) return "You're unstoppable! Keep that streak alive. 🔥";
      return "You're a legend now. Don't forget your fans. 😤👑";
    },
  };
  coachBot.sprite.src = process.env.PUBLIC_URL + "/xpressocoach.png";

  const book = {
    img: new window.Image(),
    xRatio: 0.235, // 75% of canvas widtha
    yRatio: 0.55, // 55% of canvas height
    w: 80,
    h: 80,
    loaded: false,
    get x() {
      return canvasRef.current?.width * this.xRatio;
    },
    get y() {
      return canvasRef.current?.height * this.yRatio;
    },
  };
  const calendarHotspot = {
    xRatio: 0.545, // tweak this for position
    yRatio: 0.16, // tweak this for height
    w: 64,
    h: 64,
    get x() {
      return canvasRef.current?.width * this.xRatio;
    },
    get y() {
      return canvasRef.current?.height * this.yRatio;
    },
  };

  const GurtIndicator = {
    img: new window.Image(),
    xOffset: 0, // adjust later if needed
    yOffset: -50,
    w: 40,
    h: 40,
    loaded: false,
  };

  const indicator = {
    img: new window.Image(),
    xOffset: 22, // adjust later if needed
    yOffset: -26,
    w: 40,
    h: 40,
    loaded: false,
  };
  const botIndicator = {
    img: new window.Image(),
    xOffset: 120,
    yOffset: -40,
    w: 40,
    h: 40,
    loaded: false,
  };

  botIndicator.img.src = process.env.PUBLIC_URL + "/lettere.jpg"; // reuse your E image
  botIndicator.img.onload = () => {
    botIndicator.loaded = true;
  };

  indicator.img.src = process.env.PUBLIC_URL + "/lettere.jpg";
  indicator.img.onload = () => {
    indicator.loaded = true;
  };
  GurtIndicator.img.src = process.env.PUBLIC_URL + "/lettere.jpg";
  GurtIndicator.img.onload = () => {
    GurtIndicator.loaded = true;
  };
  book.img.src = process.env.PUBLIC_URL + "/book.jpg";
  book.img.onload = () => {
    book.loaded = true;
  };
  const threatenWithIP = () => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        setMikuDialogueStage("ipThreat");
        setMikuMessage(
          `I’ve got your IP address now. ${data.ip}. Be checking up on you realll soon`
        );
        setTimeout(() => {
          setMikuMessage("");
          setMikuDialogueStage("idle");
        }, 4000);
      })
      .catch(() => {
        setMikuDialogueStage("ipThreat");
        setMikuMessage(
          "Couldn't get your IP... but I *will* find another way. 🔍"
        );
        setTimeout(() => {
          setMikuMessage("");
          setMikuDialogueStage("idle");
        }, 4000);
      });
  };

  const [volume, setVolume] = useState(0.5);
  const [xp, setXp] = useState(() =>
    parseInt(localStorage.getItem("xp") || "0", 10)
  );
  const [notifications, setNotifications] = useState([]);
  const [seconds, setSeconds] = useState(() => {
    return parseInt(localStorage.getItem("totalStudyTime") || "0", 10);
  });

  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [pomoCompleted, setPomoCompleted] = useState(() =>
    parseInt(localStorage.getItem("pomoCompleted") || "0", 10)
  );
  const [pomoXP, setPomoXP] = useState(() =>
    parseInt(localStorage.getItem("pomoXP") || "0", 10)
  );
  const [sessionSeconds, setSessionSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const [botMessage, setBotMessage] = useState(""); // Message shown when bot talks

  const audioRefs = useRef({
    classic1: new Audio(process.env.PUBLIC_URL + "/classic1.mp3"),
    classic2: new Audio(process.env.PUBLIC_URL + "/classic2.mp3"),
    lofibeat: new Audio(process.env.PUBLIC_URL + "/lofibeat.mp3"),
  });
  // these numbers are just examples—play with them until it sits nicely
  const mikuIndicatorOffset = {
    xOffset: 100, // move it closer/further on X
    yOffset: -20, // move it up/down on Y
  };

  // --- Unified Add XP Function ---
  const addXP = (amount, source) => {
    setXp((old) => {
      const newTotalXP = old + amount;
      localStorage.setItem("xp", newTotalXP.toString());

      // Add to log
      const logEntry = {
        id: Date.now() + Math.random(), // Use a combination for a more unique ID
        amount: amount,
        source: source,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }), // Nicer time format
      };
      // Keep only the last N log entries (e.g., last 50)
      setXpLog((prevLog) => [logEntry, ...prevLog].slice(0, 50)); // Increased log size

      // Show notification
      addNotification(`+${amount} XP — ${source}`);
      return newTotalXP;
    });

    // If XP comes from Pomodoro, update pomoXP too
    if (source === "Pomodoro Completed" || source === "Pomodoro Focus") {
      setPomoXP((oldPomoXP) => {
        const newPomoXP = oldPomoXP + amount;
        localStorage.setItem("pomoXP", newPomoXP.toString());
        return newPomoXP;
      });
    }
  };

  const addNotification = (text) => {
    const id = Date.now();
    setNotifications((n) => [...n, { id, text }]);
    setTimeout(
      () => setNotifications((n) => n.filter((t) => t.id !== id)),
      3000
    );
  };

  useEffect(() => {
    Object.values(audioRefs.current).forEach((a) => (a.volume = volume));
  }, [volume]);

  const playAudio = (track) => {
    Object.values(audioRefs.current).forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
    audioRefs.current[track]?.play().catch((error) => {
      console.error("Audio playback failed:", error);
      // Handle errors like user gesture requirement for autoplay
      // Maybe show a message to the user
    });
  };

  const stopAudio = () => {
    Object.values(audioRefs.current).forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
  };

  // global focus timer
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => {
        const updated = prev + 1;
        localStorage.setItem("totalStudyTime", updated.toString());
        return updated;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (sessionSeconds > 0 && sessionSeconds % 300 === 0) {
      addXP(1, "Session Focus");
    }
  }, [sessionSeconds]);

  // simplified Pomodoro countdown interval
  useEffect(() => {
    let id;
    if (isPomoRunning) {
      id = setInterval(() => setPomoSeconds((t) => Math.max(0, t - 1)), 1000);
    }
    return () => clearInterval(id);
  }, [isPomoRunning]);

  // award +1 XP every 5 minutes of POMODORO focus
  useEffect(() => {
    if (!isPomoRunning || isBreak) return;
    const focusDuration = 1500; // 25 minutes in seconds
    const elapsed = focusDuration - pomoSeconds;

    // Award XP at 5, 10, 15, 20 minutes into the 25-minute session
    // The condition `elapsed % 300 === 0` checks for multiples of 5 minutes
    // `elapsed > 0` ensures we don't award at the very beginning (0 seconds elapsed)
    // `elapsed <= focusDuration` ensures we only award during the focus period
    if (elapsed > 0 && elapsed <= focusDuration && elapsed % 300 === 0) {
      // Add a check to prevent multiple awards if the effect runs multiple times
      // at the exact second. This is basic and might need refinement for edge cases.
      // A more robust solution might involve tracking the last awarded timestamp
      // specifically for Pomodoro Focus.
      // For now, relying on the interval's precision.
      addXP(1, "Pomodoro Focus"); // Use the unified function
    }
  }, [pomoSeconds, isPomoRunning, isBreak]); // Keep original dependencies

  // handle end of focus or break without resetting global timer
  useEffect(() => {
    if (!isPomoRunning) return;
    if (pomoSeconds !== 0) return;

    if (!isBreak) {
      // focus complete
      addXP(2, "Pomodoro Completed"); // Award 2 XP for completing a full session

      setPomoCompleted((c) => {
        const nc = c + 1;
        localStorage.setItem("pomoCompleted", nc.toString());
        return nc;
      });
      // pomoXP is handled by addXP now

      setIsBreak(true);
      setPomoSeconds(300); // Start 5 min break (300 seconds)
    } else {
      // break complete
      addNotification("Break Over! Ready for next focus?"); // Optional notification
      setIsPomoRunning(false);
      setIsBreak(false);
      setPomoSeconds(0); // Reset pomo timer
    }
  }, [pomoSeconds, isPomoRunning, isBreak, addXP]); // Added addXP to dependencies as it's used inside

  // This useEffect solely ensures the total XP state is saved whenever it changes.
  // The actual saving happens within addXP now, but this is a good fallback.
  useEffect(() => {
    localStorage.setItem("xp", xp.toString());
  }, [xp]);

  useEffect(() => {
    // Only run the game canvas setup if activeView is 'game'
    let bopTimer = 0;
    if (activeView === "game") {
      setTodaysTasks(getTodaysEvents()); // Fetch today's tasks when entering game view
      const canvas = canvasRef.current;
      if (!canvas) return; // Guard clause
      const ctx = canvas.getContext("2d");
      if (!ctx) return; // Guard clause

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.imageSmoothingEnabled = false;

      let animationFrameId; // To cancel the animation frame on cleanup
      let loadedImages = 0;
      const totalImages = 4;
      const startLoop = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          console.log("Images loaded, starting game loop");
          gameLoop(); // Start the loop only when all images are loaded
        }
      };
      indicator.img.addEventListener("load", startLoop);
      indicator.img.addEventListener("error", (e) =>
        console.error("Failed to load indicator image:", e)
      );
      book.img.addEventListener("load", () => {
        book.loaded = true;
        startLoop();
      });
      book.img.addEventListener("error", (e) =>
        console.error("Failed to load book image:", e)
      );

      const bgSprite = {
        img: new window.Image(),
        x: 0,
        y: 0,
        w: canvas.width,
        h: canvas.height,
        loaded: false,
      };
      const playerSprite = {
        img: new window.Image(),
        x: 100,
        y: 100,
        w: 90,
        h: 140,
        speed: 5,
        loaded: false,
      };

      // Use event listeners for image loading
      bgSprite.img.addEventListener("load", () => {
        bgSprite.loaded = true;
        startLoop();
      });
      playerSprite.img.addEventListener("load", () => {
        playerSprite.loaded = true;
        startLoop();
      });

      bgSprite.img.addEventListener("error", (e) =>
        console.error("Failed to load background image:", e)
      );
      playerSprite.img.addEventListener("error", (e) =>
        console.error("Failed to load player image:", e)
      );

      bgSprite.img.src = process.env.PUBLIC_URL + "/studyroom.png";
      playerSprite.img.src = process.env.PUBLIC_URL + "/player.png";

      const isNearBook = () => {
        return (
          playerSprite.x < book.x + book.w &&
          playerSprite.x + playerSprite.w > book.x &&
          playerSprite.y < book.y + book.h &&
          playerSprite.y + playerSprite.h > book.y
        );
      };
      // alongside isNearBot() and isNearBook()
      const isNearMiku = () => {
        const { x: px, y: py, w: pw, h: ph } = playerSprite;
        const mx = mikuPosition.x,
          my = mikuPosition.y,
          mw = mikuSize.w,
          mh = mikuSize.h;
        return px < mx + mw && px + pw > mx && py < my + mh && py + ph > my;
      };
      const isNearBot = () => {
        const { x: bx, y: by } = botPositionRef.current;
        const { x: px, y: py, w: pw, h: ph } = playerSprite;
        const bw = coachBot.w;
        const bh = coachBot.h;

        const margin = 60; // try adjusting this value (distance buffer)

        return (
          px + pw > bx - margin &&
          px < bx + bw + margin &&
          py + ph > by - margin &&
          py < by + bh + margin
        );
      };
      const isNearGurt = () => {
        const { x: px, y: py, w: pw, h: ph } = playerSprite;
        const gx = gurtPosition.x;
        const gy = gurtPosition.y;
        const gw = gurtBot.w;
        const gh = gurtBot.h;
        const margin = 60;

        return (
          px + pw > gx - margin &&
          px < gx + gw + margin &&
          py + ph > gy - margin &&
          py < gy + gh + margin
        );
      };

      const isNearCalendar = () => {
        return (
          playerSprite.x < calendarHotspot.x + calendarHotspot.w &&
          playerSprite.x + playerSprite.w > calendarHotspot.x &&
          playerSprite.y < calendarHotspot.y + calendarHotspot.h &&
          playerSprite.y + playerSprite.h > calendarHotspot.y
        );
      };
      const mikuBot = {
        w: mikuSize.w,
        h: mikuSize.h,
        sprite: mikuSprite,
        getDialogue: () => "Blue Hair Blue Eyes, hiding in your wifi",
      };

      const handleKeyDown = (e) => {
        const key = e.key.toLowerCase();
        keysRef.current[key] = true;
        if (key === "e" && isNearBot()) {
          setBotMessage(coachBot.getDialogue(xp));
          setTimeout(() => setBotMessage(""), 4000); // hides after 4s
        }
        if (key === "e" && isNearMiku() && mikuDialogueStage === "idle") {
          setMikuDialogueStage("start");
          setMikuMessage(
            ">Hi there! Im Miku! You seem busy... or at least, you *look* like you're working."
          );
        }
        if (key === "e" && isNearGurt()) {
          setShowGurtDialogue(true);
          setTimeout(() => setShowGurtDialogue(false), 3000);
        }

        if (key === "e" && isNearBook()) {
          setShowJournal(true);
        }
        if (key === "e" && isNearCalendar()) {
          setActiveView("calendar");
          addNotification("📅 Entered the calendar!");
        }
      };
      const handleKeyUp = (e) => {
        keysRef.current[e.key.toLowerCase()] = false; // Use lowercase keys
      };
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      function movePlayer() {
        const k = keysRef.current;
        let dx = 0;
        let dy = 0;

        if (k["arrowup"] || k["w"]) dy -= playerSprite.speed;
        if (k["arrowdown"] || k["s"]) dy += playerSprite.speed;
        if (k["arrowleft"] || k["a"]) dx -= playerSprite.speed;
        if (k["arrowright"] || k["d"]) dx += playerSprite.speed;

        // Basic boundary check - keep player within canvas bounds
        const nextX = playerSprite.x + dx;
        const nextY = playerSprite.y + dy;

        playerSprite.x = Math.max(
          0,
          Math.min(canvas.width - playerSprite.w, nextX)
        );
        playerSprite.y = Math.max(
          0,
          Math.min(canvas.height - playerSprite.h, nextY)
        );
      }

      function draw() {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background only if loaded and valid
        if (
          bgSprite.loaded &&
          bgSprite.img.complete &&
          bgSprite.img.naturalWidth > 0
        ) {
          ctx.drawImage(
            bgSprite.img,
            bgSprite.x,
            bgSprite.y,
            bgSprite.w,
            bgSprite.h
          );
          const { x: bx, y: by } = botPositionRef.current;

          // Draw coachBot (static, at a DIFFERENT position)
          if (coachBot.sprite.complete && coachBot.sprite.naturalWidth > 0) {
            ctx.drawImage(
              coachBot.sprite,
              bx + 100,
              by,
              coachBot.w,
              coachBot.h
            ); // +100 to avoid overlap
          }
          if (mikuBot.sprite.complete) {
            ctx.drawImage(
              mikuBot.sprite,
              mikuPosition.x,
              mikuPosition.y,
              mikuBot.w,
              mikuBot.h
            );
          }
          // draw the bobbing “!” over the bot when nearby
          if (botIndicator.loaded && isNearBot()) {
            const bopY = Math.sin(bopTimer) * 5;
            ctx.drawImage(
              botIndicator.img,
              bx + botIndicator.xOffset,
              by + botIndicator.yOffset + bopY,
              botIndicator.w,
              botIndicator.h
            );
          }

          if (indicator.loaded && isNearMiku()) {
            const bopY = Math.sin(bopTimer) * 5;
            ctx.drawImage(
              indicator.img,
              mikuPosition.x + mikuIndicatorOffset.xOffset,
              mikuPosition.y + mikuIndicatorOffset.yOffset + bopY,
              indicator.w,
              indicator.h
            );
          }
          if (GurtIndicator.loaded && isNearGurt()) {
            const bopY = Math.sin(bopTimer) * 5;
            ctx.drawImage(
              GurtIndicator.img,
              gurtPosition.x + GurtIndicator.xOffset,
              gurtPosition.y + GurtIndicator.yOffset + bopY,
              GurtIndicator.w,
              GurtIndicator.h
            );
          }
          if (botIndicator.loaded && isNearCalendar()) {
            const bopY = Math.sin(bopTimer) * 5;
            ctx.drawImage(
              botIndicator.img,
              calendarHotspot.x,
              calendarHotspot.y - 40 + bopY,
              40,
              40
            );
          }

          // Draw the book
          if (book.loaded && book.img.complete && book.img.naturalWidth > 0) {
            ctx.drawImage(book.img, book.x, book.y, book.w, book.h);
          }

          if (
            indicator.loaded &&
            isNearBook() // player must be nearby
          ) {
            const bopY = Math.sin(bopTimer) * 5; // 5 pixels up/down
            ctx.drawImage(
              indicator.img,
              book.x + indicator.xOffset,
              book.y + indicator.yOffset + bopY,
              indicator.w,
              indicator.h
            );
          }
        } else {
          // Fallback or loading indicator
          ctx.fillStyle = "#cccccc";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#000000";
          ctx.font = "16px Arial";
          ctx.fillText("Loading background...", 10, 30);
        }

        // Draw player only if loaded and valid
        if (
          playerSprite.loaded &&
          playerSprite.img.complete &&
          playerSprite.img.naturalWidth > 0
        ) {
          ctx.drawImage(
            playerSprite.img,
            playerSprite.x,
            playerSprite.y,
            playerSprite.w,
            playerSprite.h
          );
        } else {
          // Fallback or loading indicator for player
          ctx.fillStyle = "#ff0000";
          ctx.fillRect(
            playerSprite.x,
            playerSprite.y,
            playerSprite.w,
            playerSprite.h
          );
          ctx.fillStyle = "#ffffff";
          ctx.font = "16px Arial";
          ctx.fillText(
            "Loading player...",
            playerSprite.x + 5,
            playerSprite.y + 20
          );
        }
      }

      function gameLoop() {
        bopTimer += 0.05; // tweak speed if you want faster/slower bounce
        movePlayer();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop); // Store the ID
      }

      // Cleanup function
      return () => {
        console.log("Cleaning up game view effect");
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        // Remove image load/error listeners to prevent memory leaks
        bgSprite.img.removeEventListener("load", startLoop);
        playerSprite.img.removeEventListener("load", startLoop);
        bgSprite.img.removeEventListener("error", (e) =>
          console.error("Failed to load background image:", e)
        );
        playerSprite.img.removeEventListener("error", (e) =>
          console.error("Failed to load player image:", e)
        );

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId); // Cancel the loop
        }
        // Clear keys state on cleanup
        keysRef.current = {};
      };
    } else {
      // Cleanup logic if switching *away* from game view
      console.log("Switching away from game view, cleaning up...");
      // Remove event listeners explicitly here as well, just in case activeView changes before cleanup return runs
      const handleKeyDown = (e) => {
        /* empty */
      }; // Define dummy handlers to remove
      const handleKeyUp = (e) => {
        /* empty */
      };
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      // If you have any intervals or timers specific to the game view, clear them here.
      // For canvas animation, the return cleanup function is the primary mechanism.
    }
  }, [activeView]); // Rerun effect when activeView changes

  return (
    <div className="App">
      <div className="sidebar">
        {/* Music Section */}
        <h3>🎵 Jams</h3>
        <button onClick={() => playAudio("classic1")}>Music Track 1</button>
        <button onClick={() => playAudio("classic2")}>Music Track 2</button>
        <button onClick={() => playAudio("lofibeat")}>1 Hour Track</button>
        <button onClick={stopAudio}>Stop</button>
        {/* Volume Control */}
        <div className="volume-slider">
          <label htmlFor="volume">🔊 Volume</label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </div>

        {/* Focus Stats */}
        <div className="focus-stats">
          <p>🕒 Total Time Studied: {formatTime(seconds)}</p>
          <p>🧠 Current Session: {formatTime(sessionSeconds)}</p>
          <p className="xp">🔥 Total XP: {xp}</p>
          {/* Button to open the XP Log Modal */}
          <button
            onClick={() => setIsXpLogModalOpen(true)}
            className="open-log-button"
          >
            View XP Log 📊
          </button>
        </div>
        {/* Pomodoro Section */}
        <div className="pomodoro">
          <h3>🎯 Pomodoro</h3>
          {isPomoRunning ? (
            // Show timer and stop button when running
            <>
              <p className="pomodoro-status">
                {isBreak ? "🌿 Break Time" : "💪 Focus Time"}
              </p>
              <p className="pomodoro-timer">{formatTime(pomoSeconds)}</p>
              <button
                onClick={() => {
                  setIsPomoRunning(false);
                  setIsBreak(false);
                  setPomoSeconds(0);
                  // Optionally add a penalty or just stop
                  addNotification("Pomodoro timer stopped.");
                }}
                className="stop-pomodoro-button"
              >
                Stop Timer
              </button>
            </>
          ) : (
            // Show start button when not running
            <button
              onClick={() => {
                setIsPomoRunning(true);
                setIsBreak(false);
                setPomoSeconds(1500); // 25 minutes focus time
                addNotification("Pomodoro focus started!");
              }}
              className="start-pomodoro-button"
            >
              Start Focus (25 min)
            </button>
          )}
          <p>🍝 Sessions Completed: {pomoCompleted}</p>
          <p className="xp">🔥 Pomo XP: +{pomoXP}</p>
        </div>
        {/* View Toggles */}
        <button onClick={() => setActiveView("calendar")}>
          🗓️ Open Calendar
        </button>
        <button
          onClick={() => setActiveView("game")}
          style={{ marginTop: "0.5rem" }}
          disabled={activeView === "game"} // Disable if already in game view
        >
          🎮 Back to Game
        </button>
        {/* Removed inline XP Log Display - it's now in the modal */}
      </div>{" "}
      {/* End Sidebar */}
      {/* Main Content Area */}
      <div className="main-content">
        {activeView === "game" ? (
          <>
            <canvas ref={canvasRef} id="gameCanvas"></canvas>
            {botMessage && (
              <div className="bot-dialogue-box">
                <p>{botMessage}</p>
              </div>
            )}

            {mikuDialogueStage === "start" && (
              <div className="miku-dialogue-box">
                <p>
                  Hi there!Im hastune miku! You seem busy... or at least, you
                  *look* like you're working.
                </p>
                <button
                  onClick={() => {
                    setMikuDialogueStage("option1");
                    setMikuMessage(
                      "Oh, you're working hard? Then why are you talking to me right now...? 🫢"
                    );
                    setTimeout(() => {
                      setMikuMessage("");
                      setMikuDialogueStage("idle");
                    }, 6000);
                  }}
                >
                  I'm working
                </button>
                <button
                  onClick={() => {
                    setMikuDialogueStage("option2");
                    setMikuMessage(
                      "You're procrastinating? That’s okay... I mean, it's not okay, but I’ll pretend I didn’t hear that."
                    );
                    setTimeout(() => {
                      setMikuMessage("");
                      setMikuDialogueStage("idle");
                    }, 6000);
                  }}
                >
                  I'm procrastinating
                </button>
                <button
                  onClick={() => {
                    setMikuDialogueStage("option3");
                    setMikuMessage(
                      "Ah... aimlessly clicking around again? That's a bold productivity strategy. 😶"
                    );
                    setTimeout(() => {
                      setMikuDialogueStage("idle");
                      setMikuMessage("");
                    }, 6000); // adjust duration if needed
                  }}
                >
                  I'm... just clicking things
                </button>
              </div>
            )}

            {mikuDialogueStage === "option1" && (
              <div className="miku-dialogue-box">
                <p>{mikuMessage}</p>
                <button
                  onClick={() => {
                    setMikuMessage(
                      "Okay! I’ll let you focus now. Good luck~ 💻🎶"
                    );
                    setTimeout(() => {
                      setMikuDialogueStage("idle");
                      setMikuMessage("");
                    }, 3000);
                  }}
                >
                  You're right... I'll get back to work 😔
                </button>
              </div>
            )}

            {mikuDialogueStage === "option2" && (
              <div className="miku-dialogue-box">
                <p>{mikuMessage}</p>
                <button onClick={threatenWithIP}>...I'll try again 😭</button>
              </div>
            )}

            {mikuDialogueStage === "option3" && (
              <div className="miku-dialogue-box">
                <p>{mikuMessage}</p>
                <button
                  onClick={() => {
                    const sites = [
                      "https://longdogechallenge.com",
                      "https://pointerpointer.com",
                      "https://cat-bounce.com",
                      "https://youtu.be/n3ph6yyhr-Q?si=tloEpWptxjIAF_2W,",
                      "https://youtu.be/z4MiJmjNlw0?si=U7QKXYgjI-Nze1ry",
                      "https://youtu.be/bU7tAZ4TWcw?si=Dc98e1yX3l3_70Rd",
                      "https://youtu.be/_-2dIuV34cs?si=UJXJGIOt3vZjSRf1",
                    ];
                    const chosen =
                      sites[Math.floor(Math.random() * sites.length)];
                    window.open(chosen, "_blank");
                  }}
                >
                  Wait— what are you doi—
                </button>
              </div>
            )}

            {mikuDialogueStage === "ipThreat" && (
              <div className="miku-dialogue-box">
                <p>{mikuMessage}</p>
              </div>
            )}

            {mikuDialogueStage === "ipThreat" && (
              <div className="miku-dialogue-box">
                <p>{mikuMessage}</p>
                {/* no button here to make her threat land */}
              </div>
            )}
            {/* Gurt Sprite */}
            <img
              src={process.env.PUBLIC_URL + "/gurt.png"} // Your yogurt sprite image
              alt="Gurt"
              style={{
                position: "absolute",
                left: `${gurtPosition.x}px`,
                top: `${gurtPosition.y}px`,
                width: `${gurtBot.w}px`,
                height: `${gurtBot.h}px`,
                zIndex: 5,
              }}
            />

            {/* Gurt Dialogue */}
            {showGurtDialogue && (
              <div className="gurt-dialogue-box">
                <p>yo.</p>
              </div>
            )}

            {/* Overlay for today's tasks - stays in the game view */}
            {todaysTasks.length > 0 && (
              <div className="todo-overlay">
                <h3>📅 Today's Tasks</h3>
                <ul>
                  {todaysTasks.map((task, i) => (
                    <li key={i}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer", // Make it clear it's clickable
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={completedTasks.includes(task.title)}
                          onChange={() => toggleTask(task.title)}
                          style={{ cursor: "pointer" }}
                        />
                        <span
                          style={{
                            textDecoration: completedTasks.includes(task.title)
                              ? "line-through"
                              : "none",
                            color: completedTasks.includes(task.title)
                              ? "#888" // Dim completed tasks
                              : "#fff", // Regular color
                          }}
                        >
                          {task.title}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          // Calendar View
          <div
            className="calendar-container"
            style={{
              flex: 1, // Keep flex: 1
              // Removed padding: "1rem" to get rid of space inside the container edges
              // Removed height: '100vh' to let flexbox manage height
              backgroundColor: "transparent", // Keep your background color
              position: "relative", // Keep position if needed for absolute children
              overflowY: "auto", // Use overflowY for vertical scrolling if needed
              padding: "0 1rem 1rem 1rem", // Optional: Keep side and bottom padding, remove top padding
            }}
          >
            {/* Calendar Title */}
            <div
              style={{
                position: "sticky",
                top: "10px", // Let's set sticky top to 0 as well
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(to right, #ffcaf2, #bde0fe)",
                color: "#000",
                fontFamily: "'Press Start 2P', monospace", // Ensure font is loaded
                padding: "0.75rem 1.25rem",
                borderRadius: "12px",
                fontSize: "11px",
                boxShadow: "0 0 12px rgba(255, 255, 255, 0.6)",
                zIndex: 10,
                border: "2px dashed white",
                textAlign: "center",
                width: "fit-content",
                // Change the margin here:
                margin: "0 auto 1rem auto", // Set top margin to 0, keep left/right auto, bottom margin to 1rem
              }}
            >
              ✨ Choose when you’ll conquer your task! ✨
            </div>
            {/* Event Calendar Component */}
            <EventCalendar />
          </div>
        )}
      </div>{" "}
      {/* End Main Content Area */}
      {/* Floating Pomodoro Timer - remains a floating element */}
      {isPomoRunning && (
        <div className="floating-timer">
          {isBreak ? "🌿 Break Time" : "💪 Focus Time"}
          <br />
          {formatTime(pomoSeconds)}
        </div>
      )}
      {/* XP Notifications Area - remains a floating element */}
      <div className="xp-notifications">
        {notifications.map((n) => (
          <div key={n.id} className="xp-toast">
            {n.text}
          </div>
        ))}
      </div>
      {/* Render the XP Log Modal conditionally */}
      {isXpLogModalOpen && (
        <XpLogModal xpLog={xpLog} onClose={() => setIsXpLogModalOpen(false)} />
      )}
      {showJournal && (
        <div className="modal journal-modal">
          <button onClick={() => setShowJournal(false)}>❌ Close</button>
          <TabbedJournal />
        </div>
      )}
    </div> // End App
  );
};

export default App;
