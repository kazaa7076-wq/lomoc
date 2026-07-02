import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MoreVertical,
  Mic,
  Paperclip,
  Smile,
  Play,
  Pause,
  CheckCheck,
  Check,
  Reply,
  Copy,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { Chat, Message } from '../data/chats';
import { useSettings } from '../context/SettingsContext';
import { useChatStore } from '../store/ChatStore';

interface ChatDetailProps {
  chat: Chat;
  onBack: () => void;
}

const accentGradient = { background: 'linear-gradient(90deg, var(--acc1), var(--acc2))' };
const REACTION_EMOJIS = ['❤️', '🔥', '😂', '👍', '💜', '🎉'];

function VoiceMessage({ duration, isMe }: { duration: string; isMe: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const { settings } = useSettings();
  const radius = settings.bubbleStyle === 'extra' ? '24px' : '16px';

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (playing) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setPlaying(false);
            return 0;
          }
          return p + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 max-w-[280px] ${isMe ? '' : 'bg-(--surface)'}`}
      style={{
        borderRadius: radius,
        ...(isMe ? { ...accentGradient, borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 }),
      }}
    >
      <button
        onClick={() => setPlaying(!playing)}
        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"
      >
        {playing ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className="flex items-end gap-1 h-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-white/40"
              style={{
                height: `${Math.max(4, Math.sin(i * 0.8) * 12 + 16)}px`,
                opacity: playing && i < (progress / 100) * 20 ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>
      <span className="text-white/70 text-xs shrink-0">{duration}</span>
    </div>
  );
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex justify-start mb-3">
      <div className="flex items-center gap-2 px-4 py-3 bg-(--surface) rounded-2xl rounded-bl-md">
        <span className="text-xs" style={{ color: 'var(--acc1)' }}>
          {name}
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  chat,
  selected,
  onSelect,
  onReact,
  onReply,
  onEdit,
  onDelete,
}: {
  msg: Message;
  chat: Chat;
  selected: boolean;
  onSelect: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { settings } = useSettings();
  const isMe = msg.isMe;
  const radius = settings.bubbleStyle === 'extra' ? '24px' : '16px';
  const fontSize = settings.fontSize;

  if (msg.type === 'voice') {
    return (
      <div className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
        <VoiceMessage duration={msg.voiceDuration || '0:15'} isMe={isMe} />
      </div>
    );
  }

  const bubble =
    msg.type === 'summary' ? (
      <div
        className="bg-(--surface) px-4 py-3 max-w-[300px]"
        style={{ borderRadius: radius, borderBottomLeftRadius: 6 }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--acc1)' }}>
          Chat Summary
        </p>
        <div className="text-gray-300 whitespace-pre-line leading-relaxed" style={{ fontSize }}>
          {msg.text}
        </div>
      </div>
    ) : (
      <div
        className={`px-4 py-2.5 leading-relaxed ${isMe ? 'text-white' : 'bg-(--surface) text-gray-200'}`}
        style={{
          fontSize,
          borderRadius: radius,
          ...(isMe ? { ...accentGradient, borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 }),
        }}
      >
        {msg.replyTo && (
          <div className="mb-1.5 pl-2 border-l-2 border-white/40 text-xs opacity-80">
            <p className="font-semibold">{msg.replyTo.sender}</p>
            <p className="truncate max-w-[220px]">{msg.replyTo.text}</p>
          </div>
        )}
        {msg.text}
      </div>
    );

  return (
    <div className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col max-w-[300px] relative">
        {!isMe && chat.type !== 'personal' && (
          <span className="text-xs font-medium mb-1 ml-1" style={{ color: 'var(--acc1)' }}>
            {msg.sender}
          </span>
        )}
        <button onClick={onSelect} className="text-left">
          {bubble}
        </button>

        {msg.reactions && msg.reactions.length > 0 && (
          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end mr-1' : 'ml-1'}`}>
            {msg.reactions.map((r, i) => (
              <button
                key={i}
                onClick={() => onReact(r.emoji)}
                className="px-1.5 py-0.5 bg-(--surface) rounded-full text-xs flex items-center gap-0.5 border border-white/5"
              >
                <span>{r.emoji}</span>
                <span className="text-gray-400 text-[10px]">{r.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
          {msg.edited && <span className="text-gray-600 text-[10px]">edited</span>}
          <span className="text-gray-500 text-[10px]">{msg.time}</span>
          {isMe &&
            (settings.privacy.readReceipts ? (
              <CheckCheck size={12} style={{ color: 'var(--acc1)' }} />
            ) : (
              <Check size={12} className="text-gray-500" />
            ))}
        </div>

        {/* Action menu */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              className={`absolute z-30 top-full mt-1 ${isMe ? 'right-0' : 'left-0'} bg-[#1c1c22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-52`}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                {REACTION_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => onReact(e)}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))}
              </div>
              <button
                onClick={onReply}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5"
              >
                <Reply size={15} /> Reply
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(msg.text || '');
                  onSelect();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5"
              >
                <Copy size={15} /> Copy
              </button>
              {isMe && msg.type === 'text' && (
                <button
                  onClick={onEdit}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5"
                >
                  <Pencil size={15} /> Edit
                </button>
              )}
              {isMe && (
                <button
                  onClick={onDelete}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={15} /> Delete
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ChatDetail({ chat, onBack }: ChatDetailProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{ sender: string; text: string } | null>(null);
  const [editing, setEditing] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSettings();
  const { messages, typing, setActiveChat, send, editMessage, deleteMessage, react } =
    useChatStore();

  const list = messages[chat.id] || [];
  const typingName = typing[chat.id];

  useEffect(() => {
    setActiveChat(chat.id);
    return () => setActiveChat(null);
  }, [chat.id, setActiveChat]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [list.length, typingName]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    if (editing) {
      editMessage(chat.id, editing.id, text);
      setEditing(null);
    } else {
      send(chat.id, text, replyTo || undefined);
      setReplyTo(null);
    }
    setInputValue('');
  };

  const isBot = chat.type === 'bot';
  const isChannel = chat.type === 'channel';

  return (
    <div className="flex flex-col h-full bg-(--bg)" onClick={() => setSelectedId(null)}>
      {/* Header */}
      <div className="shrink-0 safe-top pb-3 px-4 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="relative">
              {chat.avatar ? (
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random&color=fff`;
                  }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--acc1), var(--acc2))' }}
                >
                  <span className="text-white text-sm font-bold">{chat.name[0]}</span>
                </div>
              )}
              {chat.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-(--bg)" />
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">{chat.name}</h2>
              {typingName ? (
                <p className="text-xs" style={{ color: 'var(--acc1)' }}>
                  {typingName} is typing…
                </p>
              ) : chat.type === 'group' ? (
                <p className="text-gray-500 text-xs">12 members, 3 online</p>
              ) : chat.type === 'bot' ? (
                <p className="text-gray-500 text-xs">Online</p>
              ) : chat.online && settings.privacy.lastSeen ? (
                <p className="text-gray-500 text-xs">Online</p>
              ) : null}
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-gray-400">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {isBot && (
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--acc1) 15%, transparent), color-mix(in srgb, var(--acc2) 15%, transparent))',
                borderColor: 'color-mix(in srgb, var(--acc1) 40%, transparent)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="11" r="1" fill="var(--acc1)" />
                <circle cx="12" cy="11" r="1" fill="var(--acc2)" />
                <circle cx="15" cy="11" r="1" fill="var(--acc1)" />
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  stroke="var(--acc1)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        )}

        {list.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            chat={chat}
            selected={selectedId === msg.id}
            onSelect={() => setSelectedId(selectedId === msg.id ? null : msg.id)}
            onReact={(emoji) => {
              react(chat.id, msg.id, emoji);
              setSelectedId(null);
            }}
            onReply={() => {
              setReplyTo({ sender: msg.sender, text: msg.text || '🎤 Voice message' });
              setSelectedId(null);
              inputRef.current?.focus();
            }}
            onEdit={() => {
              setEditing(msg);
              setInputValue(msg.text || '');
              setSelectedId(null);
              inputRef.current?.focus();
            }}
            onDelete={() => {
              deleteMessage(chat.id, msg.id);
              setSelectedId(null);
            }}
          />
        ))}

        {typingName && <TypingIndicator name={typingName} />}
      </div>

      {/* Reply / Edit banner */}
      <AnimatePresence>
        {(replyTo || editing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 px-4 overflow-hidden"
          >
            <div className="flex items-center gap-3 py-2 border-t border-white/5">
              {editing ? <Pencil size={16} style={{ color: 'var(--acc1)' }} /> : <Reply size={16} style={{ color: 'var(--acc1)' }} />}
              <div className="flex-1 min-w-0 pl-2 border-l-2" style={{ borderColor: 'var(--acc1)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--acc1)' }}>
                  {editing ? 'Edit message' : replyTo?.sender}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {editing ? editing.text : replyTo?.text}
                </p>
              </div>
              <button
                onClick={() => {
                  setReplyTo(null);
                  setEditing(null);
                  setInputValue('');
                }}
                className="text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      {isChannel ? (
        <div className="shrink-0 px-4 py-4 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">🔕 Only admins can post in this channel</p>
        </div>
      ) : (
        <div className="shrink-0 px-4 pt-3 pb-3 safe-bottom backdrop-blur-xl border-t border-white/5">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-300">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 flex items-center bg-(--surface) rounded-full px-4 py-2.5 border border-white/5">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message"
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
              />
              <button className="text-gray-500 hover:text-gray-300 ml-2">
                <Smile size={20} />
              </button>
            </div>
            <button
              onClick={handleSend}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
              style={accentGradient}
            >
              {inputValue.trim() ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              ) : (
                <Mic size={20} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
