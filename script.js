const hourHand = document.getElementById("hour");
const minuteHand = document.getElementById("minute");
const secondHand = document.getElementById("second");

const digitalTime = document.getElementById("digital-time");
const ampm = document.getElementById("ampm");

function updateClock() {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Analog
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
  secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;

  // Digital
  const displayHour = hours % 12 || 12;
  digitalTime.textContent =
    `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  ampm.textContent = hours >= 12 ? "PM" : "AM";
}

setInterval(updateClock, 1000);
updateClock(); 
