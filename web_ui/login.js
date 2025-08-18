const BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
const url = `${BASE_URL}/auth/token`;

const token = localStorage.getItem("access_token");

function isTokenValid(token) {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now;
  } catch (err) {
    console.error("Errore nel decodificare il token:", err);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (isTokenValid(token)) {
    window.location.href = "home.html";
    return;
  }

  const form = document.querySelector("form");
  const usernameInput = form.querySelector('input[type="text"]');
  const passwordInput = form.querySelector('input[type="password"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username,
          password
        })
      });

      if (!response.ok) {
        throw new Error("Credenziali errate");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);

      window.location.href = "home.html";

    } catch (err) {
      console.error(err);
      alert("Errore nel login: " + err.message);
    }
  });
});
