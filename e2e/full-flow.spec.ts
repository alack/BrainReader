import { expect, test, type Page } from '@playwright/test';

// 사용자가 실제로 거치는 순서 전체를 한 번에 확인한다.
// 회원가입 → 로그아웃 → 로그인 → 대기실 → 방 설정·생성 → 두 번째 유저 가입·로그인 → 비밀번호 방 입장
// → 2라운드 게임(출제자 교대) → 게임 종료 → 방 나가기 → 로그아웃

const PASSWORD = 'password123';
const ROOM_PASSWORD = 'secret';

async function signUp(page: Page, username: string) {
  await page.goto('/');
  await page.getByRole('button', { name: '회원가입' }).click();
  await page.getByLabel('아이디').fill(username);
  await page.getByLabel('비밀번호').fill(PASSWORD);
  await page.getByRole('button', { name: '가입하고 시작' }).click();
  await expect(page.getByTestId('username')).toHaveText(username);
  await expect(page.getByTestId('status')).toHaveText('서버 연결됨');
}

async function logOut(page: Page) {
  await page.getByRole('button', { name: '로그아웃' }).click();
  await expect(page.getByLabel('아이디')).toBeVisible();
  // 세션이 서버에서도 지워졌는지: 새로고침해도 로그인 화면이어야 한다.
  await page.reload();
  await expect(page.getByLabel('아이디')).toBeVisible();
  await expect(page.getByTestId('username')).toHaveCount(0);
}

async function logIn(page: Page, username: string) {
  await page.getByLabel('아이디').fill(username);
  await page.getByLabel('비밀번호').fill(PASSWORD);
  await page.getByRole('button', { name: '로그인', exact: true }).last().click();
  await expect(page.getByTestId('username')).toHaveText(username);
  await expect(page.getByTestId('status')).toHaveText('서버 연결됨');
}

async function hasInk(page: Page) {
  return page.getByTestId('canvas').evaluate((c: HTMLCanvasElement) => {
    const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    for (let i = 0; i < data.length; i += 4) if (data[i]! < 200) return true;
    return false;
  });
}

// 출제자가 제시어를 받고, 선을 그리면 상대 캔버스에 나타나고, 상대가 맞힌다.
async function playRound(round: number, drawer: Page, guesser: Page, drawerName: string, guesserName: string) {
  await expect(drawer.getByTestId('game-status')).toContainText(`${round}/2라운드`);
  await expect(drawer.getByTestId('word')).not.toHaveText('…');
  await expect(guesser.getByTestId('game-status')).toContainText(`${drawerName}님이 그리는 중`);
  await expect(guesser.getByTestId('word')).toHaveCount(0);
  const word = (await drawer.getByTestId('word').textContent())!;

  // 새 라운드가 시작되면 캔버스는 비어 있어야 한다.
  await expect.poll(() => hasInk(guesser)).toBe(false);
  const box = (await drawer.getByTestId('canvas').boundingBox())!;
  await drawer.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3);
  await drawer.mouse.down();
  await drawer.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7, { steps: 15 });
  await drawer.mouse.up();
  await expect.poll(() => hasInk(guesser)).toBe(true);

  // 출제자는 채팅할 수 없다.
  await expect(drawer.getByLabel('채팅 입력')).toHaveAttribute('placeholder', '출제자는 채팅할 수 없습니다');

  // 틀린 답은 그냥 채팅으로 보이고, 맞힌 답은 정답 안내로 바뀐다.
  await guesser.getByLabel('채팅 입력').fill('틀린답');
  await guesser.getByLabel('채팅 입력').press('Enter');
  await expect(drawer.getByTestId('chat-log')).toContainText('틀린답');
  await guesser.getByLabel('채팅 입력').fill(word);
  await guesser.getByLabel('채팅 입력').press('Enter');
  await expect(drawer.getByTestId('chat-log')).toContainText(`${guesserName}님이 1번째로 맞혔습니다`);
}

test('회원가입부터 로그아웃까지 전체 흐름', async ({ browser }) => {
  const id = Date.now().toString(36).slice(-5);
  const [hostName, guestName, roomName] = [`a${id}`, `b${id}`, `방${id}`];
  const host = await (await browser.newContext()).newPage();
  const guest = await (await browser.newContext()).newPage();

  await test.step('첫 번째 유저: 회원가입, 로그아웃, 다시 로그인', async () => {
    await signUp(host, hostName);
    await logOut(host);
    await logIn(host, hostName);
    await expect(host.getByTestId('user-list')).toContainText(hostName);
  });

  await test.step('방 설정을 입력하고 만든다', async () => {
    await host.getByRole('button', { name: '방 만들기' }).click();
    await host.getByLabel('방 이름', { exact: true }).fill(roomName);
    await host.getByLabel('방 비밀번호 설정').fill(ROOM_PASSWORD);
    await host.getByLabel('최대 인원').fill('2');
    await host.getByLabel('라운드 수').fill('2');
    await host.getByLabel('제한 시간(초)').fill('30');
    await host.getByRole('button', { name: '만들기', exact: true }).click();
    await expect(host.getByTestId('room-name')).toContainText(`${roomName} 🔒`);
    await expect(host.getByText('2라운드 · 30초 · 최대 2명')).toBeVisible();
    await expect(host.getByTestId('game-status')).toHaveText('2명 이상 모이면 시작할 수 있습니다.');
  });

  await test.step('두 번째 유저: 회원가입, 로그아웃, 다시 로그인', async () => {
    await signUp(guest, guestName);
    await logOut(guest);
    await logIn(guest, guestName);
    await expect(guest.getByTestId('user-list')).toContainText(`${hostName} (게임방)`);
  });

  const roomItem = guest.getByTestId('room-list').getByRole('listitem').filter({ hasText: roomName });

  await test.step('비밀번호 방에 들어간다', async () => {
    await expect(roomItem).toContainText('🔒 1/2명');
    await roomItem.getByRole('button', { name: '입장' }).click();
    await roomItem.getByLabel('방 비밀번호').fill('wrong');
    await roomItem.getByRole('button', { name: '확인' }).click();
    await expect(roomItem.getByRole('alert')).toBeVisible();
    await roomItem.getByLabel('방 비밀번호').fill(ROOM_PASSWORD);
    await roomItem.getByRole('button', { name: '확인' }).click();
    await expect(guest.getByTestId('room-name')).toContainText(roomName);
    await expect(host.getByTestId('player-list')).toContainText(guestName);
    await expect(host.getByTestId('game-status')).toHaveText('모두 준비하면 시작합니다.');
  });

  await test.step('둘 다 준비하면 게임이 시작된다', async () => {
    await host.getByRole('button', { name: '준비', exact: true }).click();
    await expect(guest.getByTestId('player-list')).toContainText(`${hostName} 0점 · 준비`);
    await guest.getByRole('button', { name: '준비', exact: true }).click();
    await expect(host.getByTestId('chat-log')).toContainText('게임을 시작합니다.');
  });

  await test.step('1라운드: 방장이 그리고 두 번째 유저가 맞힌다', async () => {
    await playRound(1, host, guest, hostName, guestName);
    await expect(guest.getByTestId('answer')).toBeVisible();
  });

  await test.step('2라운드: 출제자가 바뀐다', async () => {
    await playRound(2, guest, host, guestName, hostName);
  });

  await test.step('게임이 끝나고 결과가 양쪽에 나온다', async () => {
    // 각자 한 번 맞혀 10점, 한 번 출제해 2점을 받았다.
    for (const page of [host, guest]) {
      await expect(page.getByTestId('ranking')).toContainText(`${hostName} 12점`);
      await expect(page.getByTestId('ranking')).toContainText(`${guestName} 12점`);
      await expect(page.getByRole('button', { name: '준비', exact: true })).toBeVisible();
    }
  });

  await test.step('방에서 나가면 대기실로 돌아가고, 빈 방은 사라진다', async () => {
    await host.getByRole('button', { name: '나가기' }).click();
    await expect(host.getByRole('heading', { name: '방 목록' })).toBeVisible();
    await expect(guest.getByTestId('player-list')).not.toContainText(hostName);
    await guest.getByRole('button', { name: '나가기' }).click();
    await expect(guest.getByRole('heading', { name: '방 목록' })).toBeVisible();
    await expect(host.getByTestId('room-list')).not.toContainText(roomName);
    await expect(host.getByTestId('user-list')).toContainText(guestName);
  });

  await test.step('로그아웃하면 다른 사람의 접속자 목록에서 빠진다', async () => {
    await logOut(host);
    await expect(guest.getByTestId('user-list')).not.toContainText(hostName);
    await logOut(guest);
  });
});
