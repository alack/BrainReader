import { defineConfig } from '@playwright/test';

// 개발용 서버(3000, 5173)와 겹치지 않는 포트에 테스트 전용 서버를 띄운다.
// DB는 메모리라 실행할 때마다 비어 있다.
const API_PORT = 3100;
const WEB_PORT = 5180;

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    channel: 'chrome', // 이 PC에 설치된 Chrome을 쓴다. 브라우저를 따로 내려받지 않는다.
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run start -w @brainreader/server',
      url: `http://127.0.0.1:${API_PORT}/api/health`,
      env: { PORT: String(API_PORT), DATABASE_PATH: ':memory:' },
      reuseExistingServer: false,
    },
    {
      command: `npm run dev -w @brainreader/web -- --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      env: { API_PORT: String(API_PORT) },
      reuseExistingServer: false,
    },
  ],
});
