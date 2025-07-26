@echo off
echo ========================================
echo LANCEMENT ENVIRONNEMENT BOOMBOXSWAP
echo ========================================
echo.

echo [1/3] Activation environnement Conda...
call conda activate boomboxswap
if errorlevel 1 (
    echo ERREUR: Impossible d'activer l'environnement boomboxswap
    echo Verifiez que l'installation s'est bien passee
    pause
    exit /b 1
)
echo OK: Environnement active

echo.
echo [2/3] Verification cache mémoire...
python -c "import sys; sys.path.append('backend'); from services.memory_cache import BoomboxCache; cache = BoomboxCache(); print('Cache mémoire: OK')" 2>nul
if errorlevel 1 (
    echo ATTENTION: Cache mémoire non fonctionnel.
    echo Vérifiez services/memory_cache.py
)

echo.
echo [3/3] Lancement serveur developpement...
echo Serveur accessible sur: http://localhost:8000
echo API docs: http://localhost:8000/docs
echo.
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
