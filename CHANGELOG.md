# 변경 기록

## 0.10.5 — 2026-09-06

- Color부터 Upload까지 컴포넌트·타입·Storybook 문서 개선을 반영했습니다.
- Modal/Drawer의 native ESM SSR 호환성과 Escape 옵션에 독립적인 포커스 순환을 수정했습니다.
- DatePicker/RangePicker의 preset 날짜 제한, DatePicker/TimePicker의 비활성 시간 확정 방지를 추가했습니다.
- Message/Notification/Modal의 초기 정적 호출 취소 대기열을 수정했습니다.
- 인라인 validator 재렌더링 시 오류 표시 유지와 RGB/HSB/alpha 범위 검사를 보완했습니다.
- 4/8자리 HEX의 자동 글자 대비, React 18 Upload disabled, Tabs 복사 예시 타입을 수정했습니다.
- README를 현재 public API에 맞췄고, 문서의 localhost 링크를 상대 경로로 바꿨습니다.
- 전체 테스트 1,289개, 배포 산출물 예시 테스트 312개 및 ESM/CJS SSR 검증을 통과했습니다.

날짜·시간 제한을 우회하던 선택과 범위 밖 색상 입력은 더 이상 확정되지 않습니다. API 삭제 없이 잘못된 동작을 바로잡았습니다. 예시 앱이 직접 사용하는 Tailwind 유틸리티는 소비자 앱에서 생성해야 합니다.
