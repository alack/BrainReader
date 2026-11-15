import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ChatMessage } from '@brainreader/shared';

// onSend는 실패하면 보여 줄 문구를, 성공하면 null을 돌려준다.
export function Chat({
  messages,
  onSend,
  placeholder = '메시지 입력',
}: {
  messages: ChatMessage[];
  onSend: (text: string) => Promise<string | null>;
  placeholder?: string;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'nearest' });
  }, [messages]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (text.trim() === '') return;
    const failure = await onSend(text);
    setError(failure);
    if (!failure) setText('');
  };

  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <div
        data-testid="chat-log"
        style={{ height: 180, overflowY: 'auto', border: '1px solid #ccc', padding: 6 }}
      >
        {messages.map((m) => (
          <div key={`${m.sentAt}-${m.userId}-${m.text}`}>
            <b>{m.username}</b> {m.text}
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <form onSubmit={submit} style={{ display: 'flex', gap: 4 }}>
        <input
          aria-label="채팅 입력"
          value={text}
          maxLength={200}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">보내기</button>
      </form>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
