/*
BOOMBOXSWAP - JavaScript Gaming
Interactions et animations pour l'interface gaming
*/

document.addEventListener('DOMContentLoaded', function() {
    console.log('BOOMBOXSWAP - Interface Gaming Chargée');
    // SUPPRIMÉ : initializeDemoData() appelé inconditionnellement
    // La démo ne doit être appelée que si explicitement demandé (mode démo)
    // initializeDemoData();

    // Bouton principal PLAY
    const musicBtnPrimary = document.querySelector('#play-btn');
    if (musicBtnPrimary) {
        musicBtnPrimary.addEventListener('click', function() {
            console.log('Bouton PLAY cliqué');

            // Effet visuel
            this.classList.add('pulse');
            setTimeout(() => this.classList.remove('pulse'), 500);

            // Afficher les contrôles de navigation
            const navigationControls = document.getElementById('navigation-controls');
            if (navigationControls) {
                navigationControls.style.display = 'block';
                showNotification('Trading démarré - Contrôles activés', 'success');
            }
        });
    }

    // Boutons de navigation
    const musicBtnNav = document.querySelectorAll('.music-btn-nav');
    musicBtnNav.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const action = icon.classList.contains('fa-step-backward') ? 'PREV' : 'NEXT';

            console.log(`Action navigation: ${action}`);

            // Effet visuel
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            showNotification(`Stratégie ${action === 'PREV' ? 'précédente' : 'suivante'}`, 'info');
        });
    });

    // Bouton EJECT
    const musicBtnSecondary = document.querySelector('#eject-btn');
    if (musicBtnSecondary) {
        musicBtnSecondary.addEventListener('click', function() {
            console.log('Bouton EJECT cliqué');

            // Effet visuel
            this.classList.add('pulse');
            setTimeout(() => this.classList.remove('pulse'), 500);

            // Masquer les contrôles de navigation
            const navigationControls = document.getElementById('navigation-controls');
            if (navigationControls) {
                navigationControls.style.display = 'none';
                showNotification('Trading arrêté', 'warning');
            }
        });
    }

    // Boutons pourcentage
    const percentButtons = document.querySelectorAll('.percentage-btn');
    percentButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const percent = this.dataset.percent;
            const input = document.querySelector('#bnb-amount-input');

            if (input) {
                const maxAmount = 1000;
                const amount = (maxAmount * percent) / 100;
                input.value = amount.toFixed(4);

                // Effet visuel
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);

                // Mettre à jour l'estimation
                updateEstimation(amount);

                showNotification(`${percent}% du montant maximum`, 'info');
            }
        });
    });

    // Navigation dots
    const navDots = document.querySelectorAll('.nav-dot');
    navDots.forEach(dot => {
        dot.addEventListener('click', function() {
            const tab = this.dataset.tab;
            const allDots = document.querySelectorAll('.nav-dot');
            allDots.forEach(d => d.classList.remove('active'));
            this.classList.add('active');

            // Effet visuel
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);

            // Changer de contenu
            switchContent(tab);

            showNotification('Navigation changée', 'info');
        });
    });

    // Wallet connect
    const metamaskBtn = document.querySelector('#metamask-btn');
    if (metamaskBtn) {
        metamaskBtn.addEventListener('click', function() {
            this.textContent = 'Connexion...';
            this.style.opacity = '0.7';

            setTimeout(() => {
                this.textContent = 'Wallet Connecté';
                this.style.background = '#00ff88';
                this.style.color = '#1a2332';
                this.classList.add('pulse');
                setTimeout(() => this.classList.remove('pulse'), 1000);

                showNotification('Wallet connecté avec succès', 'success');
            }, 1500);
        });
    }

    // Input BNB amount
    const bnbInput = document.querySelector('#bnb-amount-input');
    if (bnbInput) {
        bnbInput.addEventListener('input', function() {
            const amount = parseFloat(this.value) || 0;
            updateEstimation(amount);
        });
    }

    // Boutons preset range
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const value = this.dataset.value;
            const rangeInput = document.querySelector('#custom-range-input');

            if (rangeInput) {
                rangeInput.value = value;
                updateRangePreview(parseFloat(value));

                // Effet visuel
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);

                showNotification(`Écart défini: ${value}$`, 'info');
            }
        });
    });

    // Bouton sauvegarder range
    const saveRangeBtn = document.querySelector('#save-range-btn');
    if (saveRangeBtn) {
        saveRangeBtn.addEventListener('click', function() {
            const rangeInput = document.querySelector('#custom-range-input');
            const value = rangeInput ? parseFloat(rangeInput.value) : 15;

            // Effet visuel
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            showNotification(`Range sauvegardé: ${value}$`, 'success');

            // Retourner au dashboard
            setTimeout(() => {
                switchContent('dashboard');
                document.querySelector('[data-tab="dashboard"]').classList.add('active');
                document.querySelector('[data-tab="range"]').classList.remove('active');
            }, 1000);
        });
    }

    // Animation des cards au chargement
    const cards = document.querySelectorAll('.smart-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Effets de hover avancés pour les cards
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Animation du prix en temps réel
    const priceMain = document.querySelector('#bnb-price');
    if (priceMain) {
        setInterval(() => {
            // Simulation de changement de prix
            const currentPrice = parseFloat(priceMain.textContent.replace('$', ''));
            const change = (Math.random() - 0.5) * 2; // Changement aléatoire entre -1 et +1
            const newPrice = (currentPrice + change).toFixed(2);
            priceMain.textContent = `$${newPrice}`;

            // Effet de glitch occasionnel
            if (Math.random() < 0.1) { // 10% de chance
                priceMain.classList.add('glitch');
                setTimeout(() => {
                    priceMain.classList.remove('glitch');
                }, 300);
            }
        }, 3000); // Toutes les 3 secondes
    }

    // Effet de scan sur les cards
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('scan-effect');
        });

        card.addEventListener('mouseleave', function() {
            this.classList.remove('scan-effect');
        });
    });
});

// Fonction pour mettre à jour l'estimation
function updateEstimation(bnbAmount) {
    const bnbPrice = 750.36; // Prix simulé
    const usdtAmount = bnbAmount * bnbPrice;
    const totalValue = usdtAmount;

    // Mettre à jour les valeurs d'estimation
    const estBnb = document.querySelector('#est-bnb');
    const estUsdt = document.querySelector('#est-usdt');
    const estTotal = document.querySelector('#est-total');

    if (estBnb) estBnb.textContent = bnbAmount.toFixed(4);
    if (estUsdt) estUsdt.textContent = usdtAmount.toFixed(2);
    if (estTotal) estTotal.textContent = `$${totalValue.toFixed(2)}`;
}

// Fonction pour mettre à jour la prévisualisation du range
function updateRangePreview(spread) {
    const currentPrice = 750.36; // Prix actuel simulé
    const halfSpread = spread / 2;
    const lowerPrice = currentPrice - halfSpread;
    const upperPrice = currentPrice + halfSpread;

    // Mettre à jour les valeurs de prévisualisation
    const currentPricePreview = document.querySelector('#current-price-preview');
    const rangeLower = document.querySelector('#range-lower');
    const rangeUpper = document.querySelector('#range-upper');
    const rangeSpread = document.querySelector('#range-spread');

    if (currentPricePreview) currentPricePreview.textContent = `$${currentPrice.toFixed(2)}`;
    if (rangeLower) rangeLower.textContent = `$${lowerPrice.toFixed(2)}`;
    if (rangeUpper) rangeUpper.textContent = `$${upperPrice.toFixed(2)}`;
    if (rangeSpread) rangeSpread.textContent = `$${spread.toFixed(1)}`;
}

// Fonction pour changer de contenu
function switchContent(tab) {
    const dashboardContent = document.querySelector('#dashboard-content');
    const rangeContent = document.querySelector('#range-content');

    if (tab === 'dashboard') {
        dashboardContent.style.display = 'block';
        rangeContent.style.display = 'none';
    } else if (tab === 'range') {
        dashboardContent.style.display = 'none';
        rangeContent.style.display = 'block';
    }
}

// Fonction pour initialiser les données de démonstration
function initializeDemoData() {
    console.log('Initialisation des données de démonstration...');

    // Données de démonstration pour le portefeuille
    const bnbBalance = document.querySelector('#bnb-balance');
    const usdtBalance = document.querySelector('#usdt-balance');
    const totalValue = document.querySelector('#total-value');

    if (bnbBalance) {
        bnbBalance.textContent = '0.1234';
        console.log('BNB Balance set:', bnbBalance.textContent);
    }
    if (usdtBalance) {
        usdtBalance.textContent = '150.50';
        console.log('USDT Balance set:', usdtBalance.textContent);
    }
    if (totalValue) {
        totalValue.textContent = '$242.85';
        console.log('Total Value set:', totalValue.textContent);
    }

    // Données de démonstration pour les rendements
    const feesGenerated = document.querySelector('#fees-generated');
    const cakeRewards = document.querySelector('#cake-rewards');
    const totalGains = document.querySelector('#total-gains');

    if (feesGenerated) {
        feesGenerated.textContent = '$2.45';
        console.log('Fees Generated set:', feesGenerated.textContent);
    }
    if (cakeRewards) {
        cakeRewards.textContent = '$1.23';
        console.log('CAKE Rewards set:', cakeRewards.textContent);
    }
    if (totalGains) {
        totalGains.textContent = '$3.68';
        console.log('Total Gains set:', totalGains.textContent);
    }

    // Données de démonstration pour l'estimation
    const estBnb = document.querySelector('#est-bnb');
    const estUsdt = document.querySelector('#est-usdt');
    const estTotal = document.querySelector('#est-total');

    if (estBnb) {
        estBnb.textContent = '0.0000';
        console.log('Est BNB set:', estBnb.textContent);
    }
    if (estUsdt) {
        estUsdt.textContent = '0.00';
        console.log('Est USDT set:', estUsdt.textContent);
    }
    if (estTotal) {
        estTotal.textContent = '$0.00';
        console.log('Est Total set:', estTotal.textContent);
    }

    console.log('Données de démonstration initialisées avec succès');
}

// Fonction de notification améliorée
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification-arcade';
    // Supprimer tout emoji du message
    message = message.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '');
    notification.textContent = message;

    // Style BOOMBOXSWAP gaming UX (dark blue, glassmorphism, sobre)
    notification.style.background = 'rgba(26,35,50,0.92)'; // dark blue, semi-transparent
    notification.style.backdropFilter = 'blur(8px)';
    notification.style.fontFamily = 'Inter, Arial, sans-serif';
    notification.style.fontWeight = '600';
    notification.style.fontSize = '1rem';
    notification.style.letterSpacing = '0.01em';
    notification.style.color = '#fff';
    notification.style.borderRadius = '14px';
    notification.style.padding = '1.1rem 2.2rem';
    notification.style.zIndex = '10000';
    notification.style.maxWidth = '350px';
    notification.style.textAlign = 'center';
    notification.style.position = 'fixed';
    notification.style.top = '28px';
    notification.style.right = '32px';
    notification.style.left = '';
    notification.style.bottom = '';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'opacity 0.35s cubic-bezier(.4,1.3,.6,1), transform 0.35s cubic-bezier(.4,1.3,.6,1)';

    // Couleur de bordure et ombre selon le type
    if (type === 'error') {
        notification.style.border = '2px solid #ff4757';
        notification.style.boxShadow = '0 6px 32px rgba(255,71,87,0.12), 0 1.5px 8px rgba(255,71,87,0.18)';
    } else if (type === 'success') {
        notification.style.border = '2px solid #00ff88';
        notification.style.boxShadow = '0 6px 32px rgba(0,255,136,0.12), 0 1.5px 8px rgba(0,255,136,0.18)';
    } else if (type === 'warning') {
        notification.style.border = '2px solid #ffa502';
        notification.style.boxShadow = '0 6px 32px rgba(255,165,2,0.12), 0 1.5px 8px rgba(255,165,2,0.18)';
    } else {
        notification.style.border = '2px solid #4a90e2';
        notification.style.boxShadow = '0 6px 32px rgba(74,144,226,0.10), 0 1.5px 8px rgba(74,144,226,0.18)';
    }

    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 50);

    // Suppression automatique
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 350);
    }, 3000);
}
window.showNotification = showNotification;

// Fonction pour ajouter des effets arcade
function addArcadeEffects() {
    // Ajouter la classe arcade-mode au bouton principal
    const musicBtnPrimary = document.querySelector('.music-btn-primary');
    if (musicBtnPrimary) {
        musicBtnPrimary.classList.add('arcade-mode');
    }

    // Ajouter des effets de bordure arcade aux cards
    const cards = document.querySelectorAll('.smart-card');
    cards.forEach(card => {
        card.classList.add('arcade-border');
    });
}

// Initialiser les effets arcade après le chargement
setTimeout(addArcadeEffects, 1000);
