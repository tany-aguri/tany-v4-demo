# tany農園 v4 デモ（GitHub Pages用）

## 目的
設計書 v1.0 に基づき、iPhoneで操作感を確認するための公開デモです。

## 実装範囲
- Home
- 栽培
- 栽培詳細
- 収穫入力
- 足あと
- 日誌
- 図鑑
- 設定

## 安全上の前提
- 架空のデモデータのみ
- APIキーなし
- ログインなし
- クラウド保存なし
- 入力内容はブラウザ内（localStorage）だけに保存
- 端末間同期なし

## GitHub Pagesでの公開手順
1. GitHubで `tany-v4-demo` というPublic repositoryを新規作成
2. このフォルダ内のファイルをすべてリポジトリ直下へアップロード
3. `Settings` → `Pages`
4. `Build and deployment` のSourceを `Deploy from a branch`
5. Branchを `main`、Folderを `/(root)` にして `Save`
6. 数分後に表示されるURLをiPhoneのSafariで開く

## 更新時
同じファイル名で上書きアップロードします。反映されない場合は、Safariで再読み込みするか、設定画面の「デモデータを初期化」を利用してください。
