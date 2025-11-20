import type { SessionInfo } from './types';
import type { Env } from './core-utils';
import { generateOptimalDraw } from './spugna';
import { DurableObjectState, Request, Response } from '@cloudflare/workers-types';
export interface SpugnaState {
  optimalDraw: Record<string, string[]> | null;
  playersWhoPlayed: Record<string, boolean>;
  isInitialDrawDone: boolean;
  timestamp: number | null;
}
export class AppController {
  state: DurableObjectState;
  env: Env;
  private sessions: Map<string, SessionInfo>;
  private spugnaState: SpugnaState;
  private loaded: boolean;
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map<string, SessionInfo>();
    this.spugnaState = {
      optimalDraw: null,
      playersWhoPlayed: {},
      isInitialDrawDone: false,
      timestamp: null,
    };
    this.loaded = false;
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      try {
        const storedSessions = await this.state.storage.get<Record<string, SessionInfo>>('sessions') || {};
        this.sessions = new Map(Object.entries(storedSessions));
        const storedSpugnaState = await this.state.storage.get<SpugnaState>('spugnaState');
        this.spugnaState = storedSpugnaState || {
          optimalDraw: null,
          playersWhoPlayed: {},
          isInitialDrawDone: false,
          timestamp: null
        };
      } catch (e) {
        console.error("Failed to load state from storage:", e);
        // Initialize with default state if loading fails
        this.sessions = new Map();
        this.spugnaState = { optimalDraw: null, playersWhoPlayed: {}, isInitialDrawDone: false, timestamp: null };
      }
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    try {
      await this.state.storage.put('sessions', Object.fromEntries(this.sessions));
      await this.state.storage.put('spugnaState', this.spugnaState);
    } catch (e) {
      console.error("Failed to persist state to storage:", e);
    }
  }
  async getSpugnaState(): Promise<SpugnaState> {
    await this.ensureLoaded();
    return this.spugnaState;
  }
  async performSpugnaDraw(): Promise<SpugnaState> {
    await this.ensureLoaded();
    if (!this.spugnaState.isInitialDrawDone) {
      const draw = generateOptimalDraw();
      if (draw) {
        this.spugnaState.optimalDraw = draw;
        this.spugnaState.isInitialDrawDone = true;
        this.spugnaState.timestamp = Date.now();
        await this.persist();
      }
    }
    return this.spugnaState;
  }
  async setPlayerPlayed(userId: string): Promise<SpugnaState> {
    await this.ensureLoaded();
    this.spugnaState.playersWhoPlayed[userId] = true;
    await this.persist();
    return this.spugnaState;
  }
  async resetSpugnaState(): Promise<SpugnaState> {
    await this.ensureLoaded();
    this.spugnaState = {
      optimalDraw: null,
      playersWhoPlayed: {},
      isInitialDrawDone: false,
      timestamp: null
    };
    await this.persist();
    return this.spugnaState;
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.persist();
      return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    await this.ensureLoaded();
    return this.sessions.get(sessionId) || null;
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    this.sessions.clear();
    await this.persist();
    return count;
  }
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const headers = { 'Content-Type': 'application/json' };
      if (path === '/spugna/state' && request.method === 'GET') {
        const state = await this.getSpugnaState();
        return new Response(JSON.stringify(state), { headers });
      }
      if (path === '/spugna/draw' && request.method === 'POST') {
        const state = await this.performSpugnaDraw();
        return new Response(JSON.stringify(state), { headers });
      }
      if (path === '/spugna/play' && request.method === 'POST') {
        const { userId } = await request.json<{ userId: string }>();
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers });
        }
        const state = await this.setPlayerPlayed(userId);
        return new Response(JSON.stringify(state), { headers });
      }
      if (path === '/spugna/reset' && request.method === 'POST') {
        const state = await this.resetSpugnaState();
        return new Response(JSON.stringify(state), { headers });
      }
      if (path === '/sessions' && request.method === 'GET') {
        const sessions = await this.listSessions();
        return new Response(JSON.stringify(sessions), { headers });
      }
      if (path === '/sessions/add' && request.method === 'POST') {
        const { sessionId, title } = await request.json<{ sessionId: string; title?: string }>();
        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Missing sessionId' }), { status: 400, headers });
        }
        await this.addSession(sessionId, title);
        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
      }
      if (path === '/sessions/remove' && request.method === 'POST') {
        const { sessionId } = await request.json<{ sessionId: string }>();
        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Missing sessionId' }), { status: 400, headers });
        }
        const deleted = await this.removeSession(sessionId);
        return new Response(JSON.stringify({ deleted }), { headers });
      }
      if (path === '/sessions/update-activity' && request.method === 'POST') {
        const { sessionId } = await request.json<{ sessionId: string }>();
        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Missing sessionId' }), { status: 400, headers });
        }
        await this.updateSessionActivity(sessionId);
        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
      }
      if (path === '/sessions/update-title' && request.method === 'POST') {
        const { sessionId, title } = await request.json<{ sessionId: string; title: string }>();
        if (!sessionId || !title) {
          return new Response(JSON.stringify({ error: 'Missing sessionId or title' }), { status: 400, headers });
        }
        const updated = await this.updateSessionTitle(sessionId, title);
        return new Response(JSON.stringify({ updated }), { headers });
      }
      if (path === '/sessions/count' && request.method === 'GET') {
        const count = await this.getSessionCount();
        return new Response(JSON.stringify({ count }), { headers });
      }
      if (path === '/sessions/get' && request.method === 'POST') {
        const { sessionId } = await request.json<{ sessionId: string }>();
        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Missing sessionId' }), { status: 400, headers });
        }
        const session = await this.getSession(sessionId);
        return new Response(JSON.stringify(session), { headers });
      }
      if (path === '/sessions/clear' && request.method === 'POST') {
        const cleared = await this.clearAllSessions();
        return new Response(JSON.stringify({ cleared }), { headers });
      }
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('AppController fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An internal error occurred';
      return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }
}