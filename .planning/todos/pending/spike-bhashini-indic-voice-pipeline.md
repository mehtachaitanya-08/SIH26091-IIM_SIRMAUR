---
title: Spike - Bhashini / Indic Voice Pipeline Feasibility
date: 2026-11-06
priority: high
tags: [spike, voice, bhashini, aipipeline, indic-nlp]
---

# Spike: Bhashini / Indic Voice Pipeline Feasibility

## Objective
Benchmark and validate an end-to-end voice processing pipeline for rural Indian languages (starting with Hindi, Marathi, and Tamil) suitable for low-latency WhatsApp audio notes and PWA voice recording.

## Key Exploration Tasks
1. **ASR (Speech-to-Text):**
   - Test Bhashini ULCA ASR API vs. OpenAI Whisper Large-v3-Turbo / IndicConformer.
   - Measure word error rate (WER) on colloquial rural terms (e.g., "khata", "byaj", "kist", "mandi").
2. **TTS (Text-to-Speech):**
   - Test Bhashini TTS vs. Sarvam AI / Google Indic TTS for natural human-like dialect cadence.
3. **Audio Transcoding:**
   - Verify server-side handling of WhatsApp `.ogg` / Opus voice notes and conversion to 16kHz WAV.
4. **Latency Budget:**
   - Ensure round-trip latency (Audio in -> STT -> Agent Logic -> TTS -> Audio out) stays under 4.0 seconds.

