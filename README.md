# ogaogamirai / public

公開用リポジトリ。GitHub で公開するツール・レポート・生成物を種類別に整理して管理する。

## フォルダ構成

| フォルダ | 用途 |
|---|---|
| `aether/` | Aether の公開用コピー（GitHub Pages から起動するための一式＋テーマ）。既存の `ogaogamirai/aether` リポジトリは正本バックアップの場として維持し、こちらは公開利用の複製 |
| `tools/` | ツール・コード・実行物（Aether 以外） |
| `reports/` | レポート・提言書（Markdown など文章） |
| `generated/` | ツールで生成された成果物（配布HTML・DSLデータなど） |

## 方針

- **既存ファイルは動かさない。** 新しく公開するものは上の種類別フォルダに追加する。
- Aether の配布物（ボードDSL・配布HTML）は `aether/themes/` に配置し、GitHub Pages から参照できる状態を保つ。
- 分類が曖昧な場合は `docs/` や README で運用を決めてから追加する。
