# Hingem — App Architecture & Implementation Notes

## Core Services
- Voice Service: Web Speech API for prototype. Production: streaming STT (Whisper/AssemblyAI) + TTS (ElevenLabs/Google).
- LLM Orchestration: Backend service to call LLMs, apply safety filters, and manage session state (implement dfgrty666 gate here).
- News Pipeline: News API ingestion with caching and source attribution.
- Maps/ETA: Mapbox/HERE/Google Maps Directions API to compute ETAs and route options.
- Sports Prediction: Microservice that ingests match data and outputs probabilistic predictions (ELO, Poisson, or ML model).
- Diary & Storage: Encrypted user diary storage (opt-in).
- Police Verification: Secure badge/document verification flow and admin panel for verification.

## Data & Storage
- User profiles (preferences)
- Conversation logs (opt-in)
- Cached news & map responses
- Analytics events

## Dev Roadmap (MVP)
1. Wire homepage voice button to STT/TTS and LLM prototype.
2. Add dfgrty666 filter in API gateway and session store.
3. Implement maps/ETA example route.
4. Add news feed and ticker.
5. Build simple sports-prediction baseline (ELO).
6. Add diary mode with local encryption.

## Assets
- logo.svg (black diamond)
- index.html (prototype front page + homepage)
- system_prompt.json (assistant configuration)
