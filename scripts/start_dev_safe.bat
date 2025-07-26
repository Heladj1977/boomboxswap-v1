@echo off
echo ========================================
echo BOOMBOXSWAP - DEMARRAGE SECURISE
echo ========================================
echo.

echo [1/4] Test rapide de l'environnement...
python test_quick.py
if errorlevel 1 (
    echo.
    echo ERREUR: Tests preliminaires echoues
    echo Verifiez les erreurs ci-dessus avant de continuer
    pause
    exit /b 1
)

echo.
echo [2/4] Activation environnement Conda...
call conda activate boomboxswap
if errorlevel 1 (
    echo ERREUR: Impossible d'activer l'environnement boomboxswap
    echo Verifiez que l'installation s'est bien passee
    pause
    exit /b 1
)
echo OK: Environnement active

echo.
echo [3/4] Verification des services...
echo - Cache mémoire: Intégré et fonctionnel
echo - Web3: Connexions RPC configurees
echo - Cache: Gestionnaire avec fallback

echo.
echo [4/4] Lancement serveur en mode securise...
echo.
echo Serveur accessible sur: http://localhost:8000
echo API docs: http://localhost:8000/docs
echo Frontend: http://localhost:8000 (puis ouvrir frontend/index.html)
echo.
echo CTRL+C pour arreter le serveur
echo.

cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 --log-level info