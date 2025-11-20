import type { AppController } from './app-controller';
import type { DurableObjectNamespace } from '@cloudflare/workers-types';
export interface Env {
  CF_AI_BASE_URL: string;
  CF_AI_API_KEY: string;
  SERPAPI_KEY: string;
  OPENROUTER_API_KEY: string;
  CHAT_AGENT: DurableObjectNamespace;
  APP_CONTROLLER: DurableObjectNamespace;
}
export function getAppController(env: Env): AppController {
  const id = env.APP_CONTROLLER.idFromName("controller");
  const stub = env.APP_CONTROLLER.get(id);
  const methodMappings: Record<string, { method: string; path: string; body?: (args: any[]) => any }> = {
    getSpugnaState: { method: 'GET', path: '/spugna/state' },
    performSpugnaDraw: { method: 'POST', path: '/spugna/draw' },
    setPlayerPlayed: { method: 'POST', path: '/spugna/play', body: (args) => ({ userId: args[0] }) },
    resetSpugnaState: { method: 'POST', path: '/spugna/reset' },
    listSessions: { method: 'GET', path: '/sessions' },
    addSession: { method: 'POST', path: '/sessions/add', body: (args) => ({ sessionId: args[0], title: args[1] }) },
    removeSession: { method: 'POST', path: '/sessions/remove', body: (args) => ({ sessionId: args[0] }) },
    updateSessionActivity: { method: 'POST', path: '/sessions/update-activity', body: (args) => ({ sessionId: args[0] }) },
    updateSessionTitle: { method: 'POST', path: '/sessions/update-title', body: (args) => ({ sessionId: args[0], title: args[1] }) },
    getSessionCount: { method: 'GET', path: '/sessions/count' },
    getSession: { method: 'POST', path: '/sessions/get', body: (args) => ({ sessionId: args[0] }) },
    clearAllSessions: { method: 'POST', path: '/sessions/clear' },
  };
  return new Proxy({} as AppController, {
    get(target, prop) {
      if (typeof prop === 'string' && prop !== 'then') { // Avoid proxying Promise methods
        const mapping = methodMappings[prop];
        if (mapping) {
          return async (...args: any[]) => {
            try {
              const body = mapping.body ? JSON.stringify(mapping.body(args)) : undefined;
              const request = new Request(`https://do-proxy${mapping.path}`, {
                method: mapping.method,
                headers: { 'Content-Type': 'application/json' },
                body,
              });
              const response = await stub.fetch(request);
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Durable Object fetch failed with status ${response.status}: ${errorText}`);
              }
              return await response.json();
            } catch (error) {
              console.error(`Proxy error for '${prop}':`, error);
              if (prop === 'getSpugnaState') {
                return { optimalDraw: null, playersWhoPlayed: {}, isInitialDrawDone: false, timestamp: null };
              }
              throw error; // Re-throw to be caught by the route handler
            }
          };
        }
      }
      return Reflect.get(target, prop);
    },
  });
}
export async function registerSession(env: Env, sessionId: string, title?: string): Promise<void> {
  try {
    const controller = getAppController(env);
    await controller.addSession(sessionId, title);
  } catch (error) {
    console.error('Failed to register session:', error);
  }
}
export async function updateSessionActivity(env: Env, sessionId: string): Promise<void> {
  try {
    const controller = getAppController(env);
    await controller.updateSessionActivity(sessionId);
  } catch (error) {
    console.error('Failed to update session activity:', error);
  }
}
export async function unregisterSession(env: Env, sessionId: string): Promise<boolean> {
  try {
    const controller = getAppController(env);
    return await controller.removeSession(sessionId);
  } catch (error) {
    console.error('Failed to unregister session:', error);
    return false;
  }
}