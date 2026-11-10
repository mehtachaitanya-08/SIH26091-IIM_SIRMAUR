/**
 * Production Google OAuth 2.0 Client Service
 * Uses Google Identity Services (GIS) Token Client for popup authentication.
 * Configured via import.meta.env.VITE_GOOGLE_CLIENT_ID.
 * Strictly avoids mock fallbacks or hardcoded profiles.
 */

let activeTokenClient = null;
let registeredSuccessCb = null;
let registeredErrorCb = null;

/**
 * Retrieves the Google OAuth 2.0 Client ID from the environment.
 * @returns {string}
 */
export function getGoogleClientId() {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID.trim();
  }
  return '';
}

/**
 * Checks whether Google Identity Services SDK is loaded on window.
 * @returns {boolean}
 */
export function isGoogleAuthAvailable() {
  return typeof window !== 'undefined' && !!(window.google?.accounts?.oauth2);
}

/**
 * Dynamically loads the GIS client script if not already present.
 * @returns {Promise<any>}
 */
export function loadGoogleGISScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window is not available (SSR environment).'));
    }

    if (window.google?.accounts?.oauth2) {
      return resolve(window.google.accounts.oauth2);
    }

    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.google?.accounts?.oauth2) {
          resolve(window.google.accounts.oauth2);
        } else {
          reject(new Error('Google Identity Services SDK loaded but accounts.oauth2 is missing.'));
        }
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Failed to load Google Identity Services SDK. Check your internet connection.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google.accounts.oauth2);
      } else {
        reject(new Error('Google Identity Services SDK script loaded without accounts.oauth2.'));
      }
    };
    script.onerror = () => {
      reject(new Error('Unable to connect to Google authentication services. Please verify your network connection.'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Fetches the authenticated user profile from Google's UserInfo endpoint.
 * @param {string} accessToken
 * @returns {Promise<{ id: string, name: string, givenName: string, familyName: string, email: string, avatar: string|null, emailVerified: boolean, verified: boolean, authProvider: string }>}
 */
export async function fetchGoogleUserProfile(accessToken) {
  if (!accessToken) {
    throw new Error('Access token is missing from Google authorization response.');
  }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Google UserInfo endpoint returned HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const fullName = data.name || [data.given_name, data.family_name].filter(Boolean).join(' ') || 'Google User';

  return {
    id: data.sub,
    sub: data.sub,
    name: fullName,
    givenName: data.given_name || '',
    familyName: data.family_name || '',
    email: data.email,
    avatar: data.picture || null,
    emailVerified: !!data.email_verified,
    verified: true,
    authProvider: 'google'
  };
}

/**
 * Initializes the GIS Token Client with success and error callbacks.
 * @param {Function} [onSuccess]
 * @param {Function} [onError]
 * @param {string} [customClientId]
 * @returns {boolean}
 */
export function initGoogleAuth(onSuccess, onError, customClientId) {
  registeredSuccessCb = onSuccess || null;
  registeredErrorCb = onError || null;

  if (typeof window === 'undefined') {
    return false;
  }

  const clientId = customClientId || getGoogleClientId();
  if (!clientId || clientId === 'your_google_client_id_here.apps.googleusercontent.com') {
    const errorMsg = 'Google Authentication is not configured. Please define VITE_GOOGLE_CLIENT_ID in your environment (.env).';
    if (registeredErrorCb) registeredErrorCb(new Error(errorMsg));
    return false;
  }

  if (!window.google?.accounts?.oauth2) {
    loadGoogleGISScript()
      .then(() => {
        initGoogleAuth(registeredSuccessCb, registeredErrorCb, clientId);
      })
      .catch((err) => {
        if (registeredErrorCb) registeredErrorCb(err);
      });
    return false;
  }

  try {
    activeTokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      prompt: 'consent',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          const err = new Error(tokenResponse.error_description || tokenResponse.error || 'Google login was cancelled or failed.');
          if (registeredErrorCb) registeredErrorCb(err);
          return;
        }

        try {
          const profile = await fetchGoogleUserProfile(tokenResponse.access_token);
          if (registeredSuccessCb) {
            registeredSuccessCb(profile);
          }
        } catch (fetchErr) {
          if (registeredErrorCb) registeredErrorCb(fetchErr);
        }
      },
      error_callback: (err) => {
        const errorObj = new Error(err?.message || 'Google OAuth client error.');
        if (registeredErrorCb) registeredErrorCb(errorObj);
      }
    });
    return true;
  } catch (err) {
    if (registeredErrorCb) registeredErrorCb(err);
    return false;
  }
}

/**
 * Initiates the Google OAuth 2.0 flow via popup and returns the authenticated profile.
 * Rejects if client ID is missing, offline, or user cancels.
 * Zero demo/mock fallback.
 * @returns {Promise<{ id: string, name: string, email: string, avatar: string|null, verified: boolean }>}
 */
export function triggerGoogleLogin() {
  return new Promise((resolve, reject) => {
    const clientId = getGoogleClientId();
    if (!clientId || clientId === 'your_google_client_id_here.apps.googleusercontent.com') {
      return reject(new Error('Google Authentication is not configured. Please define VITE_GOOGLE_CLIENT_ID in your environment (.env).'));
    }

    const executeRequest = () => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          prompt: 'consent',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              return reject(new Error(tokenResponse.error_description || tokenResponse.error || 'Google login was cancelled.'));
            }

            try {
              const profile = await fetchGoogleUserProfile(tokenResponse.access_token);
              resolve(profile);
            } catch (fetchErr) {
              reject(fetchErr);
            }
          },
          error_callback: (err) => {
            reject(new Error(err?.message || 'Google OAuth initialization failed.'));
          }
        });

        client.requestAccessToken();
      } catch (err) {
        reject(new Error(`Failed to request Google access token: ${err.message}`));
      }
    };

    if (!window.google?.accounts?.oauth2) {
      loadGoogleGISScript()
        .then(() => executeRequest())
        .catch((err) => reject(err));
    } else {
      executeRequest();
    }
  });
}

// Alias for flexibility
export const requestGoogleLogin = triggerGoogleLogin;
