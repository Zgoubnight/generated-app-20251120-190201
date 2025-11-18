import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo } from './types';
import type { Env } from './core-utils';
import { generateOptimalDraw } from './spugna';
import type { DurableObjectState } from 'cloudflare:workers';
export interface SpugnaState {
  optimalDraw: Record<string, string[]> | null;
  playersWhoPlayed: Record<string, boolean>;
  isInitialDrawDone: boolean;
  timestamp: number | null;
}
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private spugnaState: SpugnaState | null = null;
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const storedSessions = (await this.ctx.storage.get<Record<string, SessionInfo>>('sessions')) || {};
      this.sessions = new Map(Object.entries(storedSessions));
      const storedSpugnaState = await this.ctx.storage.get<SpugnaState>('spugnaState');
      this.spugnaState = storedSpugnaState || {
        optimalDraw: null,
        playersWhoPlayed: {},
        isInitialDrawDone: false,
        timestamp: null
      };
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
    await this.ctx.storage.put('spugnaState', this.spugnaState);
  }
  async getSpugnaState(): Promise<SpugnaState | null> {
    await this.ensureLoaded();
    return this.spugnaState;
  }
  async performSpugnaDraw(): Promise<SpugnaState | null> {
    await this.ensureLoaded();
    if (this.spugnaState && !this.spugnaState.isInitialDrawDone) {
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
  async setPlayerPlayed(userId: string): Promise<SpugnaState | null> {
    await this.ensureLoaded();
    if (this.spugnaState) {
      this.spugnaState.playersWhoPlayed[userId] = true;
      await this.persist();
    }
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
}