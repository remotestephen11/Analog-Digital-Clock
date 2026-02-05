* {
  box-sizing: border-box;
  font-family: system-ui, sans-serif;
}

body {
  margin: 0;
  height: 100vh;
  background: radial-gradient(circle at top, #1b2b4f, #020617);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #eaf2ff;
}

.container {
  text-align: center;
}

h1 {
  margin-bottom: 4px;
}

.subtitle {
  color: #9fb3ff;
  margin-bottom: 30px;
  font-size: 14px;
}

.clock {
  position: relative;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, #0b1538, #050a1f);
  border: 6px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 40px rgba(124,92,255,0.35);
}

/* Numbers */
.numbers span {
  position: absolute;
  inset: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  transform: rotate(calc(var(--n) * 30deg));
  color: #cdd9ff;
  font-weight: 600;
}

.numbers span::after {
  content: attr(style);
}

/* Hands */
.hand {
  position: absolute;
  left: 50%;
  bottom: 50%;
  transform-origin: bottom;
  transform: translateX(-50%) rotate(0deg);
  border-radius: 10px;
}

.hour {
  height: 80px;
  width: 8px;
  background: #7c5cff;
}

.minute {
  height: 110px;
  width: 5px;
  background: #00d4ff;
}

.second {
  height: 130px;
  width: 2px;
  background: #28ffb0;
  box-shadow: 0 0 12px #28ffb0;
}

/* Digital embedded */
.digital {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.35);
  border-radius: 12px;
  padding: 10px 16px;
  text-align: center;
  box-shadow: inset 0 0 20px rgba(0,212,255,0.25);
}

#digital-time {
  font-size: 28px;
  font-family: monospace;
  letter-spacing: 2px;
}

#ampm {
  font-size: 12px;
  color: #9fb3ff;
}

/* Center pin */
.center-dot {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 15px #00d4ff;
}
