# Vibe Coding Memory Engine

> Persistente Wissensschicht für PXHOpenCode — merkt sich Projekte, Architektur, Muster und Vorlieben.
> Kein Chatverlauf. Kein Gesprächsgedächtnis. Nur strukturiertes Wissen.

## Speicherkategorien

| Modul | Datei | Zweck |
|-------|-------|-------|
| Projekt | `.memory/project.json` | Framework, Sprache, Runtime, Tools |
| Architektur | `.memory/architecture.json` | Module, Services, Abhängigkeiten, Datenflüsse |
| Patterns | `.memory/patterns.json` | Coding-Conventionen, wiederkehrende Muster |
| Bugs | `.memory/bugs.json` | Gelöste Probleme mit Ursache + Lösung |
| Entscheidungen | `.memory/decisions.json` | Architekturentscheidungen + Begründung |
| Präferenzen | `.memory/preferences.json` | User-Vorlieben, Coding-Habits |
| Workflow | `.memory/workflow.json` | Wiederkehrende Arbeitsabläufe |
| Prompt | `.memory/prompt.json` | Wiederholte Anweisungen, optimierte Templates |
| Vibe | `.memory/vibe.json` | Coding-Philosophie, abgeleiteter Stil |
| Snapshots | `.memory/snapshots.json` | Kontext-Snapshots nach abgeschlossenen Tasks |
| Timeline | `.memory/timeline.json` | Chronologische Historie aller Änderungen |
| Stats | `.memory/stats.json` | Nutzungsstatistiken, Speichergröße |

## Startup-Pipeline

```
Projekt erkennen → Index laden → Task-Intent bestimmen
→ Semantische Suche → Relevante Erinnerungen abrufen
→ Kompakten Kontext injizieren → Task starten
```

## Contracts

Siehe `runtime/memory/contracts.md`

## Integration mit 4-Tier Runtime

- **T1 Interface:** Lädt Memory-Skill bei Projektstart
- **T2 Orchestration:** Fragt relevante Erinnerungen ab vor Task-Delegation
- **T3 Worker:** Aktualisiert Memory nach abgeschlossenen Tasks via Reflection
- **T4 Infrastructure:** pxh-save-history persistiert Snapshots + Timeline

## Anti-Rationalization

| Ausrede | Realität |
|---------|----------|
| "Ich merk mir das schon" | Nächste Session = wieder alles lesen |
| "Memory ist nur Chat-History" | Memory speichert Wissen, keine Konversationen |
| "Manuell pflegen reicht" | Vergisst man → Memory veraltet |

## Red Flags

- `.memory/` fehlt → wird bei nächster Session automatisch erstellt
- Memory-Index hat `confidence < 50` → Projekt noch nicht vollständig erfasst
- Bugs ohne `root_cause` → unvollständige Problemanalyse
