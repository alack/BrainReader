// 임시 제시어 목록. v0.07에서 DB의 단어와 카테고리로 바꾼다.
const WORDS = ['사과', '고양이', '자전거', '우산', '비행기', '기린', '피아노', '눈사람', '선풍기', '해바라기'];

export function pickRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]!;
}
