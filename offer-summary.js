document.addEventListener('DOMContentLoaded', function() {
    // Elementy DOM
    const dynamicFields = document.getElementById('dynamicFields');
    const offerForm = document.getElementById('offerForm');
    const offerTable = document.getElementById('offerTable');
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const generateExcelBtn = document.getElementById('generateExcelBtn');
    const generateRecommendationBtn = document.getElementById('generateRecommendationBtn');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    // Zmienne globalne
    let selectedFields = JSON.parse(localStorage.getItem('selectedFields')) || [];
    let offers = [];

    // Inicjalizacja
    initializeForm();
    initializeTable();
    initializeSortOptions();

    // Event Listeners
    offerForm.addEventListener('submit', handleFormSubmit);
    generatePdfBtn.addEventListener('click', generatePDF);
    generateExcelBtn.addEventListener('click', generateExcel);
    generateRecommendationBtn.addEventListener('click', generateRecommendation);
    searchInput.addEventListener('input', filterOffers);
    sortSelect.addEventListener('change', sortOffers);

    function initializeForm() {
        dynamicFields.innerHTML = '';
        selectedFields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'form-group';
            fieldDiv.innerHTML = `
                <label for="${field}">${getFieldLabel(field)}</label>
                <input type="${getFieldType(field)}" id="${field}" name="${field}" required>
            `;
            dynamicFields.appendChild(fieldDiv);
        });
    }

    function initializeTable() {
        const thead = offerTable.querySelector('thead');
        let headerRow = '<tr>';
        selectedFields.forEach(field => {
            headerRow += `<th>${getFieldLabel(field)}</th>`;
        });
        headerRow += '<th>Akcje</th></tr>';
        thead.innerHTML = headerRow;
    }

    function initializeSortOptions() {
        sortSelect.innerHTML = '<option value="">Wybierz pole do sortowania</option>';
        selectedFields.forEach(field => {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = getFieldLabel(field);
            sortSelect.appendChild(option);
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(offerForm);
        const offerData = Object.fromEntries(formData.entries());
        offers.push(offerData);
        updateOfferTable();
        offerForm.reset();
    }

    function updateOfferTable() {
        const tbody = offerTable.querySelector('tbody');
        tbody.innerHTML = '';
        offers.forEach((offer, index) => {
            let row = '<tr>';
            selectedFields.forEach(field => {
                row += `<td>${offer[field]}</td>`;
            });
            row += `<td>
                <button onclick="editOffer(${index})" class="btn btn-small btn-secondary">Edytuj</button>
                <button onclick="deleteOffer(${index})" class="btn btn-small btn-danger">Usuń</button>
            </td></tr>`;
            tbody.innerHTML += row;
        });
    }

    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text('Zestawienie ofertowe', 14, 15);
        doc.autoTable({
            head: [selectedFields.map(getFieldLabel)],
            body: offers.map(offer => selectedFields.map(field => offer[field])),
            startY: 20
        });

        doc.save('zestawienie_ofertowe.pdf');
    }

    function generateExcel() {
        const worksheet = XLSX.utils.json_to_sheet(offers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Zestawienie ofertowe");
        XLSX.writeFile(workbook, "zestawienie_ofertowe.xlsx");
    }

    function generateRecommendation() {
        if (offers.length === 0) {
            alert('Brak ofert do analizy.');
            return;
        }

        const bestOffer = offers.reduce((prev, current) => 
            (parseFloat(prev.kwotaBrutto) < parseFloat(current.kwotaBrutto)) ? prev : current
        );

        alert(`Rekomendowana oferta:\nNazwa firmy: ${bestOffer.nazwaWspolnoty}\nKwota brutto: ${bestOffer.kwotaBrutto} zł`);
    }

    function filterOffers() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredOffers = offers.filter(offer => 
            Object.values(offer).some(value => 
                value.toString().toLowerCase().includes(searchTerm)
            )
        );
        updateOfferTable(filteredOffers);
    }

    function sortOffers() {
        const sortField = sortSelect.value;
        if (sortField) {
            offers.sort((a, b) => {
                if (a[sortField] < b[sortField]) return -1;
                if (a[sortField] > b[sortField]) return 1;
                return 0;
            });
            updateOfferTable();
        }
    }

    function getFieldLabel(fieldId) {
        const fieldLabels = {
            nazwaWspolnoty: 'Nazwa wspólnoty',
            usluga: 'Usługa',
            iloscGodzinRBH: 'Ilość godzin w RBH',
            iloscDni: 'Ilość dni',
            vat: 'VAT',
            kwotaNetto: 'Kwota netto',
            kwotaBrutto: 'Kwota brutto',
            uwagi: 'Uwagi',
            iloscOsob: 'Ilość osób',
            rekomendacja: 'Rekomendacja',
            ilosc: 'Ilość',
            cenaJednostkowa: 'Cena jednostkowa',
            linkDoOferty: 'Link do oferty',
            linkDoStrony: 'Link do strony',
            rekomendacja1_10: 'Rekomendacja 1-10',
            ocenaMerytoryczna: 'Ocena merytoryczna'
        };
        return fieldLabels[fieldId] || fieldId;
    }

    function getFieldType(fieldId) {
        const numberFields = ['iloscGodzinRBH', 'iloscDni', 'vat', 'kwotaNetto', 'kwotaBrutto', 'iloscOsob', 'ilosc', 'cenaJednostkowa', 'rekomendacja1_10', 'ocenaMerytoryczna'];
        const urlFields = ['linkDoOferty', 'linkDoStrony'];

        if (numberFields.includes(fieldId)) return 'number';
        if (urlFields.includes(fieldId)) return 'url';
        return 'text';
    }

    // Funkcje globalne dla edycji i usuwania ofert
    window.editOffer = function(index) {
        const offer = offers[index];
        selectedFields.forEach(field => {
            document.getElementById(field).value = offer[field];
        });
        offers.splice(index, 1);
        updateOfferTable();
    };

    window.deleteOffer = function(index) {
        if (confirm('Czy na pewno chcesz usunąć tę ofertę?')) {
            offers.splice(index, 1);
            updateOfferTable();
        }
    };
});