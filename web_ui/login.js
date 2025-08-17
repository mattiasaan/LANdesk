const BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
const url = `${BASE_URL}/auth/token`;


document.addEventListener("DOMContentLoaded", () => {
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

      console.log("Login effettuato con successo!");
      window.location.href = "home.html";

    } catch (err) {
      console.error(err);
      alert("Errore nel login: " + err.message);
    }
  });
});
