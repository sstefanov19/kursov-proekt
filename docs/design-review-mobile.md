# Math Adventure — Mobile Design Review

Senior mobile design pass based on live web-build walkthrough (Playwright, 390×844 viewport) + source read of `frontend/app` and `frontend/components`.

Screens captured: onboarding steps 1–4, login. Remaining screens (home, game, shop, leaderboard, classrooms) reviewed from source — auth gate blocked visual capture.

Severity: **P0** blocker · **P1** high · **P2** medium · **P3** polish.

---

## 1. Onboarding carousel

**P0 — Inconsistent step indicators across 4 slides.**
Four slides, four different treatments:
- Slide 1: row of dots + "Пропусни засега / 1/4" below CTA.
- Slide 2: tiny 40 px progress bar + "СТЪПКА 2/4".
- Slide 3: row of dots + "3/4" below CTA.
- Slide 4: row of dots + "СТЪПКА 4/4" **above** content.

Pick one pattern (recommended: dots + "Step X/Y" below the CTA on every slide) and ship it across all four.

**P0 — Slide 4 breaks the frame of slides 1–3.**
Slides 1–3 have `Header` (logo left, skip right) and a consistent vertical rhythm. Slide 4 has the logo centred, step indicator on top, and the full card on a contrasting background — feels like a different app. Restore the shared `Header` and move the progress indicator back to the bottom.

**P1 — Redundant skip on slide 1.** Top-right "Пропусни" and bottom "Пропусни засега" do the same thing. Keep the top one; remove the bottom.

**P1 — Slide 2 phone mockup looks like a wireframe.**
Tiny (140×220 px), faceless yellow answer pills, a lonely castle emoji up top. It doesn't resemble the real game screen, so the preview mis-sets expectations. Replace with a real-screen crop or a polished illustration that matches the 3D character style on slide 1.

**P1 — Slide 2 title vs. content mismatch.**
Title: "Решавай бързи предизвикателства". Content: three cards about answering questions, defending castles, earning rewards — three distinct value props. Either change the title to "Ето какво те очаква" / "How you play", or split into multiple slides.

**P0 — Slides don't use i18n.**
`components/slides/Slide1-4.tsx` have hardcoded English ("Welcome to Math Quest!", "Start journey →", "Next", "Skip for now", "1/4", "STEP 2/4") and do not import `useTranslation`. The running bundle renders Bulgarian, which means the source I'm reading has diverged from what's deployed — either two sets of slides exist, or a build artifact is stale. Single-source these through `t()`.

**P2 — Brand inconsistency.** Slide 1 source says "Math Quest"; the rest of the app (app name, header, home) says "Math Adventure". Lock the name.

**P2 — Dots below CTA are too small for touch.** 6 px dots with 8 px spacing = ~22 px hit area, well below the 44 px iOS / 48 dp Android minimum. Either make them non-interactive (pure indicator) or enlarge hit slops.

---

## 2. Home screen (`app/home.tsx`)

**P0 — Dev-only debug button shipped in production code.**
`home.tsx:329-332` — "Test level-up" button with a comment `DEV: test level-up animation — remove before release`. Remove or gate behind `__DEV__`.

**P1 — Rank is shown twice.** Nav row (🏆 `#N`) and stat badge row (🏅 "Ранг #N") render the same number. Drop one — recommend keeping the stat badge and replacing the nav tile with a different jump (e.g., "Daily goal" or "Achievements").

**P1 — Play CTA fights the Level Card for attention.**
Both use heavy blue + drop shadow. The Play button is the primary action but loses primacy when the level card is equally saturated. Make the Level Card neutral (white/light blue with muted type) so Play owns the eye.

**P1 — Language toggle + Logout live in the main scroll flow.**
These are settings, not home-screen content. Move them behind the avatar tap (profile sheet) or into a dedicated settings screen. Each row of "chrome" pushes Play below the fold.

**P2 — Character illustration pushes Play below the fold on small devices.** Character (220×220) + Level Card + Stats row + Difficulty card + Play = too much above the fold for a 390×844 viewport minus status/nav. Consider a smaller character (160×160) or float it as a background element.

**P2 — Difficulty pills show raw XP values ("5 XP / 10 XP / 20 XP").**
A 7-year-old (the target audience per slide 4) doesn't know what XP should drive their choice. Show descriptive sub-labels ("10 questions • Easy", "10 questions • Standard", "5 questions • Harder"). XP belongs on the reward screen, not the chooser.

**P3 — Inconsistent level-display formats.**
Top bar: "LVL 12 LEGEND" (uppercase, small, letter-spaced).
Level card: "Ниво 12" (sentence case, large blue).
Leaderboard rows: "Ниво 12" (body text).
Pick one canonical format.

---

## 3. Login (`app/login.tsx`)

**P1 — Register toggle changes the form silently.**
Tapping "Нямате акаунт? Регистрирайте се" adds the email field and swaps the CTA, but there's no visual state change on the toggle itself and no section title change ("Create account" vs. "Sign in"). Add a clear heading swap + change the CTA to "Регистрация".

**P2 — No password visibility toggle.** Standard for any password field. Add an eye icon.

**P2 — No forgot-password flow.** Parents provisioning accounts will lose passwords; add email-based recovery or at minimum an FAQ link.

**P3 — Single illustration (abacus emoji) is the only visual anchor.** For a brand that leads with a custom 3D character, the login screen should carry the same character to reinforce identity.

---

## 4. Shop (`app/shop.tsx`)

**P1 — Locked perks need a visible progress-to-unlock.**
Cards for perks above the user's level should show "Reach level X — Y XP to go" with a progress bar, not a grey tile. Kids are motivated by visible progress.

**P1 — Single-equip rule is implicit.**
Equipping perk B silently un-equips A (`newPerk = active === id ? null : id`). The UI must make this explicit: show a badge "Активен" on the equipped one and a subtitle on all others: "Ще замени текущото подобрение".

**P2 — Perk costs in coins are absent.** The shop is gated by level only — no economy. If that's intentional, rename to "Achievements" or "Power-ups". If coins are meant to be the gate, wire them in.

---

## 5. Leaderboard (`app/leaderboard.tsx`)

**P1 — No persistent "you" row.**
On page 2+, the user's own rank disappears off-screen. Pin a sticky row at the top or bottom with the current user's rank, level, XP.

**P2 — Medals only for top-3 on page 1.**
On any other page the list is grey `#N` rows end-to-end. Consider a coloured XP bar, a tier badge (Bronze/Silver/Gold tier based on level), or alternating row shades.

**P3 — Pagination arrows instead of infinite scroll.** Scroll is the native mobile pattern; pagination reads as web-first. Switch to `onEndReached` in FlatList.

---

## 6. Classrooms (`app/classrooms.tsx`)

**P1 — Join code shown via `Alert.alert()` on create.**
The code *is* the product — it's what the teacher shares with students. Dropping it into a disposable alert is wrong ceremony. Open a dedicated screen/bottom-sheet with: big code, Copy button, Share button (`expo-sharing`), and a QR code for quick join.

**P1 — Two separate boolean modal states (`showCreate`, `showJoin`).**
Mobile convention is a single bottom-sheet with tabs or a segmented control. Simplify.

**P2 — "Leave classroom" has no confirmation step** (based on handler structure). Destructive actions need a confirm dialog.

---

## 7. Game screen (`app/game.tsx`) — from code

**P2 — Question generator can produce ugly wrong-options.**
`randomInt(1, Math.max(5, Math.floor(answer * 0.3)))` can yield identical distance distractors, making the "wrong" options trivially ignorable for older kids. Add rules: distractors should include a common mistake (off-by-one, wrong operation).

**P2 — Haptics are gated by Platform.OS but I don't see equivalent on-screen visual feedback in the snippet.** On web, a correct answer needs a visual confetti / green flash; on native, the combo haptic+visual. Don't rely on haptics alone — some users disable them.

**P3 — Hardcoded `'Medium'` fallback** on invalid `level` param. Log it so we spot bad links in analytics.

---

## 8. Cross-cutting design system

**P0 — Design tokens don't exist.**

| Token | Violations I counted |
| --- | --- |
| Blue | `#0B47D1`, `#2B76E5`, `#2563EB`, `#3B82F6`, `#6366F1`, `#3730A3` — six shades, no semantic mapping |
| Border radius | 7, 14, 16, 20, 24, 28, 30 — normalize to sm 8 / md 16 / lg 24 / pill 999 |
| Shadows | 3+ different `{offset, opacity, radius}` combinations — define elevation sm / md / lg |
| Font size | 11, 12, 14, 15, 16, 18, 20, 22, 32, 34, 36 — collapse to 6 text styles |
| Font weight | 600, 700, 800, 900 — pick two (regular 500, bold 800) |

Build `frontend/constants/tokens.ts` (or extend the existing `constants/` folder) and refactor screens to consume it.

**P1 — Emoji as product iconography.**
🏆🛒🏫🥇🔥🏅🧮🏰⚔️❓💡🛡️⚡⏭️ all over the app. Emoji render differently across iOS/Android versions, clash with the premium 3D character illustration, and can't be tinted. Pick one direction: either commit to emoji (and accept the look), or adopt a single SVG icon set (Phosphor, Lucide, or custom).

**P1 — No dark mode.** Target audience: kids at home, including before bed. `expo-status-bar` is set, but screens hard-code light colours. Wire `useColorScheme` + a theme context.

**P2 — No explicit empty/error/offline states.**
Home stats render `—` silently when `fetchMyStats` returns null. Leaderboard has a loading spinner only. Design:
- Empty (no data yet): illustration + CTA.
- Error (network): icon + "Try again".
- Offline: top banner + cached data.

**P2 — A11y is invisible.**
No `accessibilityLabel` on icon-only `TouchableOpacity` (back arrow, difficulty pills, perk cards). No `accessibilityRole="button"`. No focus outline for web. Add a pass.

**P3 — Confetti on level-up is nice but heavy.**
40 `Animated.View` pieces, each with 2400 ms tween, no `InteractionManager` deferral. Test on a low-end Android.

---

## Prioritised task list

### P0 — fix before demo / submission
1. Remove the "Test level-up" debug button from `home.tsx`.
2. Unify onboarding step indicator across slides 1–4 (dots + "Step X/Y" below CTA).
3. Restore shared `Header` + consistent layout on slide 4.
4. Wire slides 1–4 through `useTranslation` and delete hardcoded English.
5. Lock the product name to a single value ("Math Adventure") across slides, headers, `app.json`.
6. Create design tokens file (colour, radius, shadow, type) and refactor Home + Onboarding to consume it.

### P1 — before beta
7. Remove redundant skip button on slide 1.
8. Redesign slide 2 phone mockup or split its 3 cards across slides.
9. Dedupe rank on Home (nav row vs stats row).
10. Demote Level Card visual weight so Play CTA wins the page.
11. Move language toggle + logout into a profile sheet (avatar tap).
12. Replace difficulty XP labels with descriptive sub-labels.
13. Add a clear form-title and CTA swap on the login register toggle.
14. Shop: visible progress-to-unlock on locked perks; explicit "active" / "will replace" affordance.
15. Leaderboard: sticky "you" row across pages.
16. Classrooms: dedicated share screen for join code (copy + share + QR); unify create/join into one bottom-sheet.
17. Pick a single icon strategy — replace emoji iconography across nav / stats / perks.
18. Add dark mode.

### P2 — polish
19. Smaller character illustration on Home so Play sits above the fold.
20. Password visibility toggle + forgot-password link.
21. Explicit empty / error / offline states on each fetching screen.
22. A11y pass: labels, roles, focus outlines, 44 px touch targets.
23. Question generator: smarter distractors on game screen.
24. Swap leaderboard pagination for infinite scroll.
25. Confirm step on destructive actions (leave classroom, logout).

### P3 — nice-to-have
26. Persistent login illustration (3D character) for brand continuity.
27. Defer confetti animation via `InteractionManager` on low-end devices.
28. Replace raw XP number displays with short labels where possible.
