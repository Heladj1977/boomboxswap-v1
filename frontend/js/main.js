/**
 * BOOMBOXSWAP V1 - Main JavaScript
 * Orchestration de tous les composants
 */

// === GESTION ÉTAT WALLET ===
// SUPPRIMÉ : showWalletInvitation, hideWalletInvitation, clearPortfolioData, grisé

function setAllCardsToZero() {
    // Card 1 : Portefeuille
    document.getElementById('balance-bnb').textContent = '0.0000';
    document.getElementById('balance-usdt').textContent = '0.00';
    document.getElementById('balance-cake').textContent = '0.00';
    document.getElementById('total-value').textContent = '$0.00';
    // Card 2 : Rendements
    if (document.getElementById('fees-generated')) document.getElementById('fees-generated').textContent = '$0.00 (BNB+USDT)';
    if (document.getElementById('cake-rewards')) document.getElementById('cake-rewards').textContent = '$0.00';
    if (document.getElementById('total-gains')) document.getElementById('total-gains').textContent = '$0.00';
    if (document.getElementById('rebalancing-count')) document.getElementById('rebalancing-count').textContent = '0 fois';
    if (document.getElementById('autocompound-count')) document.getElementById('autocompound-count').textContent = '0 fois';
    if (document.getElementById('break-even')) document.getElementById('break-even').textContent = '-';
    // Card 4 : Dépôt
    if (document.getElementById('est-bnb')) document.getElementById('est-bnb').textContent = '0.0000';
    if (document.getElementById('est-usdt')) document.getElementById('est-usdt').textContent = '0.00';
    if (document.getElementById('est-total')) document.getElementById('est-total').textContent = '$0.00';
    // Card 5 : Actions (ligne info)
    if (document.getElementById('positions-info')) document.getElementById('positions-info').textContent = '0/0 • 0% APR • - • - • -';
    // Card 6 : Swap intégré (état neutre, à compléter selon structure)
    // (exemple: désactiver boutons, remettre valeurs par défaut)
}

class BoomboxApp {
    constructor() {
        this.isInitialized = false;
        this.priceUpdateInterval = null;
        this.soundEnabled = true;

        this.init();
    }

    /**
     * Initialisation de l'application
     */
    async init() {
        try {
            console.log('BOOMBOXSWAP V1 - INITIALISATION');

            // Attendre que le DOM soit chargé
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupApp());
            } else {
                this.setupApp();
            }

        } catch (error) {
            console.error('ERREUR INITIALISATION:', error);
            this.showError('ERREUR INITIALISATION', error.message);
        }
    }

    /**
     * Configuration de l'application
     */
    async setupApp() {
        try {
            // Initialiser les composants
            this.setupEventListeners();
            this.setupNavigation();
            this.setupWalletModal();
            this.setupMusicControls();
            this.setupRangeConfig();
            this.setupMetaMask(); // Ajout de l'initialisation MetaMask
            this.initializeWalletConnections();

            // Tester connexion API
            await this.testApiConnection();

            // Démarrer monitoring prix
            this.startPriceMonitoring();

            // Marquer comme initialisé
            this.isInitialized = true;

            console.log('BOOMBOXSWAP V1 - INITIALISE AVEC SUCCES');

            // Émettre événement de succès
            if (window.BoomboxEvents) {
                window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.SYSTEM_SUCCESS, {
                    message: 'APPLICATION INITIALISEE',
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('ERREUR SETUP:', error);
            this.showError('ERREUR SETUP', error.message);
        }
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Écouter événements système
        if (window.BoomboxEvents) {
            window.BoomboxEvents.on(window.BoomboxEvents.EVENTS.CHAIN_CHANGED, (data) => {
                this.onChainChanged(data);
            });

            window.BoomboxEvents.on(window.BoomboxEvents.EVENTS.PRICE_UPDATED, (data) => {
                this.onPriceUpdated(data);
            });

            window.BoomboxEvents.on(window.BoomboxEvents.EVENTS.SYSTEM_ERROR, (data) => {
                this.showError(data.context, data.error);
            });
        }
    }

    /**
     * Configuration navigation
     */
    setupNavigation() {
        const navPoints = document.querySelectorAll('.nav-point');
        navPoints.forEach(point => {
            point.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.switchPage(page);
            });
        });
    }

    /**
     * Configuration modal wallet
     */
    setupWalletModal() {
        const walletConnect = document.getElementById('walletConnect');
        const walletModal = document.getElementById('walletModal');
        const closeModal = document.getElementById('closeModal');

        if (walletConnect) {
            walletConnect.addEventListener('click', () => {
                this.showWalletModal();
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideWalletModal();
            });
        }

        // Fermer modal en cliquant à l'extérieur
        if (walletModal) {
            walletModal.addEventListener('click', (e) => {
                if (e.target === walletModal) {
                    this.hideWalletModal();
                }
            });
        }

        // Listener sur le bouton Annuler de la modale
        const closeWalletModal = document.getElementById('close-wallet-modal');
        if (closeWalletModal) {
            closeWalletModal.onclick = () => {
                console.log('Clic sur Annuler');
                this.hideWalletModal();
            };
        }

        // Dans setupWalletModal, remplacer l'event handler WalletConnect par :
        const walletConnectOption = document.getElementById('connect-walletconnect');
        if (walletConnectOption) {
            walletConnectOption.onclick = async () => {
                // Désactiver le bouton pour éviter les doubles clics
                walletConnectOption.disabled = true;
                walletConnectOption.classList.add('disabled');
                this.hideWalletModal();
                try {
                    // Reset le provider WalletConnect avant toute tentative
                    if (window.BOOMSWAP_WEB3MODAL && window.BOOMSWAP_WEB3MODAL.clearCachedProvider) {
                        await window.BOOMSWAP_WEB3MODAL.clearCachedProvider();
                    }
                    if (window.WalletConnectEthereumProvider && window.WalletConnectEthereumProvider.disconnect) {
                        await window.WalletConnectEthereumProvider.disconnect();
                    }
                    // Lancer la connexion WalletConnect (ouvre le modal WalletConnect)
                    if (window.BOOMSWAP_CONNECT_WALLETCONNECT) {
                        await window.BOOMSWAP_CONNECT_WALLETCONNECT();
                    }
                } catch (error) {
                    alert('Connexion WalletConnect annulée ou échouée : ' + (error.message || error));
                } finally {
                    // Réactiver le bouton après la tentative
                    walletConnectOption.disabled = false;
                    walletConnectOption.classList.remove('disabled');
                }
            };
        }
        // Même logique pour MetaMask :
        const metamaskOption = document.getElementById('connect-metamask');
        if (metamaskOption) {
            metamaskOption.onclick = async () => {
                this.hideWalletModal();
                try {
                    if (window.BOOMSWAP_CONNECT_METAMASK) {
                        await window.BOOMSWAP_CONNECT_METAMASK();
                    }
                } catch (error) {
                    alert('Erreur MetaMask : ' + (error.message || error));
                }
            };
        }
    }

    /**
     * Configuration contrôles musicaux
     */
    setupMusicControls() {
        const playBtn = document.getElementById('playBtn');
        const ejectBtn = document.getElementById('ejectBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (playBtn) {
            playBtn.addEventListener('click', () => this.onPlayClicked());
        }

        if (ejectBtn) {
            ejectBtn.addEventListener('click', () => this.onEjectClicked());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.onPrevClicked());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.onNextClicked());
        }
    }

    /**
     * Configuration page range config
     */
    setupRangeConfig() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        const saveConfigBtn = document.getElementById('saveConfigBtn');
        const rangeAmount = document.getElementById('rangeAmount');

        // Boutons presets
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.amount;
                this.setRangeAmount(amount);
            });
        });

        // Sauvegarder configuration
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => {
                this.saveRangeConfig();
            });
        }

        // Input range amount
        if (rangeAmount) {
            rangeAmount.addEventListener('input', (e) => {
                this.updateRangePreview(e.target.value);
            });
        }
    }

    /**
     * Initialisation de la connexion MetaMask
     */
    setupMetaMask() {
        // Nouvelle logique MetaMask réelle
        if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
            console.log('🦊 MetaMask détecté');
            // Event listener supprimé ici pour éviter le conflit avec initializeWalletConnections()
        } else {
            console.warn('MetaMask non détecté. Veuillez installer l’extension pour utiliser cette fonctionnalité.');
            // Optionnel : afficher un message dans l’UI
        }
    }

    initializeWalletConnections() {
        console.log('🔄 Initialisation connexions wallet v2...');
        // NOUVEAU: Vérifier les fonctions directes au lieu de Web3Modal
        if (!window.BOOMSWAP_CONNECT_METAMASK || !window.BOOMSWAP_CONNECT_WALLETCONNECT) {
            console.error('❌ Fonctions de connexion non disponibles');
            return;
        }
        console.log('✅ Fonctions wallet v2 prêtes');
        console.log('🦊 MetaMask function:', !!window.BOOMSWAP_CONNECT_METAMASK);
        console.log('📱 WalletConnect function:', !!window.BOOMSWAP_CONNECT_WALLETCONNECT);
        console.log('🔗 WalletConnect Ready:', !!window.BOOMSWAP_WALLETCONNECT_READY);
        // Gérer le bouton de connexion wallet
        const walletBtn = document.getElementById('wallet-btn');
        if (walletBtn) {
            walletBtn.addEventListener('click', async () => {
                try {
                    // Si déjà connecté, déconnecter
                    if (window.BOOMSWAP_CURRENT_ADDRESS) {
                        console.log('🔌 Déconnexion en cours...');
                        await window.BOOMSWAP_DISCONNECT();
                        this.handleWalletDisconnected();
                        return;
                    }
                    console.log('🚀 Ouverture choix wallet...');
                    // Afficher choix MetaMask ou WalletConnect
                    this.showWalletChoice();
                } catch (error) {
                    console.error('❌ Erreur gestion wallet:', error);
                }
            });
        }
    }

    showWalletChoice() {
        console.log('🎯 Affichage modal choix wallet...');
        // Modal originale avec logos SVG et disposition côte à côte
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;
        const content = document.createElement('div');
        content.style.cssText = `
            background: #1a2332; padding: 32px 32px 24px 32px; border-radius: 16px;
            text-align: center; color: white; min-width: 340px; max-width: 95vw;
            border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        `;
        content.innerHTML = `
            <h3 style="margin-bottom: 18px; color: white; font-weight: 700; font-size: 1.3rem;">Connecter Wallet</h3>
            <p style="margin-bottom: 24px; color: #94a3b8; font-size: 15px;">Choisissez votre méthode de connexion</p>
            <div style="display: flex; gap: 18px; justify-content: center; margin-bottom: 18px;">
                <button id="choose-metamask" class="wallet-btn-choice">
                    <img src="assets/images/icons/metamask.svg" class="wallet-logo-svg" alt="MetaMask" />
                    <span>MetaMask</span>
                </button>
                <button id="choose-walletconnect" class="wallet-btn-choice">
                    <img src="assets/images/icons/walletconnect.svg" class="wallet-logo-svg" alt="WalletConnect" />
                    <span>WalletConnect</span>
                </button>
            </div>
            <button id="cancel-choice" class="wallet-btn-cancel">Annuler</button>
        `;
        modal.appendChild(content);
        document.body.appendChild(modal);
        // Events originaux
        document.getElementById('choose-metamask').onclick = async () => {
            document.body.removeChild(modal);
            try {
                console.log('🦊 Connexion MetaMask choisie...');
                const result = await window.BOOMSWAP_CONNECT_METAMASK();
                this.handleWalletConnected(result.address, result.chainId);
            } catch (error) {
                console.error('❌ Erreur MetaMask:', error);
                alert('Erreur connexion MetaMask: ' + error.message);
            }
        };
        document.getElementById('choose-walletconnect').onclick = async () => {
            document.body.removeChild(modal);
            try {
                console.log('📱 Connexion WalletConnect choisie...');
                const result = await window.BOOMSWAP_CONNECT_WALLETCONNECT();
                // Vérifier que result existe avant d'accéder à .address
                if (result && result.address) {
                    this.handleWalletConnected(result.address, result.chainId);
                } else {
                    console.log('🚫 Connexion annulée ou échouée');
                    return; // Sortie silencieuse
                }
            } catch (error) {
                // Ne pas afficher d'erreur si connexion annulée
                if (error.message && (error.message.includes('annulée') || error.message.includes('reset'))) {
                    console.log('🚫 Connexion WalletConnect annulée');
                    return;
                }
                console.error('❌ Erreur WalletConnect:', error);
                alert('Erreur connexion WalletConnect: ' + error.message);
            }
        };
        document.getElementById('cancel-choice').onclick = () => {
            document.body.removeChild(modal);
            console.log('❌ Connexion annulée par utilisateur');
        };
        // CSS minimal pour les boutons et logos (injection si pas déjà présent)
        if (!document.getElementById('wallet-modal-css')) {
            const style = document.createElement('style');
            style.id = 'wallet-modal-css';
            style.innerHTML = `
            .wallet-btn-choice {
                display: flex; align-items: center; gap: 10px;
                background: #232b3a; color: white; border: none;
                border-radius: 8px; padding: 14px 28px; font-size: 16px;
                font-weight: 600; cursor: pointer; transition: background 0.18s;
                box-shadow: 0 2px 8px rgba(59,130,246,0.08);
            }
            .wallet-btn-choice:hover {
                background: #3B82F6;
            }
            .wallet-logo-svg {
                width: 32px !important;
                height: 32px !important;
                min-width: 32px !important;
                min-height: 32px !important;
                max-width: 32px !important;
                max-height: 32px !important;
                display: inline-block;
                vertical-align: middle;
            }
            /* Agrandir uniquement le logo WalletConnect */
            .wallet-btn-choice .wallet-logo-svg[alt="WalletConnect"] {
                width: 48px !important;
                height: 48px !important;
                min-width: 48px !important;
                min-height: 48px !important;
                max-width: 48px !important;
                max-height: 48px !important;
            }
            .wallet-btn-cancel {
                margin-top: 10px; background: #ef4444; color: #fff;
                border: none; border-radius: 8px; padding: 10px 24px;
                font-size: 14px; cursor: pointer; font-weight: 600;
                transition: background 0.18s;
            }
            .wallet-btn-cancel:hover {
                background: #b91c1c;
            }
            `;
            document.head.appendChild(style);
        }
    }

    async disconnectWallet() {
        try {
            console.log('🔌 Déconnexion wallet...');
            if (window.BOOMSWAP_WEB3MODAL) {
                await window.BOOMSWAP_WEB3MODAL.clearCachedProvider();
            }
            // Reset variables globales
            window.BOOMSWAP_CURRENT_PROVIDER = null;
            window.BOOMSWAP_CURRENT_WEB3 = null;
            window.BOOMSWAP_CURRENT_ADDRESS = null;
            window.BOOMSWAP_CURRENT_CHAIN_ID = null;
            // Reset interface
            this.handleWalletDisconnected();
            console.log('✅ Wallet déconnecté');
        } catch (error) {
            console.error('❌ Erreur déconnexion:', error);
        }
    }

    setupProviderListeners(provider) {
        // Écouter changements d'account
        provider.on('accountsChanged', (accounts) => {
            console.log('🔄 Comptes changés:', accounts);
            if (accounts.length === 0) {
                this.disconnectWallet();
            } else {
                window.BOOMSWAP_CURRENT_ADDRESS = accounts[0];
                this.handleWalletConnected(accounts[0], window.BOOMSWAP_CURRENT_CHAIN_ID);
            }
        });
        // Écouter changements de réseau
        provider.on('chainChanged', (chainId) => {
            const newChainId = parseInt(chainId);
            console.log('⛓️ Réseau changé:', newChainId);
            window.BOOMSWAP_CURRENT_CHAIN_ID = newChainId;
            this.handleNetworkChanged(newChainId);
        });
        // Écouter déconnexion
        provider.on('disconnect', () => {
            console.log('🔌 Provider déconnecté');
            this.disconnectWallet();
        });
    }

    /**
     * Attendre que BoomboxAPI soit disponible (max 3s)
     */
    async waitForBoomboxAPI(timeout = 3000) {
        const start = Date.now();
        while (!window.BoomboxAPI && Date.now() - start < timeout) {
            await new Promise(res => setTimeout(res, 50));
        }
        if (!window.BoomboxAPI) {
            console.error('[ERREUR] MISSION ECHOUEE : BoomboxAPI non initialisé après 3 secondes. Vérifiez le chargement du script js/core/api-client.js.');
            showNotification('MISSION ECHOUEE : API client non initialisé. Vérifiez l’ordre des scripts dans index.html.', 'error');
            throw new Error('MISSION ECHOUEE : API client non initialisé.');
        }
    }

    async handleWalletConnected(address, chainId) {
        try {
            await this.waitForBoomboxAPI();
        } catch (e) {
            return;
        }
        if (!window.BoomboxAPI) {
            console.error('[ERREUR] BoomboxAPI non initialisé. Vérifiez que le script js/core/api-client.js est bien chargé AVANT main.js dans index.html.');
            showNotification('ERREUR CRITIQUE : API client non initialisé. Vérifiez l’ordre des scripts dans index.html.', 'error');
            return;
        }
        console.log('[AUDIT] Connexion wallet détectée:', address);
        // Notification de succès
        showNotification('Wallet connecté avec succès', 'success');
        // Mettre à jour le bouton wallet
        const walletBtn = document.getElementById('wallet-btn');
        if (walletBtn) {
            walletBtn.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
            walletBtn.classList.add('connected');
            walletBtn.style.background = '#10b981'; // Vert success
            walletBtn.style.color = '#ffffff';
        }
        // Afficher le nom du réseau
        const networkName = this.getNetworkName(chainId);
        console.log('[AUDIT] Réseau actuel:', networkName);
        // --- SYNCHRONISATION BACKEND ---
        const apiUrl = window.BoomboxAPI.baseUrl;
        console.log(`[API] Appel getBalances pour: ${address}`);
        window.BoomboxAPI.getBalances(address, chainId)
            .then(balances => {
                console.log('[API] Réponse brute:', balances);
                this.updatePortfolioCard(balances);
            })
            .catch(err => {
                console.error('[ERREUR] getBalances:', err);
                this.showError('Balances', err.message || 'Erreur récupération soldes');
            });
        // Récupérer positions
        console.log(`[API] Appel getPositions pour: ${address}`);
        window.BoomboxAPI.getPositions(address, chainId)
            .then(positions => {
                console.log('[API] Données positions:', positions);
                this.updatePositionsCard(positions);
            })
            .catch(err => {
                console.error('[ERREUR] getPositions:', err);
                this.showError('Positions', err.message || 'Erreur récupération positions');
            });
    }

    handleWalletDisconnected() {
        console.log('🔄 Mise à jour interface - Wallet déconnecté');
        // Reset bouton wallet
        const walletBtn = document.getElementById('wallet-btn');
        if (walletBtn) {
            walletBtn.textContent = 'Connecter Wallet';
            walletBtn.classList.remove('connected');
            walletBtn.style.background = '#ef4444'; // Rouge par défaut
            walletBtn.style.color = '#ffffff';
        }
        // Désactiver les fonctionnalités
        this.disableWalletFeatures && this.disableWalletFeatures();
    }

    handleNetworkChanged(chainId) {
        const networkName = this.getNetworkName(chainId);
        console.log('⛓️ Réseau changé vers:', networkName);
        // Mettre à jour l'interface selon le réseau
        if (this.interfaceInteractive) {
            this.interfaceInteractive.updateNetworkDisplay(chainId);
        }
    }

    getNetworkName(chainId) {
        const networks = {
            56: 'BSC',
            42161: 'Arbitrum',
            8453: 'Base',
            1: 'Ethereum'
        };
        return networks[chainId] || `Chain ${chainId}`;
    }

    /**
     * Tester connexion API
     */
    async testApiConnection() {
        if (window.BoomboxAPI) {
            const isConnected = await window.BoomboxAPI.testConnection();
            if (!isConnected) {
                console.warn('API NON DISPONIBLE - Mode démo activé');
            }
        }
    }

    /**
     * Démarrer monitoring prix en temps réel
     */
    startPriceMonitoring() {
        console.log('DEBUT MONITORING PRIX - Card 3');
        
        // Démarrer immédiatement le polling pour afficher le prix
        this.fallbackToPolling();
    }

    /**
     * Retomber sur polling en cas d'erreur EventSource
     */
    fallbackToPolling() {
        console.log('Retour au polling classique');
        // Mise à jour initiale
        this.updatePrices();

        // Mise à jour toutes les 30 secondes comme spécifié
        this.priceUpdateInterval = setInterval(() => {
            this.updatePrices();
        }, 30000);
    }

    /**
     * Mettre à jour les prix
     */
    async updatePrices() {
        try {
            // Utiliser BSC par défaut si pas de chain manager
            let chainId = 'bsc';
            if (window.BoomboxChainManager) {
                chainId = window.BoomboxChainManager.getCurrentChainId();
            }

            console.log('MISE A JOUR PRIX - Chain:', chainId);
            
            // Appel direct à l'API backend pour BNB
            const bnbResponse = await fetch(`/api/v1/price/${chainId}/BNB`);
            if (!bnbResponse.ok) {
                console.error('Échec récupération prix BNB:', await bnbResponse.text());
                const bnbPriceElement = document.getElementById('bnbPrice');
                if (bnbPriceElement) {
                    bnbPriceElement.textContent = 'Prix non disponible';
                }
                return;
            }
            
            const bnbData = await bnbResponse.json();
            
            // Construire l'objet prices avec le format attendu
            const prices = {
                BNB: bnbData
            };

            // Mettre à jour l'interface
            this.updatePriceDisplay(bnbData.price);

            // Émettre événement
            if (window.BoomboxEvents) {
                window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.PRICE_UPDATED, {
                    chainId,
                    prices,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('ERREUR MISE A JOUR PRIX:', error);
            // Afficher erreur dans l'interface
            const bnbPriceElement = document.getElementById('bnbPrice');
            if (bnbPriceElement) {
                bnbPriceElement.textContent = 'Prix non disponible';
            }
        }
    }

    /**
     * Mettre à jour l'affichage des prix avec animation
     */
    updatePriceDisplay(newPrice) {
        // --- AJOUT DE LOGS DE DÉBOGAGE ---
        console.log(`[DEBUG] updatePriceDisplay appelée avec newPrice: ${newPrice}`);

        const priceElement = document.getElementById('bnbPrice');
        if (!priceElement) {
            console.warn("[DEBUG] Élément avec ID 'bnbPrice' non trouvé.");
            return;
        }

        const oldPriceText = priceElement.textContent.replace('$', '');
        const oldPrice = parseFloat(oldPriceText) || 0;
        console.log(`[DEBUG] oldPriceText: '${oldPriceText}', oldPrice (parsed): ${oldPrice}`);

        // Mettre à jour le prix en blanc
        priceElement.textContent = `$${parseFloat(newPrice).toFixed(2)}`;
        priceElement.style.color = ''; // Couleur par défaut (blanc)
        priceElement.style.transform = ''; // Reset scale
        console.log(`[DEBUG] Texte du prix mis à jour dans l'élément.`);

        // Appliquer l'animation uniquement si le prix a changé
        if (newPrice !== oldPrice) {
            console.log(`[DEBUG] Changement de prix détecté. Déclenchement de l'animation.`);
            
            // Retirer les classes d'animation précédentes
            priceElement.classList.remove('pulse', 'price-up', 'price-down');
            console.log(`[DEBUG] Classes d'animation précédentes retirées.`);

            // Ajouter l'animation pulse
            priceElement.classList.add('pulse');
            console.log(`[DEBUG] Classe 'pulse' ajoutée.`);

            // Ajouter la classe de couleur selon la direction
            if (newPrice > oldPrice) {
                priceElement.classList.add('price-up'); // Vert
                console.log(`[DEBUG] Classe 'price-up' (verte) ajoutée.`);
            } else if (newPrice < oldPrice) {
                priceElement.classList.add('price-down'); // Rouge
                 console.log(`[DEBUG] Classe 'price-down' (rouge) ajoutée.`);
            } else {
                 console.log(`[DEBUG] Prix identique (devrait pas arriver ici à cause du if), pas de couleur spécifique.`);
            }

            // Retirer l'animation après 600ms
            setTimeout(() => {
                priceElement.classList.remove('pulse', 'price-up', 'price-down');
                console.log(`[DEBUG] Classes d'animation retirées après timeout.`);
            }, 600);

        } else {
            console.log(`[DEBUG] Pas de changement de prix. Aucune animation déclenchée.`);
        }
        // --- FIN DES LOGS DE DÉBOGAGE ---
    }



    /**
     * Changer de page
     */
    switchPage(pageId) {
        const pages = document.querySelectorAll('.page');
        const navPoints = document.querySelectorAll('.nav-point');

        // Masquer toutes les pages
        pages.forEach(page => page.classList.remove('active'));

        // Désactiver tous les points
        navPoints.forEach(point => point.classList.remove('active'));

        // Afficher la page sélectionnée
        const targetPage = document.getElementById(`${pageId}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Activer le point correspondant
        const targetPoint = document.querySelector(`[data-page="${pageId}"]`);
        if (targetPoint) {
            targetPoint.classList.add('active');
        }

        // Émettre événement
        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.PAGE_CHANGED, {
                page: pageId,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Afficher modal wallet
     */
    showWalletModal() {
        const modal = document.getElementById('walletModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Masquer modal wallet
     */
    hideWalletModal() {
        const modal = document.getElementById('walletModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Actions musicales
     */
    onPlayClicked() {
        this.playSound('play');
        console.log('ACTION: PLAY CLICKED');

        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.PLAY_CLICKED, {
                timestamp: new Date().toISOString()
            });
        }
    }

    onEjectClicked() {
        this.playSound('eject');
        console.log('ACTION: EJECT CLICKED');

        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.EJECT_CLICKED, {
                timestamp: new Date().toISOString()
            });
        }
    }

    onPrevClicked() {
        this.playSound('prev');
        console.log('ACTION: PREV CLICKED');

        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.PREV_CLICKED, {
                timestamp: new Date().toISOString()
            });
        }
    }

    onNextClicked() {
        this.playSound('next');
        console.log('ACTION: NEXT CLICKED');

        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.NEXT_CLICKED, {
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Jouer un son
     */
    playSound(soundName) {
        if (!this.soundEnabled) return;

        try {
            const audio = new Audio(`assets/sounds/${soundName}.mp3`);
            audio.volume = 0.3;
            audio.play().catch(error => {
                console.warn(`SON ${soundName} NON DISPONIBLE:`, error);
            });
        } catch (error) {
            console.warn(`ERREUR SON ${soundName}:`, error);
        }
    }

    /**
     * Configuration range
     */
    setRangeAmount(amount) {
        const rangeAmount = document.getElementById('rangeAmount');
        if (rangeAmount) {
            rangeAmount.value = amount;
            this.updateRangePreview(amount);
        }
    }

    updateRangePreview(amount) {
        const rangeMin = document.getElementById('rangeMin');
        const rangeMax = document.getElementById('rangeMax');

        if (rangeMin && rangeMax && amount) {
            const numAmount = parseFloat(amount);
            const min = (numAmount * 0.95).toFixed(2);
            const max = (numAmount * 1.05).toFixed(2);

            rangeMin.textContent = `$${min}`;
            rangeMax.textContent = `$${max}`;
        }
    }

    saveRangeConfig() {
        const rangeAmount = document.getElementById('rangeAmount');
        if (rangeAmount && rangeAmount.value) {
            const amount = rangeAmount.value;

            // Sauvegarder en localStorage
            localStorage.setItem('boombox_range_config', amount);

            console.log(`CONFIGURATION RANGE SAUVEGARDEE: $${amount}`);

            // Émettre événement
            if (window.BoomboxEvents) {
                window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.RANGE_CONFIG_SAVED, {
                    amount: parseFloat(amount),
                    timestamp: new Date().toISOString()
                });
            }

            this.showSuccess('CONFIGURATION SAUVEGARDEE');
        }
    }

    /**
     * Callbacks événements
     */
    onChainChanged(data) {
        console.log('CHAIN CHANGE:', data);
        this.updatePrices(); // Mettre à jour prix pour nouvelle chain
    }

    onPriceUpdated(data) {
        console.log('PRICE UPDATE:', data);
    }

    /**
     * Affichage messages
     */
    showError(context, message) {
        console.error(`ERREUR ${context}:`, message);
        // Afficher un toast d'erreur avec style rouge
        if (typeof showNotification === 'function') {
            showNotification(`ERREUR ${context} : ${message || 'Une erreur est survenue.'}`, 'error');
        }
    }

    showSuccess(message) {
        console.log('SUCCES:', message);
        // Afficher un toast de succès avec style vert
        if (typeof showNotification === 'function') {
            showNotification(message || 'Opération réussie.', 'success');
        }
    }

    /**
     * Nettoyage
     */
    destroy() {
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
        }

        if (window.BoomboxEvents) {
            window.BoomboxEvents.removeAllListeners();
        }
    }

    // Ajout des méthodes d'update UI (MVP)
    updatePortfolioCard(balances) {
        // Mettre à jour les soldes dans la card portefeuille
        const bnbEl = document.getElementById('balance-bnb');
        const usdtEl = document.getElementById('balance-usdt');
        const cakeEl = document.getElementById('balance-cake');
        const totalEl = document.getElementById('total-value');
        if (bnbEl && balances.BNB) {
            bnbEl.textContent = balances.BNB;
        }
        if (usdtEl && balances.USDT) {
            usdtEl.textContent = balances.USDT;
        }
        if (cakeEl && balances.CAKE) {
            cakeEl.textContent = balances.CAKE;
        }
        if (totalEl && balances.totalValue) {
            totalEl.textContent = '$' + balances.totalValue;
            console.log('[DEBUG] Valeur totale mise à jour:', balances.totalValue);
        }
    }
    updatePositionsCard(positions) {
        // SUPPRIMÉ: affichage du nombre de positions dans la Card 1
        // const posEl = document.getElementById('positions-count');
        // if (posEl && positions && Array.isArray(positions)) {
        //     posEl.textContent = positions.length + ' position(s)';
        // }
    }

    // Appeler ceci lors de la connexion wallet
    onWalletConnected(data) {
        // data doit contenir balances ET positions
        if (data && data.balances) {
            this.updatePortfolioCard(data.balances);
        }
        if (data && data.positions) {
            this.updatePositionsCard(data.positions);
        }
        // TODO: Activer les boutons interactifs
    }
    // Appeler ceci lors de la déconnexion wallet
    onWalletDisconnected() {
        setAllCardsToZero();
        this.updatePositionsCard([]); // Réinitialiser la card positions
        // TODO: Désactiver les boutons interactifs
    }
}

// --- Logo SVG dynamique BOOMBOXSWAP ---
function createBoomboxswapLogo() {
    const logoContainer = document.querySelector('.logo-container');
    if (!logoContainer) return;
    // Créer SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '220');
    svg.setAttribute('height', '40');
    svg.setAttribute('viewBox', '0 0 220 40');
    // Définir les couleurs
    const colors = {
        boom: '#10b981',  // Vert
        box: '#ffffff',   // Blanc
        swap: '#3b82f6'   // Bleu
    };
    // Lettres et leurs positions (espacement réduit, P ajouté)
    const letters = [
        {char: 'B', x: 0, color: 'boom', bitcoin: true},
        {char: 'O', x: 18, color: 'boom'},
        {char: 'O', x: 36, color: 'boom'},
        {char: 'M', x: 54, color: 'boom'},
        {char: 'B', x: 80, color: 'box'},
        {char: 'O', x: 98, color: 'box'},
        {char: 'X', x: 116, color: 'box'},
        {char: 'S', x: 142, color: 'swap', bitcoin: true},
        {char: 'W', x: 160, color: 'swap'},
        {char: 'A', x: 178, color: 'swap'},
        {char: 'P', x: 196, color: 'swap'}
    ];
    // Créer chaque lettre
    letters.forEach(letter => {
        // Texte principal
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', letter.x);
        text.setAttribute('y', '28');
        text.setAttribute('fill', colors[letter.color]);
        text.setAttribute('font-family', 'Inter, sans-serif');
        text.setAttribute('font-weight', '700');
        text.setAttribute('font-size', '24');
        text.textContent = letter.char;
        svg.appendChild(text);
        // Barres Bitcoin horizontales si nécessaire
        if (letter.bitcoin) {
            // Barre du haut
            const topBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            topBar.setAttribute('x', letter.x - 2);
            topBar.setAttribute('y', '6');
            topBar.setAttribute('width', '12');
            topBar.setAttribute('height', '2');
            topBar.setAttribute('fill', colors[letter.color]);
            svg.appendChild(topBar);
            // Barre du bas
            const bottomBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bottomBar.setAttribute('x', letter.x - 2);
            bottomBar.setAttribute('y', '34');
            bottomBar.setAttribute('width', '12');
            bottomBar.setAttribute('height', '2');
            bottomBar.setAttribute('fill', colors[letter.color]);
            svg.appendChild(bottomBar);
        }
    });
    // Remplacer le logo existant
    logoContainer.innerHTML = '';
    logoContainer.appendChild(svg);
}
document.addEventListener('DOMContentLoaded', createBoomboxswapLogo);

// --- Fix WalletConnect Modal Size (injection CSS dans Shadow DOM) ---
function fixWalletConnectModalSize() {
    const interval = setInterval(() => {
        // Cherche le modal WalletConnect (balise custom ou shadow DOM)
        const modal = document.querySelector('wcm-modal, wc-modal, [class*=walletconnect]');
        if (modal && modal.shadowRoot) {
            if (!modal.shadowRoot.getElementById('fix-modal-size')) {
                const style = document.createElement('style');
                style.id = 'fix-modal-size';
                style.textContent = `
                    :host, .wcm-modal-container, .wcm-modal-content {
                        max-width: 380px !important;
                        width: 95vw !important;
                        max-height: 90vh !important;
                        height: auto !important;
                        min-width: 0 !important;
                        min-height: 0 !important;
                        box-sizing: border-box !important;
                    }
                    .wcm-qr-code, .wcm-qr-code canvas, .wcm-qr-code svg {
                        width: 180px !important;
                        height: 180px !important;
                        max-width: 180px !important;
                        max-height: 180px !important;
                        margin: 0 auto !important;
                        display: block !important;
                    }
                `;
                modal.shadowRoot.appendChild(style);
            }
            clearInterval(interval);
        }
    }, 100);
}

// === INTEGRATION EVENEMENTS WALLET ===
// MetaMask
if (window.ethereum && window.ethereum.isMetaMask) {
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts && accounts.length > 0) {
            // Connexion ou changement de compte
            const address = accounts[0];
            try {
                // Appel API balances
                const balancesResp = await fetch(`/api/v1/data/balances/${address}`);
                let balances = {};
                if (balancesResp.ok) {
                    balances = await balancesResp.json();
                }
                // Appel API positions
                let positions = [];
                try {
                    const positionsResp = await fetch(`/api/v1/data/positions/${address}`);
                    if (positionsResp.ok) {
                        positions = await positionsResp.json();
                    }
                } catch (e) { console.error('Erreur récupération positions:', e); }
                console.debug('[DEBUG] Données balances reçues:', balances);
                console.debug('[DEBUG] Données positions reçues:', positions);
                if (window.BoomboxApp && window.BoomboxApp.onWalletConnected) {
                    window.BoomboxApp.onWalletConnected({ balances, positions });
                }
            } catch (e) {
                console.error('Erreur récupération balances:', e);
            }
        } else {
            // Déconnexion
            if (window.BoomboxApp && window.BoomboxApp.onWalletDisconnected) {
                window.BoomboxApp.onWalletDisconnected();
            }
        }
    });
    // Connexion initiale (si déjà connecté)
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
        if (accounts && accounts.length > 0) {
            const address = accounts[0];
            try {
                const balancesResp = await fetch(`/api/v1/data/balances/${address}`);
                let balances = {};
                if (balancesResp.ok) {
                    balances = await balancesResp.json();
                }
                let positions = [];
                try {
                    const positionsResp = await fetch(`/api/v1/data/positions/${address}`);
                    if (positionsResp.ok) {
                        positions = await positionsResp.json();
                    }
                } catch (e) { console.error('Erreur récupération positions:', e); }
                console.debug('[DEBUG] Données balances reçues:', balances);
                console.debug('[DEBUG] Données positions reçues:', positions);
                if (window.BoomboxApp && window.BoomboxApp.onWalletConnected) {
                    window.BoomboxApp.onWalletConnected({ balances, positions });
                }
            } catch (e) { console.error(e); }
        }
    });
}
// WalletConnect (événement custom à adapter selon intégration)
window.addEventListener('walletconnect-connected', async (e) => {
    const address = e.detail && e.detail.address;
    if (address) {
        try {
            const balancesResp = await fetch(`/api/v1/data/balances/${address}`);
            let balances = {};
            if (balancesResp.ok) {
                balances = await balancesResp.json();
            }
            let positions = [];
            try {
                const positionsResp = await fetch(`/api/v1/data/positions/${address}`);
                if (positionsResp.ok) {
                    positions = await positionsResp.json();
                }
            } catch (e) { console.error('Erreur récupération positions:', e); }
            console.debug('[DEBUG] Données balances reçues:', balances);
            console.debug('[DEBUG] Données positions reçues:', positions);
            if (window.BoomboxApp && window.BoomboxApp.onWalletConnected) {
                window.BoomboxApp.onWalletConnected({ balances, positions });
            }
        } catch (e) { console.error(e); }
    }
});
window.addEventListener('walletconnect-disconnected', () => {
    if (window.BoomboxApp && window.BoomboxApp.onWalletDisconnected) {
        window.BoomboxApp.onWalletDisconnected();
    }
});

// === LOGIQUE SÉLECTEUR CHAIN (SOLUTION 24/07/2025) ===
(function() {
    const selector = document.getElementById('chain-selector');
    const menu = document.getElementById('chain-options');
    if (!selector || !menu) return;
    let menuOpen = false;
    // Fonction pour positionner le menu
    function positionMenu() {
        const rect = selector.getBoundingClientRect();
        Object.assign(menu.style, {
            display: 'block',
            position: 'fixed',
            left: rect.left + 'px',
            top: (rect.bottom + window.scrollY) + 'px',
            width: rect.width + 'px',
            minWidth: rect.width + 'px',
            maxWidth: rect.width + 'px',
            zIndex: 2147483647,
        });
    }
    // Fonction pour ouvrir le menu
    function openMenu() {
        if (!document.body.contains(menu)) {
            document.body.appendChild(menu);
        }
        positionMenu();
        menu.style.display = 'block';
        menuOpen = true;
        setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('resize', closeMenu);
            window.addEventListener('scroll', closeMenu, true);
        }, 0);
    }
    // Fonction pour fermer le menu
    function closeMenu() {
        menu.style.display = 'none';
        menuOpen = false;
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', closeMenu);
        window.removeEventListener('scroll', closeMenu, true);
    }
    // Clic extérieur
    function handleClickOutside(e) {
        if (!menu.contains(e.target) && !selector.contains(e.target)) {
            closeMenu();
        }
    }
    // Toggle menu au clic
    selector.addEventListener('click', function(e) {
        e.stopPropagation();
        if (menuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    // Clic sur une option ferme le menu
    menu.addEventListener('click', function(e) {
        if (e.target.classList.contains('chain-option')) {
            closeMenu();
        }
    });
    // Robustesse : fermer le menu si navigation ou DOM modifié
    window.addEventListener('hashchange', closeMenu);
    window.addEventListener('popstate', closeMenu);
    // Initial state
    menu.style.display = 'none';
})();

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    // === AUDIT FRONTEND BOOMSWAP ===
    console.log('=== AUDIT FRONTEND BOOMSWAP ===');
    console.log('DOM loaded:', document.readyState);
    const chainSelectorEl = document.getElementById('chain-selector');
    console.log('ChainSelector element:', chainSelectorEl);
    console.log('Functions defined:', {
        onWalletConnected: typeof window.BoomboxApp?.onWalletConnected,
        updatePortfolioCard: typeof window.BoomboxApp?.updatePortfolioCard
    });
    // Instanciation unique
    if (window.BoomboxApp) {
        console.log('Instance unique BoomboxApp détectée');
    }
    window.BoomboxApp = new BoomboxApp();
    setAllCardsToZero(); // Initialiser toutes les cards à zéro au chargement
    // Appel automatique à chaque ouverture du modal WalletConnect
    // (à placer dans la logique d'ouverture du modal)
    const walletConnectBtn = document.getElementById('walletConnect');
    if (walletConnectBtn) {
        walletConnectBtn.addEventListener('click', () => {
            setTimeout(fixWalletConnectModalSize, 400); // délai pour laisser le modal apparaître
        });
    }
});

// Nettoyer à la fermeture
window.addEventListener('beforeunload', () => {
    if (window.BoomboxApp) {
        window.BoomboxApp.destroy();
    }
});
