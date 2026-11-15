import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 개발 중에는 Vite(5173)가 API와 소켓 요청을 서버(기본 3000)로 넘긴다.
// 브라우저 입장에서는 항상 같은 출처라 클라이언트 코드에 서버 주소를 적지 않는다.
// E2E 테스트는 API_PORT로 다른 포트의 서버를 가리킨다.
const api = `http://127.0.0.1:${process.env.API_PORT ?? 3000}`;

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': api,
      '/socket.io': { target: api, ws: true },
    },
  },
});
