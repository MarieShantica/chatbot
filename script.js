const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

let conversationHistory = [];

// Helper to add messages to the chat window
function addMessage(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");
    messageElement.classList.add(sender === "user" ? "user-message" : "bot-message");
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to handle sending the user's message
async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage(message, "user");
    conversationHistory.push({ role: "user", content: message });
    userInput.value = "";

    try {
        const botResponse = await getBotResponse(message);
        addMessage(botResponse, "bot");
        conversationHistory.push({ role: "assistant", content: botResponse });
    } catch (error) {
        addMessage("Error: Unable to communicate with the bot.", "bot");
    }
}

// Function to fetch response from OpenAI API
async function getBotResponse(message) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer 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`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: conversationHistory,
            temperature: 0.7
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

// Event listener for send button
sendButton.addEventListener("click", sendMessage);

// Allow pressing Enter to send the message
userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});
