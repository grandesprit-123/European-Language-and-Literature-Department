const themeToggle = document.getElementById("theme-toggle");
const themeToggleIcon = document.getElementById("theme-toggle-icon");
const themeToggleText = document.getElementById("theme-toggle-text");

function applyTheme(theme) {
  const isDarkMode = theme === "dark";
  document.body.classList.toggle("dark-mode", isDarkMode);
  themeToggleIcon.textContent = isDarkMode ? "☀️" : "🌙";
  themeToggleText.textContent = isDarkMode ? "라이트 모드" : "다크 모드";
  themeToggle.setAttribute("aria-label", `${themeToggleText.textContent}로 전환`);
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme");
const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDarkMode ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
  applyTheme(nextTheme);
});

function speakPhrase(text, lang) {
  if (!window.speechSynthesis) {
    alert("이 브라우저에서는 음성 재생을 지원하지 않습니다.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang || "fr-FR";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

const speakBtn = document.getElementById("speakBtn");
if (speakBtn) {
  speakBtn.addEventListener("click", () => {
    speakPhrase(speakBtn.dataset.phrase, speakBtn.dataset.lang);
  });
}
