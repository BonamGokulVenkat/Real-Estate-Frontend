export type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  properties?: unknown[];
  suggestions?: string[];
  streaming?: boolean;
  outcome?: "complete" | "partial" | "failed" | "cancelled";
  issue?: string;
  retryText?: string;
};

export type StoredChat = { sessionId: string | null; messages: StoredChatMessage[] };
export type ChatStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const TTL_MS = 30 * 60 * 1000;
const MAX_MESSAGES = 40;

export function chatStorageKey(owner: string): string {
  return `luxora-chat-v1:${owner}`;
}

export function interruptChat(messages: StoredChatMessage[]): StoredChatMessage[] {
  return messages.map((message, index) => {
    if (!message.streaming) return message;
    const previousUser = [...messages.slice(0, index)].reverse().find(item => item.role === "user");
    return { ...message, streaming: false,
      outcome: message.content || message.properties?.length ? "partial" as const : "failed" as const,
      issue: "The response was interrupted. Please retry.", retryText: previousUser?.content };
  });
}

export function saveChat(storage: ChatStorage, owner: string, chat: StoredChat, now = Date.now()): void {
  try {
    storage.setItem(chatStorageKey(owner), JSON.stringify({
      savedAt: now, sessionId: chat.sessionId, messages: chat.messages.slice(-MAX_MESSAGES),
    }));
  } catch {
    // Storage may be disabled or full; the active in-memory conversation still works.
  }
}

export function loadChat(storage: ChatStorage, owner: string, now = Date.now()): StoredChat | null {
  const key = chatStorageKey(owner);
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!Number.isFinite(value.savedAt) || now - value.savedAt > TTL_MS ||
      (value.sessionId !== null && typeof value.sessionId !== "string") || !Array.isArray(value.messages)) {
      clearChat(storage, owner);
      return null;
    }
    const messages = value.messages.filter((message: StoredChatMessage) =>
      message && typeof message.id === "string" && (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string");
    return { sessionId: value.sessionId, messages: interruptChat(messages).slice(-MAX_MESSAGES) };
  } catch {
    clearChat(storage, owner);
    return null;
  }
}

export function clearChat(storage: ChatStorage, owner: string): void {
  try { storage.removeItem(chatStorageKey(owner)); } catch { /* storage unavailable */ }
}
