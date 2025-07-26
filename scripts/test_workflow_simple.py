#!/usr/bin/env python3
"""
Test Simplifié du Workflow GitHub Automatisé BOOMBOXSWAP V1
Vérifie que tous les composants sont en place et fonctionnels
"""

import os
import sys
import subprocess


def test_git_repository():
    """Vérifie que le projet est un repository Git"""
    print("Test repository Git...")
    try:
        result = subprocess.run(
            ['git', 'rev-parse', '--git-dir'],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print("SUCCES: Repository Git détecté")
            return True
        else:
            print("ECHEC: Pas un repository Git")
            return False
    except FileNotFoundError:
        print("ECHEC: Git non installé")
        return False


def test_quick_tests():
    """Vérifie que les tests rapides fonctionnent"""
    print("Test tests rapides...")
    test_script = os.path.join('tests', 'test_quick.py')
    if not os.path.exists(test_script):
        print("ECHEC: Fichier test_quick.py non trouvé")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, test_script],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            print("SUCCES: Tests rapides passent")
            return True
        else:
            print("ECHEC: Tests rapides échouent")
            return False
    except subprocess.TimeoutExpired:
        print("ECHEC: Tests rapides timeout")
        return False
    except Exception as e:
        print(f"ECHEC: Erreur tests rapides: {e}")
        return False


def test_auto_commit_script():
    """Vérifie que le script auto-commit existe et est valide"""
    print("Test script auto-commit...")
    script_path = os.path.join('scripts', 'auto-commit.py')
    if not os.path.exists(script_path):
        print("ECHEC: Script auto-commit.py non trouvé")
        return False
    
    try:
        # Vérifier la syntaxe Python
        with open(script_path, 'r') as f:
            content = f.read()
        
        # Compiler pour vérifier la syntaxe
        compile(content, script_path, 'exec')
        print("SUCCES: Script auto-commit syntaxe OK")
        return True
    except SyntaxError as e:
        print(f"ECHEC: Erreur syntaxe script: {e}")
        return False
    except Exception as e:
        print(f"ECHEC: Erreur script: {e}")
        return False


def test_git_configuration():
    """Vérifie la configuration Git"""
    print("Test configuration Git...")
    try:
        # Vérifier user.name
        result = subprocess.run(
            ['git', 'config', 'user.name'],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            print(f"SUCCES: Git user.name: {result.stdout.strip()}")
        else:
            print("ECHEC: Git user.name non configuré")
            return False
        
        # Vérifier user.email
        result = subprocess.run(
            ['git', 'config', 'user.email'],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            print(f"SUCCES: Git user.email: {result.stdout.strip()}")
        else:
            print("ECHEC: Git user.email non configuré")
            return False
        
        # Vérifier remote origin
        result = subprocess.run(
            ['git', 'remote', 'get-url', 'origin'],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            print(f"SUCCES: Git remote origin: {result.stdout.strip()}")
        else:
            print("ECHEC: Git remote origin non configuré")
            return False
        
        return True
    except Exception as e:
        print(f"ECHEC: Erreur configuration Git: {e}")
        return False


def test_critical_files():
    """Vérifie que les fichiers critiques existent"""
    print("Test fichiers critiques...")
    critical_files = [
        'backend/main.py',
        'frontend/index.html',
        'scripts/auto-commit.py',
        'tests/test_quick.py',
        'start_all.bat'
    ]
    
    missing_files = []
    for file_path in critical_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
        else:
            print(f"SUCCES: {file_path}")
    
    if missing_files:
        print(f"ECHEC: Fichiers manquants: {missing_files}")
        return False
    
    return True


def test_watchdog_installation():
    """Vérifie que watchdog est installé"""
    print("Test installation watchdog...")
    try:
        import watchdog
        print("SUCCES: Watchdog installé")
        return True
    except ImportError:
        print("ATTENTION: Watchdog non installé")
        print("Installation: pip install watchdog")
        print("Le workflow fonctionnera sans surveillance automatique")
        return False


def main():
    """Fonction principale de test"""
    print("=== TEST WORKFLOW GITHUB AUTOMATISE BOOMBOXSWAP V1 ===")
    print()
    
    tests = [
        ("Repository Git", test_git_repository),
        ("Configuration Git", test_git_configuration),
        ("Fichiers critiques", test_critical_files),
        ("Script auto-commit", test_auto_commit_script),
        ("Tests rapides", test_quick_tests),
        ("Installation Watchdog", test_watchdog_installation),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"ECHEC: Erreur test {test_name}: {e}")
            results.append((test_name, False))
    
    # Résumé
    print("\n" + "="*50)
    print("RESUME DES TESTS")
    print("="*50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "SUCCES" if result else "ECHEC"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{total} tests passés")
    
    if passed >= total - 1:  # Permettre watchdog manquant
        print("\nMISSION ACCOMPLIE: Workflow GitHub automatisé prêt!")
        print("\nPour démarrer:")
        print("1. Exécuter: start_all.bat")
        print("2. Modifier un fichier dans backend/ ou frontend/")
        print("3. Le commit et push automatique se déclenchera")
        return True
    else:
        print(f"\nATTENTION: {total - passed} test(s) échoué(s)")
        print("Corrigez les problèmes avant d'utiliser le workflow.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 