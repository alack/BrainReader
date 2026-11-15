import { expect, test, type Page } from '@playwright/test';

// 2017년 발표에서 확인하지 못한 것: 브라우저 두 개로 로그인부터 게임 끝까지 한 판.
// 이 테스트가 통과하지 않으면 main에 병합하지 않는다.

async function signUp(page: Page, username: string) {
  await page.goto('/');
  await page.getByRole('button', { name: '회원가입' }).click();
  await page.getByLabel('아이디').fill(username);
  await page.getByLabel('비밀번호').fill('password123');
  await page.getByRole('button', { name: '가입하고 시작' }).click();
  await expect(page.getByTestId('status')).toHaveText('서버 연결됨');
}

// 캔버스에 흰색이 아닌 픽셀이 있는지 본다.
async function hasInk(page: Page) {
  return page.getByTestId('canvas').evaluate((c: HTMLCanvasElement) => {
    const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    for (let i = 0; i < data.length; i += 4) if (data[i]! < 200) return true;
    return false;
  });
}

test('두 브라우저로 로그인부터 게임 종료까지 한 판', async ({ browser }) => {
  const id = Date.now().toString(36).slice(-5);
  const [drawerName, guesserName, roomName] = [`a${id}`, `b${id}`, `판${id}`];

  // 쿠키가 섞이지 않도록 브라우저 컨텍스트를 둘로 나눈다.
  const drawer = await (await browser.newContext()).newPage();
  const guesser = await (await browser.newContext()).newPage();
  await signUp(drawer, drawerName);
  await signUp(guesser, guesserName);

  // 방 만들기 (1라운드). 만든 사람이 먼저 들어왔으므로 첫 출제자다.
  await drawer.getByRole('button', { name: '방 만들기' }).click();
  await drawer.getByLabel('방 이름', { exact: true }).fill(roomName);
  await drawer.getByLabel('라운드 수').fill('1');
  await drawer.getByRole('button', { name: '만들기', exact: true }).click();
  await expect(drawer.getByTestId('room-name')).toContainText(roomName);

  // 다른 브라우저의 방 목록에 새로고침 없이 나타나고, 입장할 수 있다.
  await guesser
    .getByTestId('room-list')
    .getByRole('listitem')
    .filter({ hasText: roomName })
    .getByRole('button', { name: '입장' })
    .click();
  await expect(drawer.getByTestId('player-list')).toContainText(guesserName);

  // 둘 다 준비하면 시작한다.
  await drawer.getByRole('button', { name: '준비', exact: true }).click();
  await guesser.getByRole('button', { name: '준비', exact: true }).click();
  await expect(drawer.getByTestId('word')).not.toHaveText('…');
  await expect(guesser.getByTestId('game-status')).toContainText(`${drawerName}님이 그리는 중`);
  await expect(guesser.getByTestId('word')).toHaveCount(0); // 정답은 출제자에게만 보인다
  const word = (await drawer.getByTestId('word').textContent())!;

  // 출제자가 그린 선이 상대 캔버스에 나타난다.
  const box = (await drawer.getByTestId('canvas').boundingBox())!;
  await drawer.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
  await drawer.mouse.down();
  await drawer.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 15 });
  await drawer.mouse.up();
  await expect.poll(() => hasInk(guesser)).toBe(true);

  // 정답을 맞히면 1라운드짜리 게임이 끝나고 양쪽에 결과가 나온다.
  await guesser.getByLabel('채팅 입력').fill(word);
  await guesser.getByLabel('채팅 입력').press('Enter');
  await expect(guesser.getByTestId('chat-log')).toContainText(`${guesserName}님이 1번째로 맞혔습니다`);
  await expect(guesser.getByTestId('ranking')).toContainText(`${guesserName} 10점`);
  await expect(drawer.getByTestId('ranking')).toContainText(`${drawerName} 2점`);
});
