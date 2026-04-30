# Оставаща работа — КП ПМУ (Math Adventure)

Планът по-долу включва **само незавършената работа** според текущото състояние на repository-то.

Източник: `Изисквания за КП ПМУ и ОСВОБОЖДАВАНЕ ОТ ИЗПИТ.pdf` + проверка на текущия код и документация.

---

## P1 — Оставащи блокиращи задачи

### 1. Финализиране на документацията
- `docs/kp-report.md` е почти готова чернова, но още има placeholder-и от типа `[Попълнете]`.
- Трябва да се подготви финален Word/PDF вариант с реални данни:
1. Заглавна страница
2. Съдържание
3. Увод
4. Анализ на съществуващи разработки
5. Проектиране
6. Реализация
7. Потребителско ръководство
8. Заключение + литература
9. Приложение
- Screenshots вече са подготвени частично, но трябва да бъдат подредени и включени във финалния документ.

### 2. PowerPoint презентация + демо
- Няма готова презентация за защита.
- Няма подготвен demo flow / backup видео.
- Трябва да се подготвят:
1. 5-минутна презентация
2. 3-минутно демо
3. Кратка репетиция на сценария за защита

---

## P2 — Оставаща техническа работа

### 3. Hardening на конфигурацията
- В `frontend/services/auth.ts` API адресите са hardcoded към `http://localhost:8080`.
- В `backend/src/main/resources/application.properties` DB credentials и JWT secret са вкарани директно във файла.
- Трябва:
1. frontend base URL да мине през env/app config
2. backend secret-и и DB credentials да минат през environment variables

### 4. Backend тестове
- Има test coverage за exception handler-а, но липсват service unit tests.
- `BackendApplicationTests` в момента зависи от реална PostgreSQL връзка и `./mvnw test` не минава в изолирана среда.
- Трябва:
1. да се стабилизира `@SpringBootTest` конфигурацията за тестове
2. да се добавят поне 2-3 смислени service/unit теста
3. `./mvnw test` да минава без външна DB зависимост

### 5. Логване и error handling cleanup
- В frontend има много празни/тихи `catch` блокове в `frontend/services/auth.ts` и `frontend/services/notifications.ts`.
- В backend липсва реално service-level логване със SLF4J.
- Трябва:
1. silent catches да бъдат заменени с логване или user-visible error handling
2. да се добавят SLF4J логове в backend services

---

## P3 — Незавършени бонуси

- Dockerfile + `docker-compose.yml` (backend + Postgres)
- Flyway/Liquibase миграции вместо `ddl-auto`
- CI (GitHub Actions) — build + test
- Pagination + search в leaderboard UI
- Offline queue за XP submissions
- Accessibility: `accessibilityLabel`, контраст, button roles

---

## Препоръчителен ред за довършване

1. Env/config hardening
2. Backend тестове и стабилизиране на `./mvnw test`
3. Логване и cleanup на silent catches
4. Финализиране на Word/PDF документацията със screenshots
5. PowerPoint + demo сценарий

**Deadline:** край на 12-та учебна седмица за освобождаване от изпит.
