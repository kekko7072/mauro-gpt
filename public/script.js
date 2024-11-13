document.addEventListener("DOMContentLoaded", function () {
  console.log("Initialization process.");
  fetch("/api/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer 228138a79a8f67f6aa", // Replace with actual token
    },
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error("Network response was not ok.");
    })
    .then((data) => {
      console.log("Init data received:", data);
      if (data.success) {
        document.getElementById("loader").style.display = "none";
        document.getElementById("chat-container").style.display = "block";
      } else {
        console.error("Failed to fetch init data:", data);
        document.getElementById("error").textContent = data.message;
      }
    })
    .catch((error) => {
      console.error("Failed to fetch init data:", error);
      document.getElementById("error").textContent = "Failed to load content.";
    });
});

async function sendMessage() {
  const inputField = document.getElementById("chat-input");
  const message = inputField.value;
  const loadingIndicator = document.getElementById("loader-message");
  const chatOutput = document.getElementById("chat-output");

  inputField.value = ""; // Clear the input after sending
  loadingIndicator.style.display = "block"; // Show loading indicator

  try {
    const userMessageDiv = document.createElement("div");
    userMessageDiv.innerHTML = `<b>You:</b> ${message}\n`;
    chatOutput.appendChild(userMessageDiv);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 228138a79a8f67f6aa",
      },
      body: JSON.stringify({ message }),
    });

    if (response.ok) {
      const data = await response.json();
      const botMessageDiv = document.createElement("div");
      botMessageDiv.innerHTML = `<b>Mauro GPT:</b> ${data.response}\n`;
      chatOutput.appendChild(botMessageDiv);

      // Render LaTeX in the chat output using KaTeX
      renderMathInElement(chatOutput, {
        delimiters: [
          { left: "$$", right: "$$", display: true }, // Block formulas
          { left: "$", right: "$", display: false }, // Inline formulas
        ],
      });
    } else {
      console.error("Failed to send message");
      const errorDiv = document.createElement("div");
      errorDiv.innerHTML = "Error: Could not receive a response.";
      chatOutput.appendChild(errorDiv);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = "Error: Network problem.";
    chatOutput.appendChild(errorDiv);
  } finally {
    loadingIndicator.style.display = "none"; // Hide loading indicator
    chatOutput.scrollTop = chatOutput.scrollHeight; // Scroll to the bottom
  }
}

function clearMessages() {
  const chatOutput = document.getElementById("chat-output");
  chatOutput.innerHTML = ""; // Clears the chat output
}
