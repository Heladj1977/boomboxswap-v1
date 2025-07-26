@echo off
title BOOMBOXSWAP V1 - Démarrage Corrigé
echo ======================================
echo BOOMBOXSWAP V1 - DEMARRAGE CORRIGE
echo ======================================
echo.

REM Vérifier si conda est installé
where conda >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Conda n'est pas installé ou pas dans le PATH
    echo Installez Miniconda/Anaconda d'abord
    pause
    exit /b 1
)

REM Activer l'environnement conda
echo [1/6] Activation environnement conda...
call conda activate boomboxswap
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Environnement boomboxswap introuvable
    echo Exécutez install_conda.bat d'abord
    pause
    exit /b 1
)

REM 1. RÉSOLUTION PORT 8000 OCCUPÉ
echo [2/6] Vérification port 8000...
netstat -ano | findstr :8000 >nul
if %ERRORLEVEL% EQU 0 (
    echo ATTENTION: Port 8000 déjà utilisé
    echo Recherche et arrêt du processus...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
        echo Processus PID: %%a
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo SUCCES: Port 8000 libéré
) else (
    echo SUCCES: Port 8000 libre
)

REM [2/6] Vérification cache mémoire
echo [2/6] Vérification cache mémoire...
python -c "import sys; sys.path.append('backend'); from services.memory_cache import BoomboxCache; cache = BoomboxCache(); print('Cache mémoire: OK')"
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Cache mémoire non fonctionnel
    pause
    exit /b 1
)

REM 3. VÉRIFICATION ENVIRONNEMENT
echo [4/6] Vérification environnement...
python -c "
import sys
print(f'Python: {sys.version}')
try:
    import fastapi
    print('FastAPI: OK')
except:
    print('FastAPI: ERREUR')

try:
    import web3
    print('Web3: OK')
except:
    print('Web3: ERREUR')

try:
    import sys
    sys.path.append('backend')
    from services.memory_cache import BoomboxCache
    cache = BoomboxCache()
    print('Cache mémoire: OK')
except:
    print('Cache mémoire: ERREUR')
"

REM 4. DÉMARRAGE BACKEND
echo [5/6] Démarrage backend FastAPI...
cd /d "%~dp0backend"
start "BOOMBOXSWAP Backend" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

REM Attendre que le backend démarre
echo Attente démarrage backend...
timeout /t 8 /nobreak >nul

REM 5. VÉRIFICATION BACKEND
echo [6/6] Vérification backend...
curl -s http://127.0.0.1:8000/health >nul
if %ERRORLEVEL% EQU 0 (
    echo SUCCES: Backend opérationnel
) else (
    echo ATTENTION: Backend non accessible, mais continuation...
)

REM Ouverture interface
echo.
echo ======================================
echo BOOMBOXSWAP V1 DÉMARRÉ AVEC SUCCÈS !
echo ======================================
echo.
echo Ouverture interface web...
start http://127.0.0.1:8000

echo.
echo URLs disponibles:
echo - Interface: http://127.0.0.1:8000
echo - API Docs: http://127.0.0.1:8000/docs
echo - Health: http://127.0.0.1:8000/health
echo.
echo Appuyez sur une touche pour fermer ce launcher...
pause >nul
