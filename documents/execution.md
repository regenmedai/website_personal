### Chatbot Execution Flow

This flow covers the core chat interaction and the appointment scheduling process.

**1. Initial Load & Display**

1.  `Browser`: User navigates to the website (e.g., `http://localhost:5173`).
2.  `Vite Dev Server`: Serves `index.html`.
3.  `Browser`: Loads `index.html`, which requests `/src/main.jsx`.
4.  `Frontend (main.jsx)`: Renders the `App` component into the root DOM element.
5.  `Frontend (App.jsx)`: Renders the main page layout, including header, sections, footer, and the `<Chatbot />` component.
6.  `Frontend (Chatbot.jsx)`: Initializes its state (`isOpen`, `messages` with initial greeting, `inputValue`, `isLoading`).
7.  `Frontend (Chatbot.jsx)`: Renders the chat bubble button (since `isOpen` is initially false).

**2. Opening Chat & Basic Interaction**

1.  `Frontend (Chatbot.jsx)`: User clicks the chat bubble button.
2.  `Frontend (Chatbot.jsx)`: `toggleChat` function sets `isOpen` state to true.
3.  `Frontend (Chatbot.jsx)`: Re-renders to show the chat window, displaying the initial greeting message.
4.  `Frontend (Chatbot.jsx)`: User types a message into the input field.
5.  `Frontend (Chatbot.jsx)`: `handleInputChange` updates the `inputValue` state on each keystroke.
6.  `Frontend (Chatbot.jsx)`: User presses Enter or clicks the Send button.
7.  `Frontend (Chatbot.jsx)`: `handleSendMessage` function is triggered.
8.  `Frontend (Chatbot.jsx)`: Adds the user's message `{ role: 'user', text: trimmedInput }` to the `messages` state.
9.  `Frontend (Chatbot.jsx)`: Clears `inputValue` and sets `isLoading` to true.
10. `Frontend (Chatbot.jsx)`: Formats the current `messages` array into the `historyForAPI` structure.
11. `Frontend (Chatbot.jsx)`: Sends a POST request using `axios` to the backend endpoint `http://localhost:3001/api/chat`. The request includes `{ message: trimmedInput, history: historyForAPI }` and `{ withCredentials: true }` (to send session cookie).
12. `Backend (server.js)`: The `/api/chat` endpoint receives the request.
13. `Backend (server.js)`: Checks if `req.session.googleTokens` exist (logs a message but doesn't block chat).
14. `Backend (server.js)`: Initializes the Gemini chat using `model.startChat()` with the received `history` and the `systemPrompt`.
15. `Backend (server.js)`: Calls `chat.sendMessage(userMessage)` to send the user's message to the Gemini API.
16. `Gemini API`: Processes the message in the context of the history and system prompt, generating a text reply.
17. `Backend (server.js)`: Receives the `botReply` text from the Gemini API response.
18. `Backend (server.js)`: Sends a JSON response `{"reply": botReply}` back to the frontend.
19. `Frontend (Chatbot.jsx)`: Receives the successful response from the backend.
20. `Frontend (Chatbot.jsx)`: Adds the bot's message `{ role: 'model', text: botReply }` to the `messages` state.
21. `Frontend (Chatbot.jsx)`: Sets `isLoading` back to false.
22. `Frontend (Chatbot.jsx)`: The message area re-renders, displaying the new bot message, and scrolls to the bottom.

**3. Appointment Scheduling Flow (Triggered by Conversation)**

*   *(Pre-condition: The chat interaction flow above results in the bot asking for scheduling details: name, email, phone, date/time).*
1.  `Frontend (Chatbot.jsx)`: User provides the requested details in subsequent messages.
2.  `Frontend (Chatbot.jsx)`: *(Logic to be implemented)* Parses the user's replies or uses dedicated inputs to collect `name`, `email`, `phone`, and `dateTime`.
3.  `Frontend (Chatbot.jsx)`: *(Logic to be implemented)* Once all required details are collected, triggers the scheduling API call (e.g., via a button click or automatically).
4.  `Frontend (Chatbot.jsx)`: Sends a POST request using `axios` to the backend endpoint `http://localhost:3001/api/schedule`. The request includes `{ name, email, phone, dateTime }` and `{ withCredentials: true }`.
5.  `Backend (server.js)`: The `/api/schedule` endpoint receives the request.
6.  `Backend (server.js)`: Checks if `req.session.googleTokens` exist. If not, returns a 401 Unauthorized error.
7.  `Backend (server.js)`: Validates that `name`, `email`, and `dateTime` are present. Returns 400 Bad Request if missing.
8.  `Backend (server.js)`: Parses the `dateTime` string into a `Date` object, calculates the `endDateTime` (e.g., +30 mins). Returns 400 if date format is invalid.
9.  `Backend (server.js)`: Creates a new Google OAuth2 client instance (`requestClient`) and sets the credentials using the `tokens` retrieved from the session.
10. `Backend (server.js)`: Creates authenticated Google Calendar (`calendar`) and Gmail (`gmail`) API clients using the `requestClient`.
11. `Backend (server.js)`: Constructs the `event` object with summary, description, start/end times (ISO format), and attendee email.
12. `Backend (server.js)`: Calls `calendar.events.insert()` with the `event` details, `calendarId`, and `sendNotifications: true`.
13. `Google Calendar API`: Creates the event in the owner's calendar and sends a standard calendar invitation to the provided attendee email.
14. `Backend (server.js)`: Receives confirmation (including event link) from the Google Calendar API.
15. `Backend (server.js)`: Constructs the confirmation email content (subject, body with formatted date/time).
16. `Backend (server.js)`: Encodes the email message into Base64URL format.
17. `Backend (server.js)`: Calls `gmail.users.messages.send()` with `userId: 'me'` and the `raw` encoded email.
18. `Google Gmail API`: Sends the email from the owner's account to the provided client email.
19. `Backend (server.js)`: Receives confirmation (message ID) from the Google Gmail API.
20. `Backend (server.js)`: Sends a JSON success response `{"success": true, "message": "Appointment scheduled..."}` back to the frontend.
21. `Frontend (Chatbot.jsx)`: Receives the successful response.
22. `Frontend (Chatbot.jsx)`: Displays a confirmation message (e.g., "Appointment scheduled successfully!") in the chat window.

**4. One-Time Google Authorization Flow (For Website Owner)**

1.  `User (Owner)`: Navigates their browser to the backend auth URL (e.g., `http://localhost:3001/auth/google`).
2.  `Backend (server.js)`: The `/auth/google` endpoint generates the Google authorization URL with required scopes (`calendar.events`, `gmail.send`) and `access_type: 'offline'`.
3.  `Backend (server.js)`: Redirects the owner's browser to the generated Google URL.
4.  `Google Auth Service`: Presents the Google login and consent screen to the owner.
5.  `User (Owner)`: Logs in to their Google account and grants the requested permissions.
6.  `Google Auth Service`: Redirects the owner's browser back to the `GOOGLE_REDIRECT_URI` specified in the `.env` file (e.g., `http://localhost:3001/oauth2callback`), including an authorization `code` in the URL query parameters.
7.  `Backend (server.js)`: The `/oauth2callback` endpoint receives the request with the `code`.
8.  `Backend (server.js)`: Exchanges the received `code` for OAuth tokens by calling `oauth2Client.getToken(code)`.
9.  `Google Auth Service`: Validates the code and returns access and refresh tokens.
10. `Backend (server.js)`: Receives the `tokens`.
11. `Backend (server.js)`: Stores the `tokens` securely in the server-side session (`req.session.googleTokens = tokens`).
12. `Backend (server.js)`: Redirects the owner's browser back to the frontend application (`CLIENT_ORIGIN`, e.g., `http://localhost:5173`).
13. *(Now the backend server has the necessary tokens stored in its session to make authorized calls to Google Calendar and Gmail APIs on behalf of the owner).* 
