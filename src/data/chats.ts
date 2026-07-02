export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: 'personal' | 'group' | 'channel' | 'bot';
  online?: boolean;
  verified?: boolean;
  messages?: Message[];
}

export interface Message {
  id: string;
  sender: string;
  text?: string;
  time: string;
  isMe: boolean;
  type: 'text' | 'voice' | 'image' | 'summary';
  voiceDuration?: string;
  reactions?: { emoji: string; count: number }[];
  replyTo?: { sender: string; text: string };
  edited?: boolean;
}

/* canned auto-replies per chat (simulated other side) */
export const AUTO_REPLIES: Record<string, { sender: string; texts: string[] }[]> = {
  '1': [
    { sender: 'Emma', texts: ['Love it! 😍', 'Can you share the Figma link?', 'This is looking great!', 'Let’s ship it 🚀'] },
    { sender: 'John', texts: ['Agreed 🔥', 'Nice one!', 'When is the next review?', 'Haha exactly 😂'] },
    { sender: 'Alex', texts: ['I’ll check it tonight 👍', 'Good point!', 'Sending feedback soon.'] },
  ],
  '3': [
    { sender: 'Alan Smith', texts: ['Sounds good! 👍', 'Haha yeah 😄', 'Sure, 1pm works for me.', 'See you there!', 'On my way 🏃'] },
  ],
  '5': [
    { sender: 'Max', texts: ['GG! 🎮', 'One more match?', 'You up for ranked tonight?', 'Nice play! 🔥'] },
  ],
  '6': [
    { sender: 'Linda', texts: ['Aww 💜', 'Can’t wait!', 'Miss you too!', 'Okay perfect 😊'] },
  ],
  '7': [
    { sender: 'Movie Buffs', texts: ['Interstellar is a must-watch 🌌', 'Dune Part Two was epic!', 'Adding it to the list 🍿'] },
  ],
};

export const LUMO_REPLIES = [
  'Got it! I’ve noted that for you. ✨',
  'Interesting! Want me to summarize your recent chats?',
  'Here’s a tip: you can change your theme in Settings → Appearance 🎨',
  'I’m always here to help. Ask me anything!',
  'Done! Anything else I can do for you? 🤖',
];

export const chats: Chat[] = [
  {
    id: '1',
    name: 'Design Team',
    avatar: 'https://i.pravatar.cc/150?u=design',
    lastMessage: 'Emma: this is looking great!',
    time: '9:41 AM',
    unread: 12,
    type: 'group',
    verified: true,
    messages: [
      { id: 'm1', sender: 'Emma', text: 'Check out the new logo! 🎨', time: '9:30 AM', isMe: false, type: 'text' },
      { id: 'm2', sender: 'John', text: 'Wow! Looks amazing 🔥🔥', time: '9:31 AM', isMe: false, type: 'text', reactions: [{ emoji: '🔥', count: 12 }, { emoji: '💜', count: 5 }, { emoji: '🎉', count: 3 }, { emoji: '❤️', count: 3 }] },
      { id: 'm3', sender: 'You', text: 'Love the glow effect! ✨', time: '9:31 AM', isMe: true, type: 'text' },
      { id: 'm4', sender: 'Alex', text: '', time: '9:32 AM', isMe: false, type: 'voice', voiceDuration: '0:15' },
    ]
  },
  {
    id: '2',
    name: 'Lumo AI',
    avatar: '',
    lastMessage: 'AI: Summary of your chat',
    time: '9:30 AM',
    unread: 3,
    type: 'bot',
    messages: [
      { id: 'm1', sender: 'You', text: 'Summarize this chat for me', time: '9:20 AM', isMe: true, type: 'text' },
      { id: 'm2', sender: 'Lumo AI', text: 'Chat Summary\n• Project "LumoChat" is on track.\n• Design is almost completed.\n• Next meeting on Friday.\n• Waiting for feedback from Alex.', time: '9:21 AM', isMe: false, type: 'summary' },
      { id: 'm3', sender: 'You', text: 'Show Highlights', time: '9:22 AM', isMe: true, type: 'text' },
      { id: 'm4', sender: 'Lumo AI', text: '', time: '9:23 AM', isMe: false, type: 'voice', voiceDuration: '0:24' },
    ]
  },
  {
    id: '3',
    name: 'Alan Smith',
    avatar: 'https://i.pravatar.cc/150?u=alan',
    lastMessage: 'Hey! Are we still on for lunch?',
    time: '9:21 AM',
    unread: 0,
    type: 'personal',
    online: true,
    messages: [
      { id: 'm1', sender: 'Alan Smith', text: 'Hey! Are we still on for lunch?', time: '9:21 AM', isMe: false, type: 'text' },
    ]
  },
  {
    id: '4',
    name: 'Tech News',
    avatar: '',
    lastMessage: 'iOS 18 released! 🚀',
    time: '8:45 AM',
    unread: 27,
    type: 'channel',
    messages: [
      { id: 'm1', sender: 'Tech News', text: 'iOS 18 released! 🚀', time: '8:45 AM', isMe: false, type: 'text' },
    ]
  },
  {
    id: '5',
    name: 'Gaming Zone',
    avatar: '',
    lastMessage: "Max: Who's up for a match?",
    time: 'Yesterday',
    unread: 0,
    type: 'group',
    messages: [
      { id: 'm1', sender: 'Max', text: "Who's up for a match?", time: 'Yesterday', isMe: false, type: 'text' },
    ]
  },
  {
    id: '6',
    name: 'Linda',
    avatar: 'https://i.pravatar.cc/150?u=linda',
    lastMessage: 'See you tomorrow 💜',
    time: 'Yesterday',
    unread: 0,
    type: 'personal',
    online: false,
    messages: [
      { id: 'm1', sender: 'Linda', text: 'See you tomorrow 💜', time: 'Yesterday', isMe: false, type: 'text' },
    ]
  },
  {
    id: '7',
    name: 'Movie Buffs',
    avatar: '',
    lastMessage: 'Top 10 Sci-Fi movies',
    time: 'Mon',
    unread: 8,
    type: 'group',
    messages: [
      { id: 'm1', sender: 'Movie Buffs', text: 'Top 10 Sci-Fi movies', time: 'Mon', isMe: false, type: 'text' },
    ]
  },
];

export const settingsItems = [
  { icon: 'User', label: 'Account', hasArrow: true },
  { icon: 'Shield', label: 'Privacy & Security', hasArrow: true },
  { icon: 'Bell', label: 'Notifications', hasArrow: true },
  { icon: 'MessageCircle', label: 'Chats', hasArrow: true },
  { icon: 'Database', label: 'Data and Storage', hasArrow: true },
  { icon: 'Smartphone', label: 'Devices', hasArrow: true },
  { icon: 'Palette', label: 'Appearance', hasArrow: true },
  { icon: 'Globe', label: 'Language', value: 'English', hasArrow: true },
  { icon: 'Info', label: 'About LumoChat', hasArrow: true },
];
