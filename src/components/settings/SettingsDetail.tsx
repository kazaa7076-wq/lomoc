import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Smartphone,
  Laptop,
  Globe2,
  BellRing,
  Trash2,
  Lock,
  Eye,
  CheckCheck,
  Wifi,
  KeyRound,
  Image,
  Mic,
  Leaf,
} from 'lucide-react';
import { useSettings, ACCENTS, AccentKey } from '../../context/SettingsContext';

/* ---------- shared UI ---------- */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-12 h-7 rounded-full transition-colors shrink-0"
      style={{ background: on ? 'linear-gradient(90deg, var(--acc1), var(--acc2))' : '#2a2a33' }}
    >
      <motion.span
        animate={{ x: on ? 22 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute top-1 left-0 w-5 h-5 rounded-full bg-white shadow"
      />
    </button>
  );
}

function Row({
  icon,
  label,
  desc,
  right,
}: {
  icon?: React.ReactNode;
  label: string;
  desc?: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-(--surface) first:rounded-t-2xl last:rounded-b-2xl border-b border-white/5 last:border-0">
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{label}</p>
        {desc && <p className="text-gray-500 text-xs mt-0.5">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {title && (
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 mb-2">
          {title}
        </p>
      )}
      <div className="rounded-2xl overflow-hidden">{children}</div>
    </div>
  );
}

/* ---------- pages ---------- */
function AccountPage() {
  const { settings, patch, t } = useSettings();
  return (
    <>
      <div className="flex flex-col items-center mb-6">
        <img
          src="https://i.pravatar.cc/150?u=amirreza"
          alt=""
          className="w-24 h-24 rounded-full object-cover mb-3 ring-2 ring-(--acc1)/50"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://ui-avatars.com/api/?name=AmirReza&background=7c3aed&color=fff';
          }}
        />
        <h2 className="text-white font-bold text-lg">{settings.name}</h2>
        <p className="text-sm" style={{ color: 'var(--acc1)' }}>
          {settings.username}
        </p>
      </div>
      <Section title={t('Account')}>
        <div className="px-4 py-3 bg-(--surface) border-b border-white/5">
          <p className="text-gray-500 text-xs mb-1">{t('Name')}</p>
          <input
            value={settings.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="w-full bg-transparent text-white text-sm outline-none"
          />
        </div>
        <div className="px-4 py-3 bg-(--surface) border-b border-white/5">
          <p className="text-gray-500 text-xs mb-1">{t('Username')}</p>
          <input
            value={settings.username}
            onChange={(e) => patch({ username: e.target.value })}
            className="w-full bg-transparent text-white text-sm outline-none"
          />
        </div>
        <div className="px-4 py-3 bg-(--surface)">
          <p className="text-gray-500 text-xs mb-1">{t('Phone')}</p>
          <input
            value={settings.phone}
            onChange={(e) => patch({ phone: e.target.value })}
            className="w-full bg-transparent text-white text-sm outline-none"
          />
        </div>
      </Section>
    </>
  );
}

function PrivacyPage() {
  const { settings, patchSection, t } = useSettings();
  const p = settings.privacy;
  return (
    <>
      <Section title={t('Privacy & Security')}>
        <Row
          icon={<CheckCheck size={16} />}
          label={t('Read Receipts')}
          desc="Show double checks when messages are read"
          right={<Toggle on={p.readReceipts} onChange={(v) => patchSection('privacy', { readReceipts: v })} />}
        />
        <Row
          icon={<Eye size={16} />}
          label={t('Last Seen')}
          desc="Who can see your last seen time"
          right={<Toggle on={p.lastSeen} onChange={(v) => patchSection('privacy', { lastSeen: v })} />}
        />
        <Row
          icon={<Wifi size={16} />}
          label={t('Online Status')}
          desc="Show when you are online"
          right={<Toggle on={p.onlineStatus} onChange={(v) => patchSection('privacy', { onlineStatus: v })} />}
        />
      </Section>
      <Section title="Security">
        <Row
          icon={<Lock size={16} />}
          label={t('Passcode Lock')}
          desc="Require a passcode to open LumoChat"
          right={<Toggle on={p.passcode} onChange={(v) => patchSection('privacy', { passcode: v })} />}
        />
        <Row
          icon={<KeyRound size={16} />}
          label={t('Two-Step Verification')}
          desc="Extra password for logging in"
          right={<Toggle on={p.twoStep} onChange={(v) => patchSection('privacy', { twoStep: v })} />}
        />
      </Section>
    </>
  );
}

function NotificationsPage() {
  const { settings, patchSection, t, notify } = useSettings();
  const n = settings.notifications;
  return (
    <>
      <Section title={t('Notifications')}>
        <Row
          icon={<BellRing size={16} />}
          label={t('Enable Notifications')}
          right={<Toggle on={n.enabled} onChange={(v) => patchSection('notifications', { enabled: v })} />}
        />
        <Row
          icon={<Eye size={16} />}
          label={t('Message Preview')}
          desc="Show message text in notifications"
          right={<Toggle on={n.preview} onChange={(v) => patchSection('notifications', { preview: v })} />}
        />
        <Row
          icon={<Mic size={16} />}
          label={t('Sound')}
          right={<Toggle on={n.sound} onChange={(v) => patchSection('notifications', { sound: v })} />}
        />
        <Row
          icon={<Smartphone size={16} />}
          label={t('Vibrate')}
          right={<Toggle on={n.vibrate} onChange={(v) => patchSection('notifications', { vibrate: v })} />}
        />
      </Section>
      <button
        onClick={() => notify('Emma — Design Team', 'this is looking great! 🎨')}
        disabled={!n.enabled}
        className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold disabled:opacity-40 shadow-lg"
        style={{ background: 'linear-gradient(90deg, var(--acc1), var(--acc2))' }}
      >
        {t('Send Test Notification')}
      </button>
    </>
  );
}

function AppearancePage() {
  const { settings, patch, t } = useSettings();
  return (
    <>
      <Section title={t('Theme')}>
        <div className="grid grid-cols-2 gap-3 p-1">
          {(
            [
              { id: 'amoled', label: t('AMOLED Black'), bg: '#000' },
              { id: 'dark', label: t('Dark'), bg: '#0d0d16' },
            ] as const
          ).map((th) => (
            <button
              key={th.id}
              onClick={() => patch({ theme: th.id })}
              className={`rounded-2xl p-3 border-2 transition-colors ${
                settings.theme === th.id ? 'border-(--acc1)' : 'border-white/10'
              }`}
              style={{ background: th.bg }}
            >
              <div className="space-y-1.5 mb-2">
                <div className="h-2 w-3/4 rounded-full bg-white/15" />
                <div
                  className="h-2 w-1/2 rounded-full ml-auto"
                  style={{ background: 'linear-gradient(90deg, var(--acc1), var(--acc2))' }}
                />
                <div className="h-2 w-2/3 rounded-full bg-white/15" />
              </div>
              <p className="text-white text-xs font-medium">{th.label}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('Accent Color')}>
        <div className="flex items-center justify-between px-4 py-4 bg-(--surface) rounded-2xl">
          {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
            <button
              key={key}
              onClick={() => patch({ accent: key })}
              className="relative w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ACCENTS[key].a}, ${ACCENTS[key].b})` }}
            >
              {settings.accent === key && (
                <motion.span
                  layoutId="accentRing"
                  className="absolute -inset-1 rounded-full border-2 border-white"
                />
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('Font Size')}>
        <div className="px-4 py-4 bg-(--surface) rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gray-500 text-xs">A</span>
            <input
              type="range"
              min={12}
              max={18}
              value={settings.fontSize}
              onChange={(e) => patch({ fontSize: Number(e.target.value) })}
              className="flex-1 accent-(--acc1)"
            />
            <span className="text-gray-300 text-lg">A</span>
          </div>
          <div
            className="ml-auto max-w-[75%] px-4 py-2.5 text-white rounded-2xl rounded-br-md"
            style={{
              background: 'linear-gradient(90deg, var(--acc1), var(--acc2))',
              fontSize: settings.fontSize,
            }}
          >
            {t('Preview')} — Love the glow effect! ✨
          </div>
        </div>
      </Section>

      <Section title={t('Bubble Style')}>
        <div className="grid grid-cols-2 gap-3 p-1">
          {(
            [
              { id: 'rounded', label: t('Rounded'), radius: '16px' },
              { id: 'extra', label: t('Extra Round'), radius: '24px' },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              onClick={() => patch({ bubbleStyle: b.id })}
              className={`rounded-2xl p-3 bg-(--surface) border-2 transition-colors ${
                settings.bubbleStyle === b.id ? 'border-(--acc1)' : 'border-white/10'
              }`}
            >
              <div
                className="h-8 w-full mb-2"
                style={{
                  borderRadius: b.radius,
                  background: 'linear-gradient(90deg, var(--acc1), var(--acc2))',
                }}
              />
              <p className="text-white text-xs font-medium">{b.label}</p>
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}

function DataPage() {
  const { settings, patch, patchSection, t, notify } = useSettings();
  const d = settings.data;
  const pct = Math.min(100, (settings.cacheMB / 2048) * 100);
  return (
    <>
      <Section title={t('Storage Used')}>
        <div className="px-4 py-4 bg-(--surface) rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-semibold">
              {settings.cacheMB >= 1024
                ? `${(settings.cacheMB / 1024).toFixed(1)} GB`
                : `${settings.cacheMB} MB`}
            </span>
            <span className="text-gray-500 text-xs">/ 2 GB</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ background: 'linear-gradient(90deg, var(--acc1), var(--acc2))' }}
            />
          </div>
          <button
            onClick={() => {
              patch({ cacheMB: 0 });
              notify('LumoChat', t('Cache cleared!'));
            }}
            disabled={settings.cacheMB === 0}
            className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Trash2 size={15} />
            {t('Clear Cache')}
          </button>
        </div>
      </Section>
      <Section title="Auto-Download">
        <Row
          icon={<Image size={16} />}
          label={t('Auto-Download Photos')}
          right={<Toggle on={d.autoPhotos} onChange={(v) => patchSection('data', { autoPhotos: v })} />}
        />
        <Row
          icon={<Mic size={16} />}
          label={t('Auto-Download Voice')}
          right={<Toggle on={d.autoVoice} onChange={(v) => patchSection('data', { autoVoice: v })} />}
        />
        <Row
          icon={<Leaf size={16} />}
          label={t('Data Saver')}
          desc="Reduce data usage on mobile networks"
          right={<Toggle on={d.dataSaver} onChange={(v) => patchSection('data', { dataSaver: v })} />}
        />
      </Section>
    </>
  );
}

function DevicesPage() {
  const { t, notify } = useSettings();
  const devices = [
    { icon: Smartphone, name: 'iPhone 15 Pro', meta: 'LumoChat iOS 1.0 • Tehran, Iran', current: true },
    { icon: Laptop, name: 'MacBook Pro', meta: 'LumoChat macOS 1.0 • 2h ago', current: false },
    { icon: Globe2, name: 'Chrome — Windows', meta: 'LumoChat Web 1.0 • Yesterday', current: false },
  ];
  return (
    <>
      <Section title={t('Devices')}>
        {devices.map((dev) => (
          <Row
            key={dev.name}
            icon={<dev.icon size={16} />}
            label={dev.name}
            desc={dev.meta}
            right={
              dev.current ? (
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
                  style={{ background: 'linear-gradient(90deg, var(--acc1), var(--acc2))' }}
                >
                  {t('Current Device')}
                </span>
              ) : (
                <span className="text-gray-600 text-xs">•</span>
              )
            }
          />
        ))}
      </Section>
      <button
        onClick={() => notify('LumoChat', 'All other sessions terminated ✅')}
        className="w-full py-3.5 rounded-2xl bg-red-500/10 text-red-400 text-sm font-semibold"
      >
        {t('Terminate All Other Sessions')}
      </button>
    </>
  );
}

function LanguagePage() {
  const { settings, patch } = useSettings();
  const langs = [
    { id: 'en', label: 'English', sub: 'English' },
    { id: 'fa', label: 'فارسی', sub: 'Persian' },
  ] as const;
  return (
    <Section>
      {langs.map((l) => (
        <button
          key={l.id}
          onClick={() => patch({ language: l.id })}
          className="w-full flex items-center gap-3 px-4 py-4 bg-(--surface) border-b border-white/5 last:border-0 text-left"
        >
          <div className="flex-1">
            <p className="text-white text-sm font-medium">{l.label}</p>
            <p className="text-gray-500 text-xs">{l.sub}</p>
          </div>
          <span
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: settings.language === l.id ? 'var(--acc1)' : '#3a3a44' }}
          >
            {settings.language === l.id && (
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--acc1)' }} />
            )}
          </span>
        </button>
      ))}
    </Section>
  );
}

function AboutPage() {
  const { t } = useSettings();
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, var(--acc1), var(--acc2))' }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <circle cx="9" cy="11.5" r="0.5" fill="white" />
          <circle cx="12" cy="11.5" r="0.5" fill="white" />
          <circle cx="15" cy="11.5" r="0.5" fill="white" />
        </svg>
      </div>
      <h2 className="text-white font-bold text-xl mb-1">LumoChat</h2>
      <p className="text-gray-500 text-sm mb-6">{t('Version')} 1.0.0</p>
      <div className="w-full rounded-2xl bg-(--surface) px-4 py-4 text-gray-400 text-sm leading-relaxed" dir="rtl">
        چت هاتو روشن کن. ✨<br />
        پیام‌رسانی سریع، امن و هوشمند با دستیار هوش مصنوعی Lumo.
      </div>
    </div>
  );
}

/* ---------- container ---------- */
export type SettingsPageKey =
  | 'account'
  | 'privacy'
  | 'notifications'
  | 'chats'
  | 'data'
  | 'devices'
  | 'appearance'
  | 'language'
  | 'about';

const TITLES: Record<SettingsPageKey, string> = {
  account: 'Account',
  privacy: 'Privacy & Security',
  notifications: 'Notifications',
  chats: 'Chats',
  data: 'Data and Storage',
  devices: 'Devices',
  appearance: 'Appearance',
  language: 'Language',
  about: 'About LumoChat',
};

export default function SettingsDetail({
  page,
  onBack,
}: {
  page: SettingsPageKey;
  onBack: () => void;
}) {
  const { t } = useSettings();
  const [key] = useState(page);
  return (
    <div className="flex flex-col h-full bg-(--bg)">
      <div className="shrink-0 safe-top pb-3 px-4 flex items-center gap-2 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-white font-bold text-lg">{t(TITLES[key])}</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {key === 'account' && <AccountPage />}
        {key === 'privacy' && <PrivacyPage />}
        {key === 'notifications' && <NotificationsPage />}
        {(key === 'chats' || key === 'appearance') && <AppearancePage />}
        {key === 'data' && <DataPage />}
        {key === 'devices' && <DevicesPage />}
        {key === 'language' && <LanguagePage />}
        {key === 'about' && <AboutPage />}
      </div>
    </div>
  );
}
