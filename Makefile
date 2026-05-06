.PHONY: check lint type-check test dev dev-server dev-web install clean

# push前チェック（これだけ覚えればOK）
check: lint type-check test
	@echo ""
	@echo "  OK - pushして大丈夫だよ"
	@echo ""

# 依存インストール
install:
	pnpm install

# lint
lint:
	pnpm -r run lint

# 型チェック
type-check:
	pnpm -r run type-check

# テスト
test:
	pnpm -r run test

# 開発サーバー同時起動
dev:
	@echo "Starting server + web..."
	@pnpm --filter @kakurenbo/server run dev & \
	 pnpm --filter @kakurenbo/web run dev & \
	 wait

# 個別起動
dev-server:
	pnpm --filter @kakurenbo/server run dev

dev-web:
	pnpm --filter @kakurenbo/web run dev

# クリーン
clean:
	rm -rf node_modules packages/*/node_modules
	rm -rf packages/web/.next
