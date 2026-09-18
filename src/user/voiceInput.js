/* ==================================================================
 * 음성 입력 (Web Speech API)
 *
 * 현장은 장갑·소음 환경이라 타이핑이 어렵다. 음성이 사실상 유일한 실용 입력이다.
 *
 * ⚠️ 실서비스 대체 지점: 브라우저 내장 인식기는 엔진에 따라 음성이 외부로
 *    전송될 수 있다(Chrome 등). 망분리 공장에서는 온프레미스 STT(Whisper 등)로
 *    교체해야 하며, UI는 그대로 두고 이 모듈의 start()만 바꾸면 된다.
 *    그래서 인식 결과를 곧바로 전송하지 않고 입력창에 채워 검토받는다 —
 *    소음 환경 오인식을 사람이 걸러내는 단계이기도 하다.
 * ================================================================== */

export function isVoiceSupported() {
  return typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * 음성 인식을 시작한다.
 * @param {(text:string, isFinal:boolean)=>void} onResult 중간·최종 결과 (중간도 흘려보내 반응성 확보)
 * @param {(reason:string)=>void} onEnd  종료·오류 사유
 * @returns {{stop:()=>void}|null}
 */
export function startVoice(onResult, onEnd) {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = "ko-KR";
  rec.continuous = true;      // 현장 발화는 끊기기 쉬워 한 문장에서 끝내지 않는다
  rec.interimResults = true;  // 말하는 도중에도 화면에 보여야 사용자가 신뢰한다

  let finalText = "";
  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t;
      else interim += t;
    }
    onResult?.((finalText + interim).trim(), !interim);
  };
  rec.onerror = (e) => {
    const reason = e.error === "not-allowed" ? "마이크 권한이 거부되었습니다."
      : e.error === "no-speech" ? "음성이 감지되지 않았습니다."
      : e.error === "audio-capture" ? "마이크를 찾을 수 없습니다."
      : `음성 인식 오류 (${e.error})`;
    onEnd?.(reason);
  };
  rec.onend = () => onEnd?.(null);

  try { rec.start(); } catch { onEnd?.("음성 인식을 시작하지 못했습니다."); return null; }
  return { stop: () => { try { rec.stop(); } catch { /* 이미 종료 */ } } };
}
