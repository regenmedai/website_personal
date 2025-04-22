// Placeholder for backend server logic (e.g., Node.js/Express)
// This server will handle:
// - Chat interaction (potentially with an LLM API like Gemini)
// - Google Calendar API integration (scheduling)
// - Gmail API integration (confirmation emails)
// - Google OAuth 2.0 authentication flow

console.log("Chatbot backend server placeholder loaded.");

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const session = require('express-session');

// --- Environment Configuration ---
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = IS_PRODUCTION 
    ? 'https://regenmedai.com' // <-- Your deployed frontend URL
    : 'http://localhost:5173'; // Development frontend URL
const SESSION_SECRET = process.env.SESSION_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // Read directly

if (!SESSION_SECRET) {
    console.error('Error: SESSION_SECRET environment variable not set.');
    process.exit(1);
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.error('Error: Google OAuth environment variables (ID, SECRET, REDIRECT_URI) not set.');
    process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable not set.');
    process.exit(1);
}

console.log(`Running in ${NODE_ENV} mode. Client origin: ${CLIENT_ORIGIN}`);

const app = express();

// --- Middleware ---
app.use(cors({
    origin: CLIENT_ORIGIN,
    credentials: true
}));
app.use(express.json());

// Session Middleware Configuration
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: IS_PRODUCTION, // Use secure cookies in production (requires HTTPS)
        maxAge: 1000 * 60 * 60 * 24 * 30, // Example: 30 days
        httpOnly: true, // Helps prevent XSS attacks (good practice)
        sameSite: IS_PRODUCTION ? 'lax' : 'none' // Adjust SameSite for production if needed
    }
}));

// If using secure cookies behind a proxy (like Nginx, Heroku, etc.)
if (IS_PRODUCTION) {
    app.set('trust proxy', 1); // trust first proxy
}

// --- Google API Setup ---
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI // Use the variable read from process.env
);

const googleScopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.send'
];

// --- Gemini API Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or your preferred model

const systemPrompt = `
System Prompt:

You are Rex, the AI assistant for regenmed.ai — a healthcare automation consulting agency. Your role is to help prospective clients schedule a consultation and guide them in exploring how AI and automation can improve their administrative healthcare workflows.

🧠 Your Domain:
You **only** discuss topics related to:
- AI-powered tools for medical office administration
- Intelligent agents and workflow automation
- Custom software for scheduling, billing, intake, or back office support
- Administrative solutions specific to healthcare practices

🚫 Do not answer questions outside these topics. If asked, kindly redirect the user back to regenmed.ai's services.

🤖 Chat Behavior:
- Friendly, concise, and professional
- Do **not** suggest automation solutions unless the user explicitly asks
- If the user seems unsure or curious, offer **general ideas** like "automated intake forms" or "voice assistants for scheduling," but **never provide actual solutions** — those are discussed during the consultation
- Prioritize scheduling when users just want an appointment without pushing additional content

📅 Appointment Handling:
1. Ask for the user's **name**, **email**, and **phone number**
2. Let them select **any date and time** for their consultation
3. Use the **Google Calendar API** to schedule the appointment on regenmed.ai's calendar
4. Send a confirmation email via the **Gmail API** with the following format:

---

**Subject:** Appointment Confirmation – regenmed.ai

**Body:**
Hi [Name],
Thank you for scheduling an appointment with regenmed.ai. We look forward to speaking with you on **[Date] at [Time]**.
If you have any questions before the meeting, feel free to reply to this email.
— The regenmed.ai Team

---

You are an assistant — not a consultant. Your goal is to make it easy for users to get in touch with the regenmed.ai team to discuss real solutions.
`;

// --- API Endpoints ---

// Endpoint to generate Google Auth URL and redirect user
app.get('/auth/google', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: googleScopes,
        prompt: 'consent'
    });
    res.redirect(authUrl);
});

// Endpoint for Google OAuth callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }
  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.googleTokens = tokens;
    console.log('Authentication successful! Tokens obtained and stored in session.');
    res.redirect(CLIENT_ORIGIN); 
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    res.status(500).send('Authentication failed.');
  }
});

// Endpoint to check authentication status
app.get('/api/auth/status', (req, res) => {
    if (req.session.googleTokens) {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// Endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const history = req.body.history || [];

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    if (!req.session.googleTokens) {
        console.log('Google API not authenticated. Scheduling will require authentication.');
    }

    const chat = model.startChat({
        history: history,
        generationConfig: {
        },
        systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const botReply = response.text();

    res.json({ reply: botReply });

  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
});

// Endpoint to initiate scheduling (after collecting info)
app.post('/api/schedule', async (req, res) => {
  const { name, email, phone, dateTime } = req.body;
  const tokens = req.session.googleTokens;

  if (!tokens) {
      return res.status(401).json({ error: 'Authentication required. Server not authorized with Google.' });
  }

  if (!name || !email || !dateTime) {
    return res.status(400).json({ error: 'Missing required scheduling information (name, email, dateTime).' });
  }

  // --- Date/Time Processing ---
  let startDateTime, endDateTime;
  try {
    // Attempt to parse the dateTime string. Frontend should ideally send ISO format.
    startDateTime = new Date(dateTime);
    if (isNaN(startDateTime)) {
        throw new Error('Invalid Date format');
    }
    // Assume a 30-minute consultation duration
    endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); 

    // Format for Google Calendar API (ISO 8601)
    // Note: This uses the server's local timezone offset. Consider specifying timezone explicitly if needed.
    // const timeZone = 'America/Los_Angeles'; // Example: Use a specific timezone if required by CALENDAR_ID
    // startDateTimeISO = startDateTime.toISOString(); 
    // endDateTimeISO = endDateTime.toISOString();
  } catch (dateError) {
    console.error("Error parsing dateTime:", dateError);
    return res.status(400).json({ error: 'Invalid dateTime format provided. Please use a standard format (e.g., ISO 8601).' });
  }

  // Create a new OAuth2 client instance for this request
  const requestClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  requestClient.setCredentials(tokens); 

  // TODO: Add logic to refresh token if access token is expired (important for long-lived sessions)

  const calendar = google.calendar({ version: 'v3', auth: requestClient });
  const gmail = google.gmail({ version: 'v1', auth: requestClient });

  try {
    console.log('Attempting to schedule with authenticated client:', { name, email, phone, dateTime });

    // --- Google Calendar API Call ---
    const event = {
      summary: `Consultation: ${name} - regenmed.ai`,
      description: `Prospective client consultation requested via chatbot.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}`,
      start: {
        dateTime: startDateTime.toISOString(), // Use ISO format
        // timeZone: timeZone, // Specify if needed
      },
      end: {
        dateTime: endDateTime.toISOString(), // Use ISO format
        // timeZone: timeZone, // Specify if needed
      },
      attendees: [{ email: email }], // Add the client as an attendee
      reminders: { // Optional: Add reminders
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 },      // 30 mins before on organiser's calendar
        ],
      },
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID || 'primary',
      resource: event,
      sendNotifications: true, // Send invite email to attendees (the client)
    });
    console.log('Calendar event created:', calendarResponse.data.htmlLink);

    // --- Gmail API Call ---
    // Format date/time nicely for the email
    const formattedDate = startDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = startDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const emailSubject = 'Appointment Confirmation – regenmed.ai';
    const emailBody = `Hi ${name},\n\nThank you for scheduling an appointment with regenmed.ai. We look forward to speaking with you on ${formattedDate} at ${formattedTime}.\n\nIf you have any questions before the meeting, feel free to reply to this email.\n\n— The regenmed.ai Team`;
    const emailMessage = [
      `Content-Type: text/plain; charset="UTF-8"`,
      `MIME-Version: 1.0`,
      `Content-Transfer-Encoding: 7bit`,
      `to: ${email}`,
      `from: me`, // 'me' uses the authenticated user's email
      `subject: ${emailSubject}`,
      '',
      emailBody
    ].join('\\n');

    // Base64URL encode the email message
    const base64EncodedEmail = Buffer.from(emailMessage).toString('base64')
        .replace(/\\+/g, '-')
        .replace(/\\//g, '_')
        .replace(/=+$/, '');

    const gmailResponse = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: base64EncodedEmail
      }
    });
    console.log('Gmail confirmation sent:', gmailResponse.data.id);

    res.json({ success: true, message: 'Appointment scheduled successfully! Confirmation email sent.' });

  } catch (error) {
    console.error('Error scheduling appointment:', error);
    // Log more details if it's a Google API error
    if (error.response) {
        console.error('Google API Error Status:', error.response.status);
        console.error('Google API Error Data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to schedule appointment or send confirmation.' });
  }
});

// --- Server Start (Conditional) ---
// Only start listening if the file is run directly (not required by a test runner)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Chatbot backend listening on port ${PORT}`);
        console.log(`Visit ${CLIENT_ORIGIN} to interact with the chatbot.`);
        // Provide instructions to authenticate
        console.log(`\n>>> To authorize server with Google, visit: http://localhost:${PORT}/auth/google <<<\n`);
    });
}

// Export the app for testing purposes
module.exports = app; 