// Thin wrapper around the Telegram Bot API for generating single-use VIP
// invite links. Server-only — never import this from a client component.

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface TelegramInviteResult {
  inviteLink: string;
  expiresAt: string;
}

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  return token;
}

async function callTelegramApi(method: string, params: Record<string, unknown>) {
  const token = getBotToken();
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!data.ok) {
    console.error(`[telegram] ${method} failed:`, data.description || data);
    throw new Error(data.description || `Telegram API call to ${method} failed.`);
  }
  return data.result;
}

async function createInviteLink(chatId: string, name: string): Promise<TelegramInviteResult> {
  const expiresAtMs = Date.now() + INVITE_TTL_MS;
  const result = await callTelegramApi("createChatInviteLink", {
    chat_id: chatId,
    member_limit: 1,
    expire_date: Math.floor(expiresAtMs / 1000),
    name,
  });
  return {
    inviteLink: result.invite_link as string,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

export async function createChannelInvite(label: string): Promise<TelegramInviteResult> {
  const chatId = process.env.TELEGRAM_COURSE_CHANNEL_ID?.trim();
  if (!chatId) throw new Error("TELEGRAM_COURSE_CHANNEL_ID is not configured.");
  return createInviteLink(chatId, `Course: ${label}`.slice(0, 32));
}

export async function createCommunityInvite(label: string): Promise<TelegramInviteResult> {
  const chatId = process.env.TELEGRAM_COMMUNITY_GROUP_ID?.trim();
  if (!chatId) throw new Error("TELEGRAM_COMMUNITY_GROUP_ID is not configured.");
  return createInviteLink(chatId, `Community: ${label}`.slice(0, 32));
}

export async function revokeInvite(chatKind: "channel" | "group", inviteLink: string): Promise<void> {
  const chatId = chatKind === "channel"
    ? process.env.TELEGRAM_COURSE_CHANNEL_ID?.trim()
    : process.env.TELEGRAM_COMMUNITY_GROUP_ID?.trim();
  if (!chatId) throw new Error(`Telegram chat id for "${chatKind}" is not configured.`);

  await callTelegramApi("revokeChatInviteLink", {
    chat_id: chatId,
    invite_link: inviteLink,
  });
}
