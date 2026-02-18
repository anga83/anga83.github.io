# Projektdokumentation – Projektstundenerfassung (Tool)

## 1. Beschreibung der Web-App

Die Web-App ist ein browserbasiertes Tool zur Erfassung von Projektstunden. Sie bildet den typischen Tagesablauf der Zeiterfassung ab: Tag auswählen, Ort und Kostenträger wählen, Stunden buchen, Kommentare ergänzen und Einträge prüfen. Das Tool unterstützt abteilungsbasierte Regeln und sorgt so für eine fachlich geführte Erfassung direkt bei der Eingabe.

Das Tool ist datengetrieben über Masterdaten und Regelwerk aufgebaut und auf konsistente, plausible Erfassung ausgelegt. Hinweise, Warnungen und Blocker greifen direkt bei der Eingabe ein, um Fehlbuchungen frühzeitig zu vermeiden. Die Zielarchitektur sieht einen Betrieb im Unternehmensumfeld vor.


---

## 2. Vollständige Feature-Liste

### 2.1 Haupt-Features

- **Tagesbezogene Stundenbuchung**
  - Auswahl von Ort und zugehörigem Kostenträger.
  - Eingabe von Stunden (Ganzzahl/Dezimal, Komma oder Punkt).
  - Optionaler oder verpflichtender Kommentar (regelgesteuert).
  - Anlegen, Bearbeiten und Löschen von Einträgen.

- **Regel-Engine mit Compliance-Logik**
  - Regelprüfung auf Basis von Abteilung, Kostenträger-Kategorie und Projekt-Whitelist.
  - Drei Schweregrade: Info, Warning, Error.
  - Verhalten pro Regel: Hinweis anzeigen, Kommentar erzwingen, Buchung blockieren.
  - Regeltexte mit HTML-Hervorhebung aus der Konfigurationsdatei.

- **Kalender mit Monatsnavigation (42-Zellen-Grid)**
  - Monatswechsel, Sprung auf „Heute“, Tagesauswahl.
  - Statusdarstellung je Tag (Buchung vorhanden / keine Buchung / freier Tag).
  - Kontextaktion auf Kalendertag: manuell als freier Tag markieren.
  - Tages-Popover mit Aggregation (Summe + Aufteilung nach Ort + Sollstundenbezug).

- **Daily Log und Tagessummen**
  - Auflistung aller Einträge des gewählten Tags.
  - Inline-Hinweise je Eintrag (advisories aus Regelwerk).
  - Sichtbare Tages- und Monatssumme.

- **Qualitäts- und Vollständigkeitsanzeige**
  - Arbeitsplan hinterlegbar (z. B. 9/9/9/9 oder 8/8/8/8/6/0/0).
  - Soll-/Ist-Abdeckung (Buchungsgüte in %).
  - Vollständigkeitsstatus mit Ampellogik (grün/gelb/rot/neutral).
  - Berücksichtigung manueller freier Tage.

- **Reporting & Export**
  - Zeitraumsauswahl (Monat von/bis).
  - Pivot-Vorschau: Ort → Kostenträger mit Summen.
  - Export als CSV und XLSX.
  - XLSX mit mehreren Blättern (Pivot, Buchungsgüte, Daten).

### 2.2 Erweiterte Arbeitsfeatures

- **Favoriten-System**
  - Speichern der aktuellen Kombination aus Ort + Kostenträger.
  - Favoriten-Name wird automatisch aus Kostenträger abgeleitet.
  - Schnellfavoriten direkt im Formular.
  - Verwalten im Popover (anwenden/löschen).

- **Favoriten-Anpassung**
  - Reihung (nach oben/unten) mit Persistenz.
  - Farbzuweisung und Icon-Auswahl je Favorit.
  - Übernahme der Reihenfolge in der UI und den gespeicherten Einstellungen.

- **Favoriten-Vorschläge**
  - Top-3 Vorschläge aus häufigen, noch nicht favorisierten Kombinationen.
  - Vorschläge inkl. Häufigkeit und Direkt-Übernahme.

- **Duplikatbehandlung bei Buchungen**
  - Erkennung identischer Buchungsschlüssel (Tag + Ort + Kostenträger).
  - Entscheidungsdialog: „kombinieren“ oder „verwerfen“.
  - Beim Kombinieren: Stunden addieren, Kommentare intelligent zusammenführen.

### 2.3 Quality-of-Life-Features

- **Stunden-Quick-Chips**
  - Basis-Chips: 1 h, 2 h, 3 h.
  - Ergänzende dynamische Chips aus häufigen historischen Stundenwerten.
  - Tooltip auf dynamischen Chips: „Basierend auf deinen bisherigen Buchungen“.

- **Kommentar-Vorschläge (Smart Suggestions)**
  - Vorschläge aus historischen Kommentaren.
  - Priorisierung von Kommentaren mit gleichem Kostenträger.
  - Frequenz- und Recency-gewichtete Sortierung.

- **Vortag kopieren**
  - Übernahme aller Einträge des Vortags auf den ausgewählten Tag.

- **Undo für Löschvorgang**
  - Toast mit Zeitfenster für Rückgängig-Funktion.

- **Dark Mode / Theme-Switch**
  - Umschaltbar per Floating-Switch.
  - Persistenz im Browser (Theme wird wiederhergestellt).

- **Profil-/Einstellungsbereich**
  - Export/Import von Einstellungen (Favoriten, Arbeitsplan, freie Tage, Theme).

- **Debug-/Mockup-Utilities**
  - Zufälliges Befüllen realistischer Testdaten.
  - Export/Import der Stundenliste als JSON.
  - Komplettes Bereinigen des mockup-spezifischen Local Storage.

- **Usability- und Accessibility-Bausteine**
  - Tastaturbedienbare Popover-Trigger.
  - Aria-Labels und Live-Regionen an zentralen Stellen.
  - Kontextsensitive Leermeldungen statt leerer Tabellen/Listen.


---

## 3. Gesamtblick: Vorteil gegenüber Excel pro Mitarbeiter + SharePoint + VBA-Aggregation

Im Zielbild profitieren sowohl Fachbereiche als auch Controlling von einer durchgängigen, regelgestützten Erfassung. Mitarbeitende buchen schneller und fachlich sauberer, während das Controlling deutlich weniger Zeit in spätere Plausibilisierung, Rückfragen und Korrekturschleifen investieren muss.

### Vergleich: klassischer Excel-/SharePoint-Prozess vs. Web-App

- **Heute (Excel je Mitarbeiter auf SharePoint)**
  - Jeder pflegt eine eigene Datei in eigenem Format-/Qualitätsniveau.
  - Plausibilitätsregeln werden oft erst spät oder zentral beim Controlling sichtbar.
  - Fehlerkorrektur erfolgt im Nachgang, häufig iterativ zwischen Fachbereich und Controlling.
  - VBA-Aggregation ist fehleranfällig bei Strukturabweichungen und aufwändig in Wartung.

- **Mit dieser Web-App**
  - Einheitliche Erfassungsmaske und zentrale Eingabelogik für alle Buchungen.
  - Regeln greifen **sofort bei Eingabe** (Hinweis/Warnung/Blocker).
  - Kritische Fehlbuchungen werden direkt verhindert (Blocker), statt später herausgefiltert.
  - Kommentare werden dort verpflichtend, wo fachlich notwendig.
  - Favoriten, Quick-Chips und Vorschläge beschleunigen den Alltag.
  - Lokale Exportfunktionen (CSV/XLSX) bieten dem Nutzer einen zusätzlichen persönlichen Überblick; das eigentliche periodische Reporting kann serverseitig durch das Controlling erfolgen.

### Praktischer Mehrwert

- **Für Mitarbeiter**: weniger Such- und Tipparbeit, weniger Unsicherheit, schnellere Buchung.
- **Für Teamleitungen**: einheitlichere Datenqualität und bessere Transparenz auf Monatsebene.
- **Für Controlling**: deutlich weniger Aggregations- und Plausibilisierungsaufwand, da Validierung in den Erfassungsprozess vorgezogen wird und Rückfragen an Mitarbeitende reduziert werden.

Kernaussage: Die App verschiebt Qualitätssicherung von „später, zentral, teuer“ zu „sofort, dezentral, eingebaut“.


---

## 4. Technischer Aufbau

### 4.1 Architektur und Technologie-Stack

- **Frontend-only Mockup (kein Backend)**
- **Technologien**:
  - HTML5
  - CSS3
  - Vanilla JavaScript (ohne Framework)
  - Lokale Catalyst-UI-Layer (`assets/css/catalyst-ui-kit.css`) als komponentenbasierte Design-Schicht auf dem bestehenden UX-Flow
- **Zusatzbibliotheken (lokal eingebunden)**:
  - SheetJS/XLSX (`assets/xlsx.full.min.js`) für Excel-Export
  - Font Awesome 7.2.0 (`assets/fontawesome/...`) für Icons

### 4.2 Datenquellen und Datenfluss (Mockup-Stand)

- **Masterdaten**: `data/masterdata.csv`
  - Erwartetes Format: `Nummer;Ort;Kostenträger;Kategorie`
  - Wird clientseitig geparst und in eine Standort-Kostenträger-Struktur überführt.

- **Regelwerk**: `data/rules.json`
  - Enthält Triggerbedingungen, Schweregrade, Kommentarpflicht, Blocker-Logik und Nachrichtentexte.
  - Nachrichtentexte unterstützen definierte HTML-Tags zur Formatierung.

- **Fallback-Strategie**
  - Falls CSV/JSON nicht geladen werden können, nutzt die App eingebaute Fallback-Daten.

### 4.3 Persistenz

- Browserseitige Speicherung über `localStorage`:
  - Stunden-Einträge
  - Favoriten
  - Arbeitsplan
  - manuelle freie Tage
  - Theme

### 4.4 UI- und Interaktionsstruktur

- Single-Page-Aufbau mit Karten/Popover-Komponenten.
- Zentrale Bereiche: Erfassung, Kalender, Daily Log, Qualität, Favoriten, Report, Einstellungen.
- Event-getriebene Logik im Frontend (DOM-Events, Render-Funktionen, lokale State-Verwaltung).

### 4.5 Export-/Schnittstellenebene

- CSV-Export via Blob-Download.
- XLSX-Export via lokaler SheetJS-Bibliothek, inkl. mehrerer Arbeitsblätter.
- JSON-Import/Export für Einstellungen und Debug-Daten.


---

## 5. Datenschutz-Audit: Externe Server/CDNs

### 5.1 Scope und Vorgehen

Geprüft wurden:
- Aktive Anwendung (`index.html`, `app.js`, `styles.css`)
- Lokal eingebundene Vendor-Dateien (insbesondere Font Awesome CSS)
- Typische externe Kommunikationspfade (`http(s)`, `fetch`, WebSocket, Beacon)

### 5.2 Befund (aktive App)

- **Keine aktiven CDN-Referenzen** in der laufenden Version.
- **Keine aktiven externen Serveraufrufe** im Anwendungscode.
- Vorhandene `fetch`-Aufrufe laden nur **lokale Projektdateien** (`./data/masterdata.csv`, `./data/rules.json`).
- CSS/Assets sind lokal eingebunden; Font-Dateien werden relativ aus dem lokalen `assets`-Pfad geladen.

### 5.3 Ergebnisbewertung

- **Datenschutz-Risiko bzgl. externer Datenabflüsse im Mockup: niedrig**
- Nach aktuellem Stand werden keine Nutzdaten an externe Dienste übertragen.


---

## 6. Fortführungsnotizen für ein anderes LLM

Dieser Abschnitt enthält Umsetzungswissen aus dem bisherigen Projektverlauf, damit ein anderes LLM die Arbeit konsistent fortführen kann.

### 6.1 Bisherige Leitplanken und Produktentscheidungen

- Ziel war eine **moderne, produktionsnahe Web-Oberfläche** für Projektstundenerfassung mit hoher Nutzerführung.
- Der Fokus liegt auf **korrekter Erfassung am Entstehungspunkt** (Quality Shift Left), nicht auf nachträglicher Korrektur.
- Feste Benutzerdarstellung im UI ist aktuell Teil des Mock-/Toolstands, fachliche Regeln sind aber bereits **abteilungsbasiert** modelliert.
- Reporting-Export ist ein **Zusatznutzen für den Anwender**; organisatorisch kann Hauptreporting serverseitig durch Controlling erfolgen.

### 6.2 Relevante Implementierungsdetails aus dem Verlauf

- Masterdatenquelle wurde von JSON auf **CSV** umgestellt (`Nummer;Ort;Kostenträger;Kategorie`), inkl. Parser für Semikolon + Quotes.
- Regelwerk liegt in `data/rules.json`; Texte unterstützen inzwischen **HTML-Hervorhebung** (`<strong>`, `<em>`, `<br>`), Platzhalter werden escaped ersetzt.
- Font Awesome wurde erst CDN-basiert getestet und anschließend vollständig **lokal eingebunden**; aktueller Stand lokal auf Version 7.2.0.
- XLSX-Bibliothek ist lokal im Projekt (`assets/xlsx.full.min.js`) eingebunden.
- Theme-Switch wurde mehrfach überarbeitet (Button → Switch, Positionierung, Kontrastanpassungen in Light/Dark).

### 6.3 Feature-Stand (zusätzlich zu Kernfunktionen)

- Favoriten:
  - Speichern aus aktueller Auswahl,
  - Reihenfolge ändern (Up/Down) mit Persistenz,
  - Farb-/Icon-Konfiguration,
  - automatische Benennung über Kostenträgername,
  - Vorschläge aus häufigen Nicht-Favoriten-Kombinationen (Top 3).
- Erfassungsassistenz:
  - Stunden-Quick-Chips (1/2/3 + häufige Werte),
  - Tooltip nur auf dynamischen Chips,
  - Kommentarvorschläge priorisiert nach gleichem Kostenträger.
- Sicherheit/Plausibilität:
  - Duplikat-Popover mit „kombinieren“ oder „verwerfen“,
  - Merge-Logik für Stunden und Kommentare,
  - Inline-Advisories pro Eintrag.
- Bedienqualität:
  - Undo-Toast nach Löschen,
  - Vortag kopieren,
  - Kalenderstatus inkl. freier Tage,
  - Debug-Utilities (Seed, Import/Export, Storage Reset).

### 6.4 Design- und Text-Feinheiten aus Nutzerfeedback

- Nicht-Heading-Fettschrift wurde auf **semibold** entschärft.
- Regel-/Warnbanner wurde in der Schriftgröße leicht reduziert.
- Favoriten-Popover wurde vergrößert.
- Optionales Favoriten-Namensfeld wurde entfernt.
- Mehrere Dark-Mode-Kontraste wurden iterativ nachgeschärft (Kalender, Chips, Controls).

### 6.5 Technische Ansatzpunkte für sinnvolle Weiterentwicklung (keine neuen Feature-Requests)

- **Code-Struktur:** `app.js` ist funktionsreich; mittelfristig in Module aufteilen (State, Rules, Calendar, Favorites, Report, Persistence).
- **Testbarkeit:** reine Funktionsbereiche (Parser, Regel-Matching, Qualitätsberechnung, Aggregation) mit Unit-Tests absichern.
- **Robustheit bei Datenmigrationen:** Versionierung für gespeicherte Settings/Entries/Favoriten strukturieren.
- **Sanitizing-Härtung:** aktuelles HTML-Whitelist-Verfahren für Regeltexte dokumentieren und bei Bedarf zentralisieren.
- **Performance:** wiederholte Berechnungen (z. B. Eintragsabfragen pro Tag/Monat) bei wachsender Datenmenge über Caches/Indices optimieren.
- **Betriebsreife:** für on-prem-Zielbild Logging, Fehlertelemetrie, Rollen-/Benutzeranbindung und serverseitiges zentrales Reporting ergänzen.

### 6.6 Hinweise zum Arbeitsmodus aus diesem Verlauf

- Nutzer bevorzugt präzise, iterative UI-Feinabstimmungen statt großer Redesigns.
- Änderungen sollten klein, validierbar und konsistent mit bestehender Optik erfolgen.
- Bei Anpassungen an HTML-Struktur immer korrespondierende JS-Referenzen mitziehen (z. B. entfernte DOM-Inputs).

### 6.7 LLM-/Agent-Information

- Assistent: **GitHub Copilot**
- Verwendetes Modell: **GPT-5.3-Codex**
- Dokumentationsstand dieser Datei: **13.02.2026**
