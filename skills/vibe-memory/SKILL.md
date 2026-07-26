---
name: vibe-memory
description: Vibe Coding Memory Engine — persistence Wissensschicht für Projekte, Architektur, Muster, Bugs und Präferenzen. Automatisch lernend, kein Chat-Verlauf.
---

# Vibe Coding Memory Engine

Lädt `runtime/memory/README.md` für die vollständige Dokumentation.
Lädt `runtime/memory/contracts.md` für die Memory-Contracts.

## Startup (jede neue Session)

```
1. Prüfe ob .memory/ existiert
   - Ja → Index laden, relevantes Wissen abrufen
   - Nein → .memory/ anlegen aus `runtime/memory/init.json`, Projekt-Scan starten
2. Bestimme Task-Intent aus dem Prompt
3. Semantische Suche: Top-K relevante Erinnerungen
4. Injektion: kompakter Kontext (kein Voll-Load)
5. Task ausführen
6. Reflection: Was wurde gelernt? Memory aktualisieren
```

**.memory/ wird am workspace root (parent von .opencode/) auto-erstellt — nicht in .opencode/ selbst.**
**Nicht in git committed — jede Umgebung hat eigene frische Memory.**

## API (als interne Anweisungen)

| Befehl | Beschreibung |
|--------|-------------|
| `memory:query <intent> <target>` | Semantische Suche, gibt Top-K Erinnerungen |
| `memory:get <category>` | Komplette Kategorie laden |
| `memory:update <category> <data>` | Bestimmte Kategorie aktualisieren |
| `memory:snapshot` | Kontext-Snapshot speichern |
| `memory:reflect` | Reflection-Ausführung für abgeschlossenen Task |
| `memory:invalidate <category> <key>` | Veraltete Erinnerung markieren |

## Memory-Kategorien (Kurzreferenz)

| Kategorie | Wann laden | Wann schreiben |
|-----------|-----------|----------------|
| project | Immer (leicht) | Wenn neue Tools/Patterns erkannt |
| architecture | Bei Architektur-Tasks | Nach Modul-Änderungen |
| patterns | Beim Coding | Nach neuem Pattern |
| bugs | Bei Bug-Tasks | Nach Bug-Fix |
| decisions | Bei Design-Entscheidungen | Nach Entscheidung |
| preferences | Immer (leicht) | Nach Präferenz-Änderung |
| workflow | Bei wiederholten Abläufen | Nach optimiertem Workflow |
| prompt | Bei wiederholten Prompts | Nach verbessertem Template |
| vibe | Bei Projektstart | Nach Stil-Erkennung |
| snapshots | Nach Task | Nach jedem abgeschlossenen Task |

## Token-Optimierung

- **Nur Top-K laden** — nie alle Kategorien
- **Inkrementelle Updates** — nie komplette Memory überschreiben
- **Konfidenz-Filter** — nur Erinnerungen mit confidence >= 60 verwenden
- **Snapshots kompakt** — < 500 Bytes pro Snapshot

## Anti-Rationalization

| Ausrede | Realität |
|---------|----------|
| "Memory brauch ich nicht" | Jede Session = Projekt neu erkunden |
| "Alles auf einmal laden" | Token-Explosion, langsamer Start |
| "Hab keinen Bug gefixt" | Nächster Bug = gleicher Fehler nochmal |

## Red Flags

- Memory-Index nicht geladen → Projekt-Detection fehlgeschlagen
- Keine Reflection nach Task → Memory lernt nicht
- Confidence stagniert → Memory wird nicht aktualisiert
- `.memory/` fehlt nach Session → Storage-Problem

## Verification

- [ ] `.memory/index.json` existiert und ist gültiges JSON
- [ ] Memory-Index wird vor jeder Task-Ausführung geladen
- [ ] Reflection wird nach jedem abgeschlossenen Task ausgeführt
- [ ] Nur Top-K relevante Erinnerungen werden injiziert
- [ ] Keine Chat-Verläufe in `.memory/` gespeichert
