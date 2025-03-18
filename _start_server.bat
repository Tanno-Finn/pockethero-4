@echo off
echo Starte lokalen Python HTTP-Server fuer Pocket-Hero...
echo.
echo Server wird auf http://localhost:8000 gestartet
echo Zum Beenden dieses Fenster schliessen (Strg+C)
echo.

python -m http.server 8000

echo.
echo Server wurde beendet.
pause
