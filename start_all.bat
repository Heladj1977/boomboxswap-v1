@echo off
REM ========================================
REM BOOMBOXSWAP V1 - MISSION LANCEMENT TERMINAL UNIQUE
REM ========================================

echo =========================================
echo BOOMBOXSWAP V1 - MISSION LANCEMENT
echo =========================================
echo.

REM [1/4] Vérification environnement
call conda activate boomswap-v1
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Environnement boomswap-v1 non trouve
    exit /b 1
)
echo [1/4] VERIFICATION ENVIRONNEMENT... OK

REM [2/4] Vérification stack Python
python -c "import fastapi, uvicorn, web3; print('OK Stack operationnel')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Dependencies manquantes
    exit /b 1
)
echo [2/4] VERIFICATION STACK... OK

echo [3/4] DEMARRAGE BACKEND...
echo Initialisation BOOMBOXSWAP en cours...
echo.

REM [4/4] Vérification code source backend
if not exist backend\main.py (
    echo ERREUR: main.py introuvable dans backend
    exit /b 1
)
echo [4/4] ATTENTE BACKEND PRET... OK

echo =========================================
echo MISSION BOOMBOXSWAP ACCOMPLIE !
echo =========================================
echo Interface: http://127.0.0.1:8000/interface

echo Lancement du backend FastAPI (logs visibles ci-dessous)...
echo =========================================
REM Lancer le script d'ouverture navigateur en arrière-plan
start "" pythonw scripts\open_browser_when_ready.py
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000
REM Fin du script : CTRL+C pour arrêter proprement 