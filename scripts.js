// Dodaj ten kod do pliku scripts.js
document.addEventListener('DOMContentLoaded', function() {
    const tiles = document.querySelectorAll('.tile');
    const offeringSection = document.getElementById('offering');
    const dashboard = document.getElementById('dashboard');

    tiles.forEach(tile => {
        tile.addEventListener('click', function() {
            const functionName = this.querySelector('h3').textContent;
            if (functionName === 'Ofertowanie') {
                dashboard.style.display = 'none';
                offeringSection.style.display = 'block';
            }
        });
    });

    const offeringForm = document.getElementById('offeringForm');
    const offersList = document.getElementById('offersList');

    offeringForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const offerHtml = `
            <div class="offer">
                <h3>${formData.get('propertyName')}</h3>
                <p>Powierzchnia: ${formData.get('area')} m²</p>
                <p>Cena: ${formData.get('price')} PLN</p>
                <p>${formData.get('description')}</p>
            </div>
        `;
        offersList.insertAdjacentHTML('afterbegin', offerHtml);
        this.reset();
    });
});