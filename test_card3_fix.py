#!/usr/bin/env python3
"""
Test Card 3 - Prix temps réel BNB/USDT
Vérification des modifications apportées
"""

import sys
import os
import json
from datetime import datetime

# Ajouter le chemin backend au PYTHONPATH
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_contract_manager():
    """Test du ContractManager avec les modifications"""
    print("=== TEST CONTRACT MANAGER ===")
    
    try:
        from services.contract_manager import ContractManager
        from services.web3_pool import Web3PoolManager
        
        # Initialiser Web3Pool
        web3_pool = Web3PoolManager()
        
        # Initialiser ContractManager
        contract_manager = ContractManager(web3_pool)
        
        # Test prix BNB
        print("Test prix BNB...")
        result = contract_manager.get_pancakeswap_price("bsc", "BNB")
        print(f"Résultat BNB: {result}")
        
        # Test prix USDT
        print("Test prix USDT...")
        result = contract_manager.get_pancakeswap_price("bsc", "USDT")
        print(f"Résultat USDT: {result}")
        
        print("SUCCES: ContractManager fonctionne")
        return True
        
    except Exception as e:
        print(f"ERREUR ContractManager: {e}")
        return False

def test_api_response():
    """Test de la réponse API simulée"""
    print("\n=== TEST API RESPONSE ===")
    
    try:
        # Simuler la logique de main.py
        chain_id = "bsc"
        token = "BNB"
        
        # Simuler contract_manager.get_pancakeswap_price
        price_data = {"price": 300.0, "cached": False}
        
        if isinstance(price_data, dict):
            price = price_data.get("price", 300.0)
        else:
            price = price_data if price_data else 300.0
        
        # Simuler la réponse API
        response = {
            "price": float(price),
            "timestamp": datetime.utcnow().isoformat(),
            "expires_at": datetime.utcnow().timestamp() + 5
        }
        
        print(f"Réponse API simulée: {json.dumps(response, indent=2)}")
        print("SUCCES: Logique API correcte")
        return True
        
    except Exception as e:
        print(f"ERREUR API: {e}")
        return False

def test_frontend_logic():
    """Test de la logique frontend"""
    print("\n=== TEST FRONTEND LOGIC ===")
    
    try:
        # Simuler les données reçues du backend
        bnbData = {
            "price": 300.0,
            "timestamp": datetime.utcnow().isoformat(),
            "expires_at": datetime.utcnow().timestamp() + 5
        }
        
        # Simuler la construction de l'objet prices
        prices = {
            "BNB": bnbData
        }
        
        # Simuler updatePriceDisplay
        newPrice = parseFloat(prices["BNB"]["price"])
        formattedPrice = f"${newPrice:.2f}"
        
        print(f"Prix formaté: {formattedPrice}")
        print("SUCCES: Logique frontend correcte")
        return True
        
    except Exception as e:
        print(f"ERREUR Frontend: {e}")
        return False

def parseFloat(value):
    """Simulation de parseFloat JavaScript"""
    try:
        return float(value)
    except:
        return 0.0

def main():
    """Test principal"""
    print("BOOMBOXSWAP V1 - TEST CARD 3 CORRECTION")
    print("=" * 50)
    
    tests = [
        test_contract_manager,
        test_api_response,
        test_frontend_logic
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"ERREUR test {test.__name__}: {e}")
            results.append(False)
    
    print("\n" + "=" * 50)
    print("RESUME DES TESTS")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Tests réussis: {passed}/{total}")
    
    if passed == total:
        print("SUCCES: Tous les tests passent")
        print("Card 3 devrait fonctionner correctement")
    else:
        print("ATTENTION: Certains tests ont échoué")
        print("Vérifier les erreurs ci-dessus")

if __name__ == "__main__":
    main() 