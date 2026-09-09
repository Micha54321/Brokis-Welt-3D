# Brokis Welt – Sonneninsel 05

Eine eigenständige, begehbare 3D-Insel nach dem ausgewählten Bildentwurf. Broki kann vom Holzsteg über die Wiese und die Brücke bis auf den hinteren Hügel laufen. Die Insel enthält Sandwege, einen Bach, vier Bäume, Büsche, Blumen, Felsen und animiertes Wasser.

## Starten

`Brokis-Sonneninsel-05.html` in einem Browser mit WebGL 2 öffnen, beispielsweise Microsoft Edge oder Chrome. Die Datei funktioniert ohne Installation und ohne Internetzugang. Alle Modelle, Texturen und Programmteile sind enthalten; es gibt keine externen Netzwerkzugriffe.

Die Insel startet in der Übersicht. „Mit Broki loslaufen“ oder „Zu Broki“ schaltet zur Spielkamera. „Insel ansehen“ zeigt die gesamte Insel wieder.

## Steuerung

- **W/S oder Pfeil hoch/runter:** vorwärts und rückwärts laufen.
- **A/D oder Pfeil links/rechts:** Broki drehen. Die Spielkamera dreht sich mit und bleibt hinter ihm.
- **Leertaste:** springen. Auf dem Handy die gelbe Sprungtaste.
- **Maus ziehen:** in der Übersicht drehen; beim Spielen Broki rundum betrachten und die Kamerahöhe einstellen. Die Ansicht bleibt nach Loslassen stehen; beim Weiterlaufen folgt die Kamera wieder hinter Broki.
- **Mausrad:** näher heran oder weiter weg.
- **Handy/Tablet:** linker Joystick: hoch/runter laufen, links/rechts drehen; auf der freien Spielfläche ziehen zum Umkreisen und mit zwei Fingern zoomen.
- **Runder Pfeil auf Touch-Geräten:** Kamera hinter Broki ausrichten.
- **Haus-Schaltfläche oder R:** zurück zum Steg.
- **Escape:** Inselübersicht.
- **Bild-Schaltfläche auf großen Bildschirmen:** aktuelle Ansicht direkt aus der 3D-Szene als PNG speichern.

Wasser ist eine Laufgrenze. Über den Bach führt die Holzbrücke. Bäume und größere Felsen haben Hindernisgrenzen. Zehn goldene Sonnenmünzen sind abseits des Weges auf beiden Inselhälften verteilt. Alle sind zu Fuß erreichbar. Berühren sammelt sie ein. Die Anzeige zählt bis 10 / 10, danach erscheinen eine Erfolgsmeldung und ein kurzes buntes Feuerwerk. Zurück zum Steg behält den Sammelstand; Neuladen beginnt eine neue Runde. Springen ist auch während des Laufens möglich; Wasser und größere Hindernisse bleiben Laufgrenzen.

## Grafiküberarbeitung 02

Zusätzliche Blumen, geschwungene Blattpflanzen und Klee, sanft bewegtes Gras und Baumkronen, feinere Steinoberflächen, abgerundete Holzplanken und weichere Bodenschatten. Das Wasser zeigt bewegte Lichtmuster im flachen Bereich, Reflexe und unterbrochene Schaumränder. Sand, Erde und Wiese gehen weicher ineinander über. Laufwege und Hindernisgrenzen entsprechen der ersten Insel.

## Stand der Gestaltung

Der Bildentwurf dient als Vorlage für Aufbau, Farbwelt und Stimmung. Die beigefügte Datei `Brokis-Sonneninsel-05.png` ist eine echte Aufnahme aus der laufenden 3D-Szene. Der Bildentwurf ist separat als `Insel-Bildvorlage.png` enthalten. Die Umsetzung ist eine erste begehbare Fassung und keine pixelgenaue Reproduktion der Illustration; insbesondere Pflanzen, Felsen, Ufer und Wasser sind als einfachere Echtzeitmodelle und Shader umgesetzt.

Broki wurde in dieser Fassung auf Wunsch rundlicher gestaltet: mehr Tiefe in Bauch und Rücken, vollere Kopfpolster und dickere Plüschhände. Die Stickerei und Körpernähte folgen der neuen Oberfläche. Grün und Gelb bleiben erhalten. Die ursprüngliche Figurenstudie ist separat gesichert.

Version 21 und die eigenständige Figurenstudie bleiben separate, unveränderte Dateien. Diese Insel überschreibt keine der fünf bisherigen Spielwelten.

## Spielstand 05

Sprung mit Schwerkraft und Landung, dauerhaft hinter Broki mitdrehende Kamera, zehn drehende Sonnenmünzen und Sammelanzeige. Version 02 bleibt separat erhalten.

## Geprüft

Geprüft wurden der Start der 3D-Szene, ein zusammenhängender Laufweg vom Steg zum Hügel, tatsächliches Laufen mit Tastatur einschließlich Brückenüberquerung, Grenzen am Meer und Bach, Rückkehr zum Steg, Bildexport, Touch-Joystick samt Anhalten, Hoch- und Querformat sowie das Öffnen der fertigen HTML-Datei ohne Internetzugang. Es wurden keine JavaScript- oder Shaderfehler gefunden. Das Prüfprotokoll liegt bei.

Die mobilen Prüfungen fanden mit emulierter Touch-Bedienung in Edge auf diesem Windows-Computer statt. Eine Leistungsprüfung auf einem tatsächlichen Handy steht noch aus.

## Quellcode

Im Ordner `source` liegen die bearbeitbaren Dateien. Für die Entwicklung beispielsweise mit `python -m http.server 8767 --directory source` lokal starten. Die fertige Offline-Datei lässt sich mit `python source/build.py Brokis-Sonneninsel-05.html` neu erstellen.

Three.js liegt lokal unter `source/vendor` mit seiner MIT-Lizenz. Die Insel-Geometrie, Oberflächentexturen und Wasserdarstellung werden aus dem Quellcode erzeugt. Die Illustration wird nicht als Spielfeld oder als vorgetäuschte 3D-Ansicht verwendet.
 
Neu in 05: Broki korrekt benannt, freie Maus- und Touch-Umlaufkamera im Stand, zehn verstreute Suchmünzen und einmaliges Feuerwerk beim Abschluss. Für 05 wurden die Erreichbarkeit aller Münzen, Maus-Umlauf und Kamera-Rückkehr, Sammelabschluss und Feuerwerk getestet. Das Feuerwerk endet nach wenigen Sekunden.