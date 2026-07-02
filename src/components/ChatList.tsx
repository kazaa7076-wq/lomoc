import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Menu, CheckCheck, Check, Send, Gamepad2, Clapperboard, X } from 'lucide-react';
import { chats, Chat } from '../data/chats';
import { useSettings } from '../context/SettingsContext';
import { useChatStore } from '../store/ChatStore';

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
}

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'groups', label: 'Groups' },
  { id: 'channels', label: 'Channels' },
  { id: 'bots', label: 'Bots' },
];

function getAvatarIcon(chat: Chat) {
  if (chat.name === 'Lumo AI') {
    return (
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--acc1), var(--acc2))' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="11" r="1" fill="white" />
          <circle cx="12" cy="11" r="1" fill="white" />
          <circle cx="15" cy="11" r="1" fill="white" />
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    );
  }
  if (chat.name === 'Tech News') {
    return (
      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
        <Send size={20} className="text-white -rotate-45" />
      </div>
    );
  }
  if (chat.name === 'Gaming Zone') {
    return (
      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
        <Gamepad2 size={20} className="text-white" />
      </div>
    );
  }
  if (chat.name === 'Movie Buffs') {
    return (
      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
        <Clapperboard size={20} className="text-white" />
      </div>
    );
  }
  return (
    <img
      src={chat.avatar}
      alt={chat.name}
      className="w-12 h-12 rounded-full object-cover"
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random&color=fff`;
      }}
    />
  );
}

export default function ChatList({ onChatSelect }: ChatListProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { settings } = useSettings();
  const { unread, typing, lastOf, messages } = useChatStore();

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  /* --- global search (like Telegram): chats by name + messages by text --- */
  const chatResults = searching
    ? chats.filter((c) => c.name.toLowerCase().includes(q))
    : [];
  const messageResults = searching
    ? Object.entries(messages)
        .flatMap(([chatId, list]) =>
          list
            .filter((m) => m.text && m.text.toLowerCase().includes(q))
            .map((m) => ({ chat: chats.find((c) => c.id === chatId)!, msg: m }))
        )
        .slice(0, 25)
    : [];

  const filteredChats = chats.filter((chat) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return (unread[chat.id] || 0) > 0;
    if (activeTab === 'groups') return chat.type === 'group';
    if (activeTab === 'channels') return chat.type === 'channel';
    if (activeTab === 'bots') return chat.type === 'bot';
    return true;
  });

  const highlight = (text: string) => {
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return text;
    return (
      <>
        {text.slice(0, i)}
        <span style={{ color: 'var(--acc1)' }} className="font-semibold">
          {text.slice(i, i + q.length)}
        </span>
        {text.slice(i + q.length)}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-(--bg)">
      {/* Header */}
      <div className="shrink-0 safe-top pb-2 px-4">
        {searchOpen ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center bg-(--surface) rounded-full px-4 py-2.5 border border-white/5">
              <Search size={16} className="text-gray-500 mr-2 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats & messages…"
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
              />
            </div>
            <button
              onClick={() => {
                setSearchOpen(false);
                setQuery('');
              }}
              className="w-10 h-10 flex items-center justify-center text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <button className="w-10 h-10 flex items-center justify-center text-gray-400">
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-bold">
              <span style={{ color: 'var(--acc1)' }}>Lumo</span>
              <span className="text-white">Chat</span>
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-gray-400"
              >
                <Search size={20} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center text-gray-400">
                <Plus size={22} />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        {!searching && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="chatTab"
                  className="absolute inset-0 bg-white/10 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.label}
                {tab.id === 'all' && totalUnread > 0 && (
                  <span
                    className="min-w-5 h-5 px-1 rounded-full text-[10px] flex items-center justify-center"
                    style={{ background: 'var(--acc1)' }}
                  >
                    {totalUnread}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Search results (Telegram-style) */}
      {searching ? (
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {chatResults.length > 0 && (
            <>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 py-2">
                Chats
              </p>
              {chatResults.map((chat) => (
                <button
                  key={`c-${chat.id}`}
                  onClick={() => onChatSelect(chat)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="shrink-0">{getAvatarIcon(chat)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {highlight(chat.name)}
                    </h3>
                    <p className="text-gray-500 text-xs capitalize">{chat.type}</p>
                  </div>
                </button>
              ))}
            </>
          )}
          {messageResults.length > 0 && (
            <>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 py-2 mt-2">
                Messages
              </p>
              {messageResults.map(({ chat, msg }) => (
                <button
                  key={`m-${msg.id}`}
                  onClick={() => onChatSelect(chat)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="shrink-0">{getAvatarIcon(chat)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold text-sm truncate">{chat.name}</h3>
                      <span className="text-gray-600 text-[10px] shrink-0 ml-2">{msg.time}</span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">
                      <span className="text-gray-500">{msg.isMe ? 'You: ' : `${msg.sender}: `}</span>
                      {highlight(msg.text || '')}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
          {chatResults.length === 0 && messageResults.length === 0 && (
            <div className="text-center mt-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 text-sm">No results for “{query}”</p>
              <p className="text-gray-600 text-xs mt-1">چیزی پیدا نشد</p>
            </div>
          )}
        </div>
      ) : (
      <div className="flex-1 overflow-y-auto px-2">
        <AnimatePresence mode="popLayout">
          {filteredChats.map((chat, index) => {
            const last = lastOf(chat.id);
            const chatUnread = unread[chat.id] || 0;
            const typingName = typing[chat.id];
            return (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => onChatSelect(chat)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="relative shrink-0">
                  {getAvatarIcon(chat)}
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-(--bg)" />
                  )}
                  {chat.verified && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-(--bg) flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-white font-semibold text-sm truncate">{chat.name}</h3>
                    <span className="text-gray-500 text-[11px] shrink-0 ml-2">{last.time}</span>
                  </div>
                  {typingName ? (
                    <p className="text-[13px] truncate italic" style={{ color: 'var(--acc1)' }}>
                      {typingName} is typing…
                    </p>
                  ) : (
                    <p className="text-gray-400 text-[13px] truncate">{last.text}</p>
                  )}
                </div>
                {chatUnread > 0 ? (
                  <div
                    className="shrink-0 min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--acc1)' }}
                  >
                    <span className="text-white text-[11px] font-bold">{chatUnread}</span>
                  </div>
                ) : chat.type === 'personal' ? (
                  settings.privacy.readReceipts ? (
                    <CheckCheck size={16} className="shrink-0" style={{ color: 'var(--acc1)' }} />
                  ) : (
                    <Check size={16} className="text-gray-500 shrink-0" />
                  )
                ) : null}
              </motion.button>
            );
          })}
        </AnimatePresence>
        {filteredChats.length === 0 && (
          <p className="text-center text-gray-600 text-sm mt-10">No chats found</p>
        )}
      </div>
      )}
    </div>
  );
}
