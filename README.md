# 🧮 Math Adventure — Образователна игра по математика за деца

> **Курсов проект по ПМУ** — Тема #22: Образователна игра – математика за деца

---

## 📋 Технологичен стек

| Слой | Технология |
|------|-----------|
| **Frontend** | React Native (Expo), TypeScript |
| **Backend** | Spring Boot 4.0.3 (Java 21) |
| **Database** | PostgreSQL |
| **Auth** | JWT (jjwt 0.12.6) + Spring Security |
| **API Docs** | Swagger / SpringDoc OpenAPI |
| **Secure Storage** | expo-secure-store (мобилно) / localStorage (web) |

---

## ✅ Какво е реализирано

### Backend
- [x] **Аутентикация** — регистрация и вход с JWT токени (`AuthController`)
- [x] **Потребителски модел** — username, email, password (hashed), xp, level, activePerk (`User.java`)
- [x] **Класна стая (Classroom)** — създаване, присъединяване с код, напускане, класация в стая (`ClassroomController`, `ClassroomService`)
- [x] **Играч** — добавяне на XP, извличане на статистики, екипиране на перкове, глобална класация с пагинация (`PlayerController`, `PlayerService`)
- [x] **Сигурност** — JWT филтър, SecurityConfig, криптиране на пароли
- [x] **Swagger API** — документация на REST endpoint-ите (`OpenApiConfig`)

### Frontend
- [x] **Onboarding** — 4-слайдов карусел при първи вход (`OnboardingCarousel`, `Slide1-4`)
- [x] **Login / Register** — с валидация на полетата (`login.tsx`)
- [x] **Home Dashboard** — аватар, level карта, XP progress bar, streak брояч, rank, difficulty selector, confetti анимация при level up (`home.tsx`)
- [x] **Игра** — процедурно генерирани математически въпроси с 3 нива на трудност (Easy/Medium/Hard), 4 операции (+, -, ×, ÷), 4 отговора, XP награди (`game.tsx`)
- [x] **Перкове (Shop)** — 5 перка: Hint, Shield, Double XP, Skip, Triple XP — заключени по ниво, equip/unequip (`shop.tsx`)
- [x] **Leaderboard** — глобална класация с пагинация, медали за топ 3, маркiране на текущия играч (`leaderboard.tsx`)
- [x] **Classrooms** — създаване/присъединяване/напускане + класация в класна стая (`classrooms.tsx`, `classroom-leaderboard.tsx`)
- [x] **i18n** — двуезичен интерфейс: Български 🇧🇬 / English 🇬🇧 (`i18n/bg.ts`, `i18n/en.ts`)
- [x] **Haptic Feedback** — тактилна обратна връзка при натискане на tab навигацията (`haptic-tab.tsx`)
- [x] **Animated Level-up Overlay** — confetti + badge анимация при повишаване в ниво
- [x] **Streak System** — проследяване на поредни дни на игра (локално)

### Архитектурни качества
- [x] **OOP** — DTO records, разделени Service / Controller / Repository / Model слоеве
- [x] **REST API** — чист RESTful дизайн с `/api/v1/` namespace
- [x] **Frontend-Backend синхронизация** — XP, ниво и перкове се синхронизират с backend при връзка

---

## ❌ Какво НЕ е направено (спрямо изискванията от PDF-а)

### 🔴 КРИТИЧНО — Изисквания за кода (ПРИЛОЖЕНИЕ)

| # | Изискване | Статус | Какво трябва да се направи |
|---|-----------|--------|----------------------------|
| 1 | **Сензори / възможности на телефона** (камера, GPS, сензори, push нотификации и др.) | ❌ Липсва | Добавете поне 1-2: напр. **push notifications** (expo-notifications) за напомняне за streak, **Accelerometer** за shake-to-shuffle, **Vibration** при грешен отговор |
| 2 | **Обработка на изключения (try-catch)** | ⚠️ Частично | Backend хвърля `RuntimeException` навсякъде — трябва **GlobalExceptionHandler** с `@ControllerAdvice` и типизирани exception-и. Frontend catch блокове са празни (`catch { /* offline */ }`) |
| 3 | **Ориентация на екрана** | ❌ Липсва | Заключете ориентацията в `app.json` или добавете landscape поддръжка за game screen |
| 4 | **Интерфейс на български** | ✅ Частично | i18n е добавен, но някои placeholder-и са на английски (напр. "e.g. Math 7B"). Трябва 100% превод |

### 🟡 КРИТИЧНО — Документация (ДОКУМЕНТАЦИЯ)

| # | Глава | Статус | Какво трябва |
|---|-------|--------|--------------|
| 1 | Заглавна страница | ❌ | Имена, фак. номер, група, тема, дисциплина |
| 2 | Съдържание | ❌ | Автоматично генерирано съдържание |
| 3 | Увод | ❌ | Въведение в проблема на математическото образование при деца |
| 4 | Анализ на съществуващи разработки | ❌ | Сравни 3+ приложения (Kahoot, Duolingo Math, Photomath, Mathway) — плюсове/минуси |
| 5 | Проектиране | ❌ | ER диаграма, Workflow диаграми, UI wireframes, описание на потребителите и функционалностите |
| 6 | Реализация | ❌ | Кратки кодови фрагменти, обяснение как ER → DB, бизнес логика → код, UI → контроли |
| 7 | Потребителско ръководство | ❌ | Скрийншоти от всеки екран, описание на преходите |
| 8 | Заключение + Литература | ❌ | Готовност за употреба, номерирани източници |
| 9 | Приложение | ❌ | Важни части от кода |

### 🟡 КРИТИЧНО — Защита

| # | Елемент | Статус |
|---|---------|--------|
| 1 | **PowerPoint презентация** (5 мин.) | ❌ Не е направена |
| 2 | **Демо на приложението** (3 мин.) | ❌ Не е подготвено |
| 3 | **Подготовка за въпроси от комисия** | ❌ |

---

## 📝 Приоритизиран списък TODO

### Приоритет 1 — Блокиращи (без тях не се допуска до защита)

1. **Добавяне на сензор/телефонна възможност**
   - `expo-notifications` — дневно напомняне "Не забравяй да играеш днес!"
   - ИЛИ `expo-sensors` (Accelerometer) — shake устройството за бонус въпрос
   - ИЛИ `expo-haptics` — вибрация при right/wrong answer (вече има haptic-tab, но трябва и в game screen)

2. **Exception handling (backend)**
   - Създайте `GlobalExceptionHandler.java` с `@ControllerAdvice`
   - Заменете `RuntimeException` с типизирани exceptions (`UserNotFoundException`, `ClassroomNotFoundException`, `PerkRequirementNotMetException`)
   - Върнете подходящи HTTP status кодове (404, 409, 403)

3. **Документация** (Word / PDF, разпечатана и подвързана!)
   - Следвайте 9-те глави от изискванията
   - Включете ER диаграма, скрийншоти, кодови фрагменти

4. **PowerPoint презентация** — 5 мин., покриваща проектирането и реализацията

### Приоритет 2 — Силно препоръчително (за оценка 5-6)

5. **100% български интерфейс** — преведете оставащите английски placeholder-и и hardcoded стрингове
6. **Премахнете "Test Level Up" бутона** от home screen (ред 329 в `home.tsx`)
7. **Подобрения в UI/UX**
   - Добавете loading skeleton на home screen
   - Error states при мрежови проблеми (сега тихо fail-ва)
8. **Добавете звукови ефекти** при правилен/грешен отговор (бонус точки за "интересни новости")
9. **Screen orientation lock** — заключете в portrait, или поддръжка за landscape в игровия екран

### Приоритет 3 — Бонуси (за по-висока оценка)

10. **Състезателен елемент** — real-time classroom challenge (multiplayer)
11. **Профил страница** — история на играните сесии, графика на прогреса
12. **Таймер в играта** — countdown за допълнително предизвикателство
13. **Постижения (Achievements)** — бейджове за streak milestones, XP milestones
14. **Dark Mode** — поддръжка на тъмна тема

---

## 🏗️ Структура на проекта

```
kursov-proekt/
├── backend/                        # Spring Boot 4 (Java 21)
│   ├── src/main/java/.../
│   │   ├── controller/             # AuthController, PlayerController, ClassroomController
│   │   ├── dto/                    # Request/Response DTOs (records)
│   │   ├── model/                  # User, Classroom (JPA entities)
│   │   ├── repository/             # UserRepository, ClassroomRepository
│   │   ├── security/               # JwtUtil, JwtAuthenticationFilter, SecurityConfig
│   │   └── service/                # UserService, PlayerService, ClassroomService
│   └── pom.xml
├── frontend/                       # Expo / React Native (TypeScript)
│   ├── app/                        # Screens (Expo Router file-based routing)
│   │   ├── index.tsx               # Entry → Onboarding or Home
│   │   ├── login.tsx               # Login / Register
│   │   ├── home.tsx                # Dashboard
│   │   ├── game.tsx                # Math quiz gameplay
│   │   ├── shop.tsx                # Perk shop
│   │   ├── leaderboard.tsx         # Global leaderboard
│   │   ├── classrooms.tsx          # Classroom management
│   │   └── classroom-leaderboard.tsx
│   ├── components/                 # Reusable components
│   ├── i18n/                       # BG / EN translations
│   ├── services/auth.ts            # API client + auth + storage
│   └── package.json
└── Изисквания за КП ПМУ и ОСВОБОЖДАВАНЕ ОТ ИЗПИТ.pdf
```

---

## 🚀 Инструкции за стартиране

### Backend
```bash
cd backend
./mvnw spring-boot:run
# Изисква PostgreSQL на localhost:5432, база: mobile_app_database
```

### Frontend
```bash
cd frontend
npm install
npx expo start
# Отваря Expo DevTools → скенирай QR с Expo Go или стартирай simulator
```

---

## ⚠️ Важни забележки

- **Deadline за освобождаване от изпит:** край на 12-та учебна седмица
- **Документацията ТРЯБВА да е разпечатана и подвързана** при защита
- **JWT secret** в `application.properties` е placeholder — сменете при deploy
- **API base URL** е hardcoded като `localhost:8080` в `auth.ts` — нужна е env конфигурация за production
