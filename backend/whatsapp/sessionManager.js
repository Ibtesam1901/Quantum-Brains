/**
 * In-memory session manager for WhatsApp conversations.
 * Tracks conversation state per phone number.
 */

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const STATES = {
  IDLE: "IDLE",
  BROWSING_MENU: "BROWSING_MENU",
  ADDING_ITEMS: "ADDING_ITEMS",
  CONFIRMING_ORDER: "CONFIRMING_ORDER",
  TRACKING: "TRACKING",
};

// In-memory session store
const sessions = new Map();

const getSession = (phone) => {
  const session = sessions.get(phone);
  if (!session) return createSession(phone);

  // Check timeout
  if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
    sessions.delete(phone);
    return createSession(phone);
  }

  session.lastActivity = Date.now();
  return session;
};

const createSession = (phone) => {
  const session = {
    phone,
    state: STATES.IDLE,
    pendingItems: [],
    pendingTotal: 0,
    lastActivity: Date.now(),
    data: {},
  };
  sessions.set(phone, session);
  return session;
};

const updateSession = (phone, updates) => {
  const session = getSession(phone);
  Object.assign(session, updates, { lastActivity: Date.now() });
  sessions.set(phone, session);
  return session;
};

const resetSession = (phone) => {
  sessions.delete(phone);
  return createSession(phone);
};

const getActiveSessions = () => {
  const now = Date.now();
  const active = [];
  for (const [phone, session] of sessions) {
    if (now - session.lastActivity <= SESSION_TIMEOUT) {
      active.push(session);
    }
  }
  return active;
};

// Cleanup expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phone, session] of sessions) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(phone);
    }
  }
}, 10 * 60 * 1000);

module.exports = {
  STATES,
  getSession,
  createSession,
  updateSession,
  resetSession,
  getActiveSessions,
};
