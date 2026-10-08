// Reads/writes the logged-in session ({ token, user }) in localStorage so a
// page refresh keeps you logged in. Lives outside React so the service layer
// can read the token without needing a hook.
//
// Note: the stored `user.role` is only used to decide what the UI shows.
// If someone edits it to "admin" in DevTools, they'll see admin menu items,
// but every API call still sends only the token, and the server looks up the
// real role from that token. That is why the UI is not the security boundary.

const STORAGE_KEY = 'zummey_session'

// Fired when any API call returns 401 (expired/invalid token).
// AuthContext listens for it and logs the user out.
export const UNAUTHORIZED_EVENT = 'zummey:unauthorized'

export function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null // storage blocked or corrupted: treat as logged out
  }
}

export function writeStoredSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // storage blocked: the session still works until refresh
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // nothing to clear
  }
}

export function getStoredToken() {
  return readStoredSession()?.token ?? null
}

export function notifyUnauthorized() {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
}
