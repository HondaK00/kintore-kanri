import { lazy, Suspense, useState } from 'react';
import { TabBar } from './components/TabBar';
import { RestTimer } from './components/RestTimer';
import HomePage from './pages/Home';
import WorkoutPage from './pages/Workout';
import MealsPage from './pages/Meals';
import MatrixPage from './pages/Matrix';
import SettingsPage from './pages/Settings';
import { todayStr } from './lib/date';

// グラフライブラリが重いので分析画面のみ遅延読み込み
const StatsPage = lazy(() => import('./pages/Stats'));

export type Tab = 'home' | 'workout' | 'meals' | 'matrix' | 'stats';

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workoutDate, setWorkoutDate] = useState(todayStr());
  const [mealDate, setMealDate] = useState(todayStr());

  const openWorkoutAt = (date: string) => {
    setWorkoutDate(date);
    setTab('workout');
  };

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-slate-50 shadow-xl">
      <main className="px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-28">
        {tab === 'home' && (
          <HomePage onOpenSettings={() => setSettingsOpen(true)} onGoto={setTab} />
        )}
        {tab === 'workout' && <WorkoutPage date={workoutDate} onDateChange={setWorkoutDate} />}
        {tab === 'meals' && <MealsPage date={mealDate} onDateChange={setMealDate} />}
        {tab === 'matrix' && <MatrixPage onOpenDate={openWorkoutAt} />}
        {tab === 'stats' && (
          <Suspense fallback={null}>
            <StatsPage />
          </Suspense>
        )}
      </main>
      <RestTimer visible={tab === 'workout'} />
      <TabBar tab={tab} onChange={setTab} />
      {settingsOpen && <SettingsPage onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
