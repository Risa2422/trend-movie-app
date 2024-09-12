const body = document.querySelector("body");
const screenModeButton = document.querySelectorAll('input[type="radio"]');

// Check if dark mode is enabled in localStorage
if (localStorage.getItem("theme") !== null) {
  screenModeButton[1].checked = true // dark radio button change to checked
  body.classList.add("theme-dark");
}

// toggle between light mode and dark mode
screenModeButton.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("dark-mode")) {
      body.classList.add("theme-dark");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("theme-dark");
      localStorage.removeItem('theme')
    }
  });
});
