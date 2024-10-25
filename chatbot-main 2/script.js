const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

const MAX_TOKENS = 250; // Set maximum tokens for bot responses
const MAX_HISTORY_TOKENS = 2000; // Approximate max tokens for conversation history

let conversationHistory = [
    {
        role: "system",
        content: "You are Buzz, Georgia Tech's friendly mascot. You should be playful and enthusiastic but also helpful. Respond to questions about Georgia Tech, campus life, sports, academics, and provide support. Keep the tone light, fun, and energetic like Buzz, the mascot of Georgia Tech.  Try to keep responses brief. Fetch information from m.gatech.edu/api"
    }
];

const backgrounds = {
    socialLife: "images/image.png",
    computing: "images/image (1).png",
    general: "images/image 3.png",
    dining: "images/image 4.png",
    academic: "images/image 5.png",
    library: "images/image 6.png",
    research: "images/image 7.png",
    lab: "images/image 8.png", 
    campus: "images/image 10.png"
};

// Variable to track if the user has interacted
let hasInteracted = false;

function changeBackground(message) {
    hasInteracted = true;
    let background;

    // Check for keywords and set the background based on the message content
    if (message.includes("student center") || message.includes("chick") || message.includes("student") || message.includes("bowling")) {
        background = backgrounds.socialLife;
    } else if (message.includes("cs") || message.includes("computer") || message.includes("coding")) {
        background = backgrounds.computing;
    } else if (message.includes("nav") || message.includes("willage") || message.includes("dining") || message.includes("food") || message.includes("breakfast") || message.includes("lunch") || message.includes("dinner")) {
        background = backgrounds.dining;
    } else if (message.includes("culc") || message.includes("clough") || message.includes("study") || message.includes("learn") || message.includes("exam")) {
        background = backgrounds.academic;
    } else if (message.includes("crossland") || message.includes("books")) {
        background = backgrounds.library;
    } else if (message.includes("research")) {
        background = backgrounds.research;
    } else if (message.includes("lab")) {
        background = backgrounds.lab;
    } else if (message.includes("city") || message.includes("view") || message.includes("ATL") || message.includes("Atlanta") || message.includes("life") || message.includes("atlanta")) {
        background = backgrounds.campus;
    } else {
        background = backgrounds.general; // Fallback to general background
    }

    // Change the chat window's background if the user has interacted
    if (hasInteracted) {
        chatWindow.style.backgroundImage = `url('${background}')`;
    }
}

/// Helper to add messages to the chat window
function addMessage(message, sender) {
    // Clear the chat window before adding the new message
    chatWindow.innerHTML = "";

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

    // Add user message and then process bot response
    addMessage(message, "user");
    conversationHistory.push({ role: "user", content: message });
    userInput.value = "";

    // Change background based on the user's message
     changeBackground(message);

    // Ensure conversation history doesn't exceed max token limit
    manageConversationHistory();

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
            model: "gpt-4o-mini",
            messages: conversationHistory,
            max_tokens: MAX_TOKENS, // Set the max tokens per response
            temperature: 0.5
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

function manageConversationHistory() {
    // Optional: Approximate token length, modify if necessary (tokens are approx 3/4 of words)
    const tokenLengthEstimate = conversationHistory.reduce((acc, msg) => acc + msg.content.split(" ").length * 0.75, 0);

    // Remove oldest messages if the total tokens exceed the max allowed
    while (tokenLengthEstimate > MAX_HISTORY_TOKENS) {
        conversationHistory.splice(1, 1); // Keep the system message intact, remove the oldest user/assistant pair
    }
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
