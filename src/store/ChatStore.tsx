import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { chats, Message, AUTO_REPLIES, LUMO_REPLIES } from '../data/chats';
import { useSettings } from '../context/SettingsContext';

function now() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

interface ChatStoreCtx {
  messages: Record<string, Message[]>;
  unread: Record<string, number>;
  typing: Record<string, string | null>; // chatId -> name typing
  activeChatId: string | null;
  setActiveChat: (id: string | null) => void;
  send: (chatId: string, text: string, replyTo?: { sender: string; text: string }) => void;
  editMessage: (chatId: string, msgId: string, text: string) => void;
  deleteMessage: (chatId: string, msgId: string) => void;
  react: (chatId: string, msgId: string, emoji: string) => void;
  lastOf: (chatId: string) => { text: string; time: string };
}

const Ctx = createContext<ChatStoreCtx | null>(null);

export function useChatStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useChatStore outside provider');
  return ctx;
}

export function ChatStoreProvider({ children }: { children: ReactNode }) {
  const { notify } = useSettings();
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const init: Record<string, Message[]> = {};
    chats.forEach((c) => (init[c.id] = c.messages ? [...c.messages] : []));
    return init;
  });
  const [unread, setUnread] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    chats.forEach((c) => (init[c.id] = c.unread));
    return init;
  });
  const [typing, setTyping] = useState<Record<string, string | null>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);

  const setActiveChat = useCallback((id: string | null) => {
    activeRef.current = id;
    setActiveChatId(id);
    if (id) setUnread((u) => ({ ...u, [id]: 0 }));
  }, []);

  const pushMessage = useCallback(
    (chatId: string, msg: Message) => {
      setMessages((m) => ({ ...m, [chatId]: [...(m[chatId] || []), msg] }));
      if (!msg.isMe && activeRef.current !== chatId) {
        setUnread((u) => ({ ...u, [chatId]: (u[chatId] || 0) + 1 }));
        const chat = chats.find((c) => c.id === chatId);
        notify(`${msg.sender}${chat && chat.type === 'group' ? ' — ' + chat.name : ''}`, msg.text || '🎤 Voice message');
      }
    },
    [notify]
  );

  const send = useCallback(
    (chatId: string, text: string, replyTo?: { sender: string; text: string }) => {
      pushMessage(chatId, {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender: 'You',
        text,
        time: now(),
        isMe: true,
        type: 'text',
        replyTo,
      });

      /* simulate the other side */
      const chat = chats.find((c) => c.id === chatId);
      if (!chat || chat.type === 'channel') return;

      const typingDelay = 800 + Math.random() * 800;
      const replyDelay = typingDelay + 1200 + Math.random() * 1500;

      let sender = chat.name;
      let replyText = '';

      if (chat.id === '2') {
        sender = 'Lumo AI';
        const lower = text.toLowerCase();
        if (lower.includes('summar') || text.includes('خلاصه')) {
          setTimeout(() => setTyping((t) => ({ ...t, [chatId]: sender })), typingDelay);
          setTimeout(() => {
            setTyping((t) => ({ ...t, [chatId]: null }));
            pushMessage(chatId, {
              id: `m-${Date.now()}-ai`,
              sender,
              text: 'Chat Summary\n• You discussed the LumoChat design.\n• Everyone loved the new logo.\n• Next sync is on Friday.\n• Alex will send feedback tonight.',
              time: now(),
              isMe: false,
              type: 'summary',
            });
          }, replyDelay);
          return;
        }
        if (lower.includes('سلام') || lower.includes('hi') || lower.includes('hello')) {
          replyText = 'Hello! 👋 I’m Lumo, your AI assistant. How can I help?';
        } else {
          replyText = LUMO_REPLIES[Math.floor(Math.random() * LUMO_REPLIES.length)];
        }
      } else {
        const pool = AUTO_REPLIES[chatId];
        if (pool) {
          const who = pool[Math.floor(Math.random() * pool.length)];
          sender = who.sender;
          replyText = who.texts[Math.floor(Math.random() * who.texts.length)];
        } else {
          replyText = '👍';
        }
      }

      setTimeout(() => setTyping((t) => ({ ...t, [chatId]: sender })), typingDelay);
      setTimeout(() => {
        setTyping((t) => ({ ...t, [chatId]: null }));
        pushMessage(chatId, {
          id: `m-${Date.now()}-r`,
          sender,
          text: replyText,
          time: now(),
          isMe: false,
          type: 'text',
        });
      }, replyDelay);
    },
    [pushMessage]
  );

  const editMessage = useCallback((chatId: string, msgId: string, text: string) => {
    setMessages((m) => ({
      ...m,
      [chatId]: (m[chatId] || []).map((msg) =>
        msg.id === msgId ? { ...msg, text, edited: true } : msg
      ),
    }));
  }, []);

  const deleteMessage = useCallback((chatId: string, msgId: string) => {
    setMessages((m) => ({
      ...m,
      [chatId]: (m[chatId] || []).filter((msg) => msg.id !== msgId),
    }));
  }, []);

  const react = useCallback((chatId: string, msgId: string, emoji: string) => {
    setMessages((m) => ({
      ...m,
      [chatId]: (m[chatId] || []).map((msg) => {
        if (msg.id !== msgId) return msg;
        const reactions = [...(msg.reactions || [])];
        const i = reactions.findIndex((r) => r.emoji === emoji);
        if (i >= 0) reactions[i] = { ...reactions[i], count: reactions[i].count + 1 };
        else reactions.push({ emoji, count: 1 });
        return { ...msg, reactions };
      }),
    }));
  }, []);

  const lastOf = useCallback(
    (chatId: string) => {
      const list = messages[chatId] || [];
      const last = list[list.length - 1];
      const chat = chats.find((c) => c.id === chatId);
      if (!last) return { text: chat?.lastMessage || '', time: chat?.time || '' };
      const prefix = last.isMe ? 'You: ' : chat?.type === 'group' ? `${last.sender}: ` : '';
      const body =
        last.type === 'voice'
          ? '🎤 Voice message'
          : last.type === 'summary'
          ? '🤖 Chat summary'
          : last.text || '';
      return { text: prefix + body, time: last.time };
    },
    [messages]
  );

  return (
    <Ctx.Provider
      value={{
        messages,
        unread,
        typing,
        activeChatId,
        setActiveChat,
        send,
        editMessage,
        deleteMessage,
        react,
        lastOf,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
