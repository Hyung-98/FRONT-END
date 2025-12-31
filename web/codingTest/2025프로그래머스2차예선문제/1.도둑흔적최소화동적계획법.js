// Gemini 문제 풀이법
function solution(info, n, m) {
  // dp[j]는 B의 누적 흔적이 j일 때, A의 누적 흔적의 최솟값
  // m 이상의 흔적은 고려할 필요 없으므로 크기를 m으로 설정
  let dp = new Array(m).fill(Infinity);

  // 초기값: 물건을 하나도 안 훔쳤을 때 B의 흔적은 0, A의 흔적도 0
  dp[0] = 0;

  for (const [costA, costB] of info) {
    // 이전 단계의 DP 값을 보존하기 위해 복사본 생성 (또는 뒤에서부터 계산)
    const nextDp = new Array(m).fill(Infinity);

    for (let bTrace = 0; bTrace < m; bTrace++) {
      if (dp[bTrace] === Infinity) continue;

      // 1. 현재 물건을 A가 훔치는 경우
      // B의 흔적(bTrace)은 그대로, A의 흔적만 증가
      if (dp[bTrace] + costA < n) {
        nextDp[bTrace] = Math.min(nextDp[bTrace], dp[bTrace] + costA);
      }

      // 2. 현재 물건을 B가 훔치는 경우
      // B의 흔적이 증가하며, m 미만이어야 함
      if (bTrace + costB < m) {
        nextDp[bTrace + costB] = Math.min(nextDp[bTrace + costB], dp[bTrace]);
      }
    }
    dp = nextDp;
  }

  // 최종 결과: dp 배열에 저장된 A의 흔적 중 최솟값 찾기
  const answer = Math.min(...dp);

  return answer === Infinity ? -1 : answer;
}

console.log(
  solution(
    [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    10,
    5
  )
);
