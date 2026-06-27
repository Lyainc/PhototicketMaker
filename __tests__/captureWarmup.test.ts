import { beforeEach, describe, expect, mock, test } from 'bun:test';

// html-to-image의 toJpeg 호출 수를 세 워밍업(버리는 캡처)이 콘텐츠별로 도는지 검증한다.
// mock.module은 hoisting 안 됨 — 등록 후 require로 SUT를 가져와야 가로채진다(CLAUDE.md).
let calls: Array<{ pixelRatio: number }> = [];
mock.module('html-to-image', () => ({
  toJpeg: (_node: unknown, opts: { pixelRatio: number }) => {
    calls.push({ pixelRatio: opts.pixelRatio });
    return Promise.resolve('data:image/jpeg;base64,AAAA');
  },
}));

const { captureNodeToJpeg } = require('../src/utils/captureToImage');

// happy-dom img는 decode() 미구현이라 decodeImage가 load 이벤트를 기다리며 멎을 수 있다.
// 즉시 resolve하는 decode를 심어 캡처 로직만 격리해 검증한다.
function nodeWithPoster(src: string): HTMLElement {
  const div = document.createElement('div');
  const img = document.createElement('img');
  img.src = src;
  // happy-dom img는 complete=true·naturalWidth=0(=깨진 이미지)로 떠 decodeImage가 throw한다.
  // 정상 디코드 완료 상태로 심어 캡처 로직만 격리한다.
  Object.defineProperty(img, 'naturalWidth', { value: 100, configurable: true });
  (img as unknown as { decode: () => Promise<void> }).decode = () => Promise.resolve();
  div.appendChild(img);
  return div;
}

const OPTS = { filename: 't.jpg', width: 960, height: 1477 };

describe('#175 캡처 워밍업 — 콘텐츠(이미지 src)별로 덥힌다', () => {
  beforeEach(() => {
    calls = [];
  });

  test('새 포스터의 첫 캡처는 워밍업(ratio 1) + 본 캡처(ratio 2)', async () => {
    await captureNodeToJpeg(nodeWithPoster('blob:first'), OPTS);
    expect(calls.map((c) => c.pixelRatio)).toEqual([1, 2]);
  });

  test('같은 포스터 두 번째 캡처는 본 캡처만(이미 덥혀짐)', async () => {
    await captureNodeToJpeg(nodeWithPoster('blob:same'), OPTS); // 첫 캡처 — 덥힘
    calls = [];
    await captureNodeToJpeg(nodeWithPoster('blob:same'), OPTS); // 두 번째 — 워밍업 없어야
    expect(calls.map((c) => c.pixelRatio)).toEqual([2]);
  });

  test('포스터를 바꾸면 다시 워밍업한다 — 세션 전역 한 번이 아니다', async () => {
    await captureNodeToJpeg(nodeWithPoster('blob:before'), OPTS); // 첫 포스터 덥힘
    calls = [];
    await captureNodeToJpeg(nodeWithPoster('blob:after'), OPTS); // 교체 — 다시 콜드
    expect(calls.map((c) => c.pixelRatio)).toEqual([1, 2]);
  });

  test('이미지 없는 노드는 워밍업 없이 본 캡처만', async () => {
    await captureNodeToJpeg(document.createElement('div'), OPTS);
    expect(calls.map((c) => c.pixelRatio)).toEqual([2]);
  });
});
