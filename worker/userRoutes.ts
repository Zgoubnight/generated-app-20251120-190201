import { Hono } from "hono";
import { getAgentByName } from 'agents';
import type { AgentNamespace } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import { MEMBERS } from "./spugna";
import { ChatHandler } from "./chat";
import { Request } from '@cloudflare/workers-types';
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT as unknown as AgentNamespace<ChatAgent>, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // --- La Roue SPUGNA API Routes ---
    app.post('/api/spugna/generate-ideas', async (c) => {
        try {
            if (!c.env.CF_AI_API_KEY || c.env.CF_AI_API_KEY.includes('your') || !c.env.CF_AI_BASE_URL || c.env.CF_AI_BASE_URL.includes('YOUR')) {
                return c.json({ success: false, error: 'AI features are not configured by the administrator.' }, { status: 503 });
            }
            const { recipients } = await c.req.json<{ recipients: string[] }>();
            if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
                return c.json({ success: false, error: 'Recipients are required' }, { status: 400 });
            }
            const recipientDetails = recipients.map(name => {
                const member = MEMBERS.find(m => m.name === name);
                return member ? `${name} (${member.role === 'Child/Recipient' ? 'enfant' : 'adulte'})` : name;
            }).join(', ');
            const prompt = `Pour une fête de Noël en famille, génère 2 idées de cadeaux originales et personnalisées pour chacune des personnes suivantes : ${recipientDetails}. Formatte la réponse en Markdown, avec le nom de chaque personne comme un titre de niveau 2 (## Nom) et les idées de cadeaux comme une liste à puces.`;
            const chatHandler = new ChatHandler(c.env.CF_AI_BASE_URL, c.env.CF_AI_API_KEY, 'google-ai-studio/gemini-2.5-flash');
            const ideas = await chatHandler.generateSingleResponse(prompt);
            return c.json({ success: true, data: { ideas } });
        } catch (error) {
            console.error('Failed to generate gift ideas:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate gift ideas';
            return c.json({ success: false, error: errorMessage }, { status: 500 });
        }
    });
    // GET /api/spugna/state - Get the current state of the game
    app.get('/api/spugna/state', async (c) => {
        try {
            const controller = getAppController(c.env);
            const state = await controller.getSpugnaState();
            return c.json({ success: true, data: state });
        } catch (error) {
            console.error('Failed to get Spugna state:', error);
            return c.json({ success: false, error: 'Failed to retrieve game state' }, { status: 500 });
        }
    });
    // POST /api/spugna/draw - (Admin) Perform the initial draw
    app.post('/api/spugna/draw', async (c) => {
        try {
            const controller = getAppController(c.env);
            const state = await controller.performSpugnaDraw();
            if (!state?.optimalDraw) {
                 return c.json({ success: false, error: 'Failed to generate a valid draw' }, { status: 500 });
            }
            return c.json({ success: true, data: state });
        } catch (error) {
            console.error('Failed to perform Spugna draw:', error);
            return c.json({ success: false, error: 'Failed to perform draw' }, { status: 500 });
        }
    });
    // POST /api/spugna/played/:userId - Mark a user as having played
    app.post('/api/spugna/played/:userId', async (c) => {
        try {
            const userId = c.req.param('userId');
            const user = MEMBERS.find(m => m.id === userId);
            if (!user) {
                return c.json({ success: false, error: 'User not found' }, { status: 404 });
            }
            const controller = getAppController(c.env);
            const state = await controller.setPlayerPlayed(userId);
            return c.json({ success: true, data: state });
        } catch (error) {
            console.error('Failed to mark player as played:', error);
            return c.json({ success: false, error: 'Failed to update player status' }, { status: 500 });
        }
    });
    // DELETE /api/spugna/reset - (Admin) Reset the entire game
    app.delete('/api/spugna/reset', async (c) => {
        try {
            const controller = getAppController(c.env);
            const state = await controller.resetSpugnaState();
            return c.json({ success: true, data: state });
        } catch (error) {
            console.error('Failed to reset Spugna game:', error);
            return c.json({ success: false, error: 'Failed to reset game' }, { status: 500 });
        }
    });
    // --- Existing Chat Session Routes ---
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({
                success: false,
                error: 'Failed to retrieve sessions'
            }, { status: 500 });
        }
    });
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title;
            if (!sessionTitle) {
                const now = new Date();
                const dateTime = now.toLocaleString([], {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    const truncated = cleanMessage.length > 40
                        ? cleanMessage.slice(0, 37) + '...'
                        : cleanMessage;
                    sessionTitle = `${truncated} • ${dateTime}`;
                } else {
                    sessionTitle = `Chat ${dateTime}`;
                }
            }
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({
                success: true,
                data: { sessionId, title: sessionTitle }
            });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({
                success: false,
                error: 'Failed to create session'
            }, { status: 500 });
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) {
                return c.json({
                    success: false,
                    error: 'Session not found'
                }, { status: 404 });
            }
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({
                success: false,
                error: 'Failed to delete session'
            }, { status: 500 });
        }
    });
    app.put('/api/sessions/:sessionId/title', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const { title } = await c.req.json();
            if (!title || typeof title !== 'string') {
                return c.json({
                    success: false,
                    error: 'Title is required'
                }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const updated = await controller.updateSessionTitle(sessionId, title);
            if (!updated) {
                return c.json({
                    success: false,
                    error: 'Session not found'
                }, { status: 404 });
            }
            return c.json({ success: true, data: { title } });
        } catch (error) {
            console.error('Failed to update session title:', error);
            return c.json({
                success: false,
                error: 'Failed to update session title'
            }, { status: 500 });
        }
    });
    app.get('/api/sessions/stats', async (c) => {
        try {
            const controller = getAppController(c.env);
            const count = await controller.getSessionCount();
            return c.json({
                success: true,
                data: { totalSessions: count }
            });
        } catch (error) {
            console.error('Failed to get session stats:', error);
            return c.json({
                success: false,
                error: 'Failed to retrieve session stats'
            }, { status: 500 });
        }
    });
    app.delete('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const deletedCount = await controller.clearAllSessions();
            return c.json({
                success: true,
                data: { deletedCount }
            });
        } catch (error) {
            console.error('Failed to clear all sessions:', error);
            return c.json({
                success: false,
                error: 'Failed to clear all sessions'
            }, { status: 500 });
        }
    });
}