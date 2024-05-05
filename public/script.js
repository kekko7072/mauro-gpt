document.addEventListener("DOMContentLoaded", function () {
  console.log("Intialisation process.");
  fetch("/api/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer 228138a79a8f67f6aa", // Replace YOUR_ACCESS_TOKEN with your actual token
    },
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error("Network response was not ok.");
    })
    .then((data) => {
      console.log("Init data received:", data);
      if (data.success) {
        // Remove loader
        document.getElementById("loader").style.display = "none";
        // Show the content only after successful API response
        document.getElementById("chat-container").style.display = "block";
        document.getElementById("loader").style.display = "none";
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
      chatOutput.innerText += `${data.response}\n`;
    } else {
      console.error("Failed to send message");
      chatOutput.innerText += "Error: Could not receive a response.\n";
    }
  } catch (error) {
    console.error("Fetch error:", error);
    chatOutput.innerText += "Error: Network problem.\n";
  } finally {
    loadingIndicator.style.display = "none"; // Hide loading indicator
  }
}
