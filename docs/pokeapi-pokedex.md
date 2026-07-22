# PokéAPI 도감(Pokédex) 가이드

도감 **목록**과 **상세 조회**를 만들 때 쓰면 되는 PokéAPI v2 엔드포인트만 정리한 문서입니다.  
원문: [https://pokeapi.co/docs/v2#pokemon](https://pokeapi.co/docs/v2#pokemon)

## 기본 사항

| 항목 | 내용 |
|------|------|
| Base URL | `https://pokeapi.co/api/v2` |
| 메서드 | **GET만** 지원 (조회 전용) |
| 인증 | 없음 |
| ID / 이름 | `{id or name}` — 숫자 ID 또는 영문 이름 (`bulbasaur`, `kanto` 등) |
| 페이지네이션 | `?limit=20&offset=0` (기본 limit 20) |

Fair Use: 가능하면 **로컬/서버에 캐시**하세요.

---

## 도감에서 어떤 API를 호출하면 되나?

목적에 따라 **이 3개면 충분**합니다.

| 목적 | 호출할 API | 비고 |
|------|------------|------|
| 포켓몬 **목록**(번호·이름) | `GET /pokemon?limit=&offset=` | 가장 단순한 전국 도감 목록 |
| 포켓몬 **상세**(이미지·타입·스탯) | `GET /pokemon/{id or name}` | 카드/상세 페이지 핵심 |
| **한국어 이름·도감 설명** | `GET /pokemon-species/{id or name}` | `names`, `flavor_text_entries` |
| 지역 도감(관동·호연 등) 목록 | `GET /pokedex/{id or name}` | `pokemon_entries`로 지역별 번호 |

권장 호출 흐름:

```text
[목록] GET /pokemon?limit=20&offset=0
        ↓ 항목 클릭
[상세] GET /pokemon/25
        ↓ 한국어 이름·설명이 필요하면
[부가] GET /pokemon-species/25
```

지역 도감(예: 관동)을 기준으로 만들 때:

```text
[지역 도감] GET /pokedex/kanto  → pokemon_entries (entry_number + species)
        ↓ 각 항목
[상세] GET /pokemon/{species.name} 또는 /pokemon/{id}
[부가] GET /pokemon-species/{id}     (한글명, flavor text)
```

---

## 1. 포켓몬 목록 — `Pokemon` (list)

**목록 화면**용입니다. 이름과 상세 URL만 옵니다. 이미지·타입은 **상세 API**를 한 번 더 호출해야 합니다.

```http
GET https://pokeapi.co/api/v2/pokemon?limit=20&offset=0
```

응답 예시:

```json
{
  "count": 1351,
  "next": "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
  "previous": null,
  "results": [
    {
      "name": "bulbasaur",
      "url": "https://pokeapi.co/api/v2/pokemon/1/"
    }
  ]
}
```

| 필드 | 설명 |
|------|------|
| `count` | 전체 개수 |
| `next` / `previous` | 다음·이전 페이지 URL |
| `results[].name` | 영문 이름 (조회 키로 사용 가능) |
| `results[].url` | 상세 리소스 URL |

팁: URL 끝 숫자(`.../pokemon/1/`)가 National Dex에 가까운 ID입니다. 스프라이트만 빠르게 쓰려면 상세 호출 없이  
`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png` 도 가능합니다.

---

## 2. 포켓몬 상세 — `Pokemon`

**도감 상세(전투 데이터)** 용입니다. 타입, 능력치, 이미지, 기술 등이 여기 있습니다.

```http
GET https://pokeapi.co/api/v2/pokemon/{id or name}/
```

예시:

- `GET https://pokeapi.co/api/v2/pokemon/25/`
- `GET https://pokeapi.co/api/v2/pokemon/pikachu/`

도감 UI에서 자주 쓰는 필드:

| 필드 | 용도 |
|------|------|
| `id` | 도감 번호(표시용) |
| `name` | 영문 이름 |
| `height` / `weight` | 키·몸무게 (API 단위: 0.1m / 0.1kg) |
| `types` | 타입 (`types[].type.name`) |
| `stats` | 종족값 (`stats[].stat.name`, `stats[].base_stat`) |
| `abilities` | 특성 |
| `sprites.front_default` | 기본 이미지 |
| `sprites.other["official-artwork"].front_default` | 공식 아트워크(고해상도) |
| `species.url` | Species 상세로 이어지는 URL |

---

## 3. 포켓몬 종 — `Pokemon Species` (한글·설명)

**한국어 이름**, **도감 설명문**, 전설 여부, 진화 체인 링크 등 **도감 텍스트**용입니다.

```http
GET https://pokeapi.co/api/v2/pokemon-species/{id or name}/
```

예시: `GET https://pokeapi.co/api/v2/pokemon-species/25/`

| 필드 | 용도 |
|------|------|
| `names` | 다국어 이름 → `language.name === "ko"` 항목의 `name` |
| `flavor_text_entries` | 도감 설명 → `language.name === "ko"` 필터 |
| `genera` | 분류(예: 쥐포켓몬) |
| `is_legendary` / `is_mythical` | 전설·환상 |
| `evolution_chain.url` | 진화 정보 |
| `varieties` | 폼/변형 → 각 `pokemon` URL |

한국어 이름 예시 필터:

```ts
const koreanName = species.names.find((n) => n.language.name === "ko")?.name;
```

---

## 4. 지역 도감 — `Pokedexes` (선택)

게임/지역별 도감(관동, 성도 등) **엔트리 목록**이 필요할 때 사용합니다.  
전국 번호 목록만이면 `/pokemon` 목록으로도 충분합니다.

```http
GET https://pokeapi.co/api/v2/pokedex/
GET https://pokeapi.co/api/v2/pokedex/{id or name}/
```

예시:

- 목록: `GET https://pokeapi.co/api/v2/pokedex/`
- 관동: `GET https://pokeapi.co/api/v2/pokedex/kanto/`
- 전국: `GET https://pokeapi.co/api/v2/pokedex/national/`

| 필드 | 용도 |
|------|------|
| `name` | 도감 식별자 (`kanto`, `national` …) |
| `pokemon_entries` | 도감에 등록된 종 목록 |
| `pokemon_entries[].entry_number` | 해당 도감 내 번호 |
| `pokemon_entries[].pokemon_species` | 종 이름·URL |

주의: `pokedex` 응답에는 **이미지·타입이 없습니다**.  
카드 UI를 만들려면 각 species에 대해 `/pokemon/{name}`을 추가로 호출하세요. (N+1 호출이 생기므로 **캐시·배치·페이지 단위 로딩**을 권장합니다.)

---

## 시나리오별 추천

### A. 전국 도감 목록 + 상세 (가장 흔함)

1. `GET /pokemon?limit=20&offset=0` — 목록
2. (카드 썸네일) ID로 스프라이트 URL 조합, 또는 `GET /pokemon/{id}`
3. 상세 클릭 시 `GET /pokemon/{id}` + `GET /pokemon-species/{id}`

### B. 관동 도감만

1. `GET /pokedex/kanto`
2. `pokemon_entries`로 번호·이름 렌더
3. 상세 시 `/pokemon/{name}` + `/pokemon-species/{name}`

### C. 이름 검색

- PokéAPI에는 서버측 검색 쿼리가 거의 없습니다.
- `GET /pokemon?limit=100000` 등으로 목록을 받아 **클라이언트/서버에서 필터**, 또는 이름을 알고 있으면 바로 `GET /pokemon/{name}` 호출.

---

## 최소 fetch 예시 (브라우저/Next.js)

```ts
const baseUrl = "https://pokeapi.co/api/v2";

async function getPokemonList(limit = 20, offset = 0) {
  const res = await fetch(`${baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("목록 조회 실패");
  return res.json();
}

async function getPokemonDetail(idOrName: string | number) {
  const res = await fetch(`${baseUrl}/pokemon/${idOrName}`);
  if (!res.ok) throw new Error("상세 조회 실패");
  return res.json();
}

async function getPokemonSpecies(idOrName: string | number) {
  const res = await fetch(`${baseUrl}/pokemon-species/${idOrName}`);
  if (!res.ok) throw new Error("종 정보 조회 실패");
  return res.json();
}
```

Next.js App Router에서는 Route Handler(`app/api/.../route.ts`)로 감싸 캐시·에러 처리를 두는 방식을 권장합니다.

---

## 요약

| 하고 싶은 일 | 호출 |
|--------------|------|
| 도감 **목록** | `GET /api/v2/pokemon?limit=&offset=` |
| 도감 **상세**(이미지·타입·스탯) | `GET /api/v2/pokemon/{id\|name}` |
| **한글 이름·설명** | `GET /api/v2/pokemon-species/{id\|name}` |
| **지역 도감** 엔트리 | `GET /api/v2/pokedex/{id\|name}` |

처음에는 **`/pokemon` 목록 + `/pokemon/{id}` 상세**만으로 시작하고, 한글·도감 문구가 필요해지면 **`/pokemon-species`**를 붙이시면 됩니다.
