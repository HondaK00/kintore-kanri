import { isNative } from './bridge';

/**
 * テキストファイルを保存/共有する。
 * Web: ブラウザのダウンロード。
 * ネイティブ: ファイルに書き出して共有シート（ファイルApp/Drive/メール等へ保存）。
 *   ※ WKWebViewではaタグのdownloadが効かないため、ネイティブでは必須の経路。
 */
export async function saveTextFile(
  filename: string,
  text: string,
  mime = 'application/json',
): Promise<void> {
  if (!isNative()) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');
  const res = await Filesystem.writeFile({
    path: filename,
    data: text,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  await Share.share({ title: filename, url: res.uri, dialogTitle: 'バックアップを保存' });
}
