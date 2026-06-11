import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, ShieldCheck, Upload } from 'lucide-react';
import { db } from '../../db/db';
import { exportData, importData, downloadText, IMPORT_MAX_BYTES } from '../../lib/repo';
import { todayStr } from '../../lib/date';
import { isStoragePersisted, requestPersistentStorage } from '../../lib/storage';
import { getLastBackupAt, markBackedUp } from '../../lib/backupMeta';
import { Card } from '../ui';

function fmtDateTime(d: Date): string {
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
}

export function DataManager() {
  const [busy, setBusy] = useState(false);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [lastBackup, setLastBackup] = useState<Date | null>(getLastBackupAt());
  const counts = useLiveQuery(async () => ({
    workouts: await db.workouts.count(),
    meals: await db.mealLogs.count(),
    body: await db.bodyLogs.count(),
  }));

  useEffect(() => {
    void isStoragePersisted().then(setPersisted);
  }, []);

  const enablePersist = async () => {
    const ok = await requestPersistentStorage();
    setPersisted(ok);
  };

  const doExport = async () => {
    setBusy(true);
    try {
      downloadText(`kintore-backup-${todayStr()}.json`, await exportData());
      const now = Date.now();
      markBackedUp(now);
      setLastBackup(new Date(now));
    } finally {
      setBusy(false);
    }
  };

  const doImport = async (file: File) => {
    if (file.size > IMPORT_MAX_BYTES) {
      window.alert('ファイルサイズが大きすぎます（上限20MB）');
      return;
    }
    if (!window.confirm('現在のデータをすべてバックアップの内容に置き換えます。よろしいですか?')) {
      return;
    }
    const text = await file.text();
    setBusy(true);
    try {
      await importData(text);
      window.alert('インポートが完了しました');
    } catch (err) {
      window.alert(`インポートに失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const wipe = async () => {
    if (
      window.confirm(
        'すべてのデータ（記録・プロフィール・マイ食品）を完全に削除します。この操作は取り消せません。本当に削除しますか?',
      )
    ) {
      await db.delete();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-sm font-extrabold text-slate-700">記録データ</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          データはこの端末のブラウザ内にのみ保存されます。機種変更やブラウザのデータ削除に備えて、
          定期的にバックアップを書き出しておくことをおすすめします。
        </p>
        {counts && (
          <p className="mt-2 text-xs font-bold text-slate-400 tabular-nums">
            トレーニング {counts.workouts} 件 ・ 食事 {counts.meals} 件 ・ 体重 {counts.body} 件
          </p>
        )}
        <p className="mt-1 text-xs font-bold text-slate-400">
          最終バックアップ:{' '}
          <span className={lastBackup ? 'text-slate-500' : 'text-amber-500'}>
            {lastBackup ? fmtDateTime(lastBackup) : 'まだありません'}
          </span>
        </p>
        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            onClick={() => void doExport()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-40"
          >
            <Download size={16} />
            バックアップを書き出す（JSON）
          </button>
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition active:scale-[0.98]">
            <Upload size={16} />
            バックアップから復元する
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void doImport(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              persisted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'
            }`}
          >
            <ShieldCheck size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-extrabold text-slate-700">端末内ストレージの保護</h2>
            {persisted === true ? (
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                永続化が有効です。ブラウザが空き容量不足になってもデータは自動削除されません。
              </p>
            ) : (
              <>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  有効にすると、ブラウザの容量不足時にもデータが自動削除されなくなります。
                </p>
                <button
                  type="button"
                  onClick={() => void enablePersist()}
                  className="mt-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition active:scale-95"
                >
                  永続化を有効にする
                </button>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-extrabold text-rose-500">危険な操作</h2>
        <button
          type="button"
          onClick={() => void wipe()}
          className="mt-3 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-500 transition active:bg-rose-50"
        >
          すべてのデータを削除する
        </button>
      </Card>
    </div>
  );
}
