# MathSainsDLP — MEMORY

## What this is
Educational web project repository.

## Decisions
2026-08-19 — Replace the original Git history with one fresh root commit and exclude PDFs from version control — requested to keep local PDF files while untracking them before publishing.
2026-08-20 — Deploy as standalone client-side SPA on Firebase Hosting (project `iwanzatilovejourney`) with LocalStorage persistence and static JSON question banks, keeping local Express server optional for dev.
2026-08-21 — Randomized MCQ options using Fisher-Yates shuffle, implemented weighted question sampling (50% MCQ, 25% True/False, 25% Numeric/Matching), and revamped mobile layout with hybrid tap-to-match and dual keypad input.

2026-08-21 — Expanded Sains DLP question bank and topic registry from 9 units to all 13 official units matching Buku Teks Sains Tahun 6 (KSSR Semakan DLP).

## Log
2026-08-19 — Repository history reset and PDFs removed from Git tracking.
2026-08-20 — Ported scoring/quiz logic to client data service, configured `.firebaserc` / `firebase.json`, and successfully deployed to Firebase Hosting (`https://iwanzatilovejourney.web.app`).
2026-08-21 — Resolved MCQ Option A bias bug, balanced question types across quizzes, improved mobile touch responsiveness, and redeployed to Firebase Hosting.
2026-08-21 — Expanded Sains DLP to 13 units (130 questions total) matching the AnyFlip textbook, updated data service registry, and deployed live to Firebase Hosting.
2026-08-21 — Created comprehensive, layman-friendly README.md with syllabus overview, local testing steps, and Firebase publishing guide.
