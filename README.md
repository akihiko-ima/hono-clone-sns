## プロジェクト名

Hono + AWS Lambda（Lambdalith 構成）による SNS ダミーサイト

## 概要

Hono フレームワークと AWS Lambda（Lambdalith 構成）を用いて、SNS のダミーサイトを構築するプロジェクトです。

## 技術スタック

- TypeScript
- Hono（Web フレームワーク）
- drizzle (ORM)
- AWS Lambda（Lambdalith 構成）
- AWS CDK（インフラ管理）

## セットアップ

1. リポジトリをクローン
   ```bash
   git clone https://github.com/akihiko-ima/hono-clone-sns.git
   cd hono-clone-sns
   ```
2. 依存パッケージをインストール
   ```bash
   npm install
   ```

## ローカル開発

`lambda/local.ts` を利用してローカルサーバーを起動できます。

```bash
npm run dev
```

## デプロイ方法

AWS CDK を利用してデプロイします。

```bash
cdk deploy
```

- すべて削除するコマンド

```bash
cdk destroy
```

## ディレクトリ構成

- `lambda/` : Lambda 関数のエントリポイント
- `lib/` : CDK スタック定義
- `bin/` : CDK アプリケーションエントリ
- `test/` : テストコード

## DB 関係コマンド

- Migration ファイルの作成

```bash
npx drizzle-kit generate
```

- migrage 実行

```bash
npx drizzle-kit migrate
```

- migration ファイルの削除(データベースには反映されない)

```bash
npx drizzle-kit drop
```

- drizzle studio

```bash
npx drizzle-kit studio
```

## ライセンス

MIT

## 著者

akihiko-ima
