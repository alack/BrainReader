import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 개발 중에는 Vite(5173)가 API와 소켓 요청을 서버(3000)로 넘긴다.
// 브라우저 입장에서는 항상 같은 출처라 클라이언트 코드에 서버 주소를 적지 않는다.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3000',
      '/socket.io': { target: 'http://127.0.0.1:3000', ws: true },
    },
  },
});
