import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import ChatList from './components/ChatList';
import ChatDetail from './components/ChatDetail';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import GamesHub from './components/GamesHub';
import CallsScreen from './components/CallsScreen';
import { Chat } from './data/chats';

type Screen = 'splash' | 'main';
type MainTab = 'chats' | 'calls' | 'games' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [activeTab, setActiveTab] = useState<MainTab>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as MainTab);
    setSelectedChat(null);
  };

  return (
    <div className="h-full w-full bg-(--bg) flex justify-center">
      <div className="w-full max-w-md h-full bg-(--bg) relative overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          {screen === 'splash' && (
            <motion.div
              key="splash"
              className="absolute inset-0"
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <SplashScreen onEnter={() => setScreen('main')} />
            </motion.div>
          )}

          {screen === 'main' && (
            <motion.div
              key="main"
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {activeTab === 'chats' ? (
                    <motion.div
                      key="chats"
                      className="h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ChatList onChatSelect={setSelectedChat} />
                    </motion.div>
                  ) : activeTab === 'calls' ? (
                    <motion.div
                      key="calls"
                      className="h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <CallsScreen />
                    </motion.div>
                  ) : activeTab === 'games' ? (
                    <motion.div
                      key="games"
                      className="h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <GamesHub />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="settings"
                      className="h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Settings />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* chat detail overlay */}
                <AnimatePresence>
                  {selectedChat && (
                    <motion.div
                      key={`chat-${selectedChat.id}`}
                      className="absolute inset-0 z-20 bg-(--bg)"
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    >
                      <ChatDetail chat={selectedChat} onBack={() => setSelectedChat(null)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!selectedChat && <BottomNav active={activeTab} onChange={handleTabChange} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
