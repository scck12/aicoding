# 포켓몬 상세 데이터 모델

도감 상세에서 사용하는 **통일 타입**과 엔드포인트 매핑입니다.  
구현: `lib/pokemon/*`, `app/poke/[id]/page.tsx`

---

## 확정 타입 (TypeScript)

```ts
type PokemonDetail = {
  id: number;
  name: {
    ko: string | null;
    en: string | null;
  };
  image: {
    front: string | null;
    back: string | null;
  };
  types: {
    ko: string;
    en: string;
  }[];
  height: number; // m
  weight: number; // kg
  cry: string | null; // cries.latest 만
  stats: {
    name: string; // 한글 라벨
    baseStat: number;
  }[];
};
```

---

## 필드 ↔ 엔드포인트 매핑

| # | 필드 | 엔드포인트 | 응답 경로 | 비고 |
|---|------|------------|-----------|------|
| 1 | **ID** | `GET /pokemon/{id}` | `id` | |
| 2.1 | **이름 · 한국어** | `GET /pokemon-species/{id}` | `names` → `ko` | |
| 2.2 | **이름 · 영어** | `GET /pokemon-species/{id}` | `names` → `en` | 표시용 (`Pikachu`) |
| 3.1 | **이미지 · 앞면** | `GET /pokemon/{id}` | official-artwork → home → front_default | |
| 3.2 | **이미지 · 뒷면** | `GET /pokemon/{id}` | back_default → showdown.back | |
| 4 | **타입** | `GET /pokemon/{id}` | `types[].type.name` | 한글/영문은 **라벨 캐시** (`lib/pokemon/labels.ts`). `/type` API는 매 요청마다 호출하지 않음 |
| 5 | **키** | `GET /pokemon/{id}` | `height / 10` → **m** | |
| 6 | **몸무게** | `GET /pokemon/{id}` | `weight / 10` → **kg** | |
| 7 | **울음소리** | `GET /pokemon/{id}` | `cries.latest` 만 | |
| 8 | **stat** | `GET /pokemon/{id}` | `stats[]` | `name`은 한글 라벨 캐시 사용 (`HP`, `공격` …) |

---

## 호출 요약

필수 호출 **2개만**:

```text
GET /api/v2/pokemon/{id}
GET /api/v2/pokemon-species/{id}
```

타입·스탯 한글화는 `lib/pokemon/labels.ts` 캐시에서 조회합니다.

---

## 예시 (id = 25)

| 필드 | 값 |
|------|-----|
| id | `25` |
| name | `{ ko: "피카츄", en: "Pikachu" }` |
| types | `[{ ko: "전기", en: "Electric" }]` |
| height / weight | `0.4` m / `6` kg |
| cry | `.../latest/25.ogg` |
| stats | `[{ name: "HP", baseStat: 35 }, …]` |
