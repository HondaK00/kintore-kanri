import { useState } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Database,
  Dumbbell,
  NotebookText,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { ProfileForm } from '../components/settings/ProfileForm';
import { RoutineManager } from '../components/settings/RoutineManager';
import { WeeklySchedule } from '../components/settings/WeeklySchedule';
import { ReminderSettings } from '../components/settings/ReminderSettings';
import { ExerciseManager } from '../components/settings/ExerciseManager';
import { FoodManager } from '../components/settings/FoodManager';
import { DataManager } from '../components/settings/DataManager';

type View = 'menu' | 'profile' | 'routines' | 'weekly' | 'reminder' | 'exercises' | 'foods' | 'data';

const TITLES: Record<View, string> = {
  menu: '設定',
  profile: 'プロフィール・目標',
  routines: 'ルーティン管理',
  weekly: '週間スケジュール',
  reminder: 'リマインダー',
  exercises: '種目管理',
  foods: 'マイ食品管理',
  data: 'データ管理',
};

const MENU: { view: View; label: string; desc: string; Icon: typeof User }[] = [
  { view: 'profile', label: 'プロフィール・目標', desc: '基礎代謝の計算と目標設定', Icon: User },
  { view: 'routines', label: 'ルーティン管理', desc: '「胸の日」などの種目セット', Icon: NotebookText },
  { view: 'weekly', label: '週間スケジュール', desc: '曜日ごとに行うメニューを設定', Icon: CalendarDays },
  { view: 'reminder', label: 'リマインダー', desc: '毎日決まった時間に通知', Icon: Bell },
  { view: 'exercises', label: '種目管理', desc: 'トレーニング種目の追加・削除', Icon: Dumbbell },
  { view: 'foods', label: 'マイ食品管理', desc: 'よく食べる食品の編集', Icon: UtensilsCrossed },
  { view: 'data', label: 'データ管理', desc: 'バックアップ・復元', Icon: Database },
];

export default function SettingsPage({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>('menu');

  return (
    <div className="fixed inset-0 z-40 mx-auto max-w-md overflow-y-auto bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center gap-1 border-b border-slate-200/70 bg-slate-50/95 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 backdrop-blur-md">
        <button
          type="button"
          onClick={view === 'menu' ? onClose : () => setView('menu')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition active:bg-slate-200"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight">{TITLES[view]}</h1>
      </header>

      <div className="px-4 py-4 pb-24">
        {view === 'menu' && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="divide-y divide-slate-50">
              {MENU.map(({ view: v, label, desc, Icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-slate-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon size={18} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{label}</span>
                    <span className="text-xs text-slate-400">{desc}</span>
                  </span>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        )}
        {view === 'profile' && <ProfileForm />}
        {view === 'routines' && <RoutineManager />}
        {view === 'weekly' && <WeeklySchedule />}
        {view === 'reminder' && <ReminderSettings />}
        {view === 'exercises' && <ExerciseManager />}
        {view === 'foods' && <FoodManager />}
        {view === 'data' && <DataManager />}
      </div>
    </div>
  );
}
