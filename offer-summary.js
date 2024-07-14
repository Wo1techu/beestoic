// Globalne zmienne
let offers = [];
let selectedFields = [];
let nazwaFirmy = '';

document.addEventListener('DOMContentLoaded', function() {
    // Pobierz wybrane pola i nazwę firmy z localStorage
    selectedFields = JSON.parse(localStorage.getItem('selectedFields') || '[]');
    nazwaFirmy = localStorage.getItem('nazwaFirmy') || '';
    
    // Inicjalizacja formularza i tabeli
    createDynamicForm();
    initializeTable();
    
    // Dodaj obsługę zdarzeń
    document.getElementById('offerForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
    document.getElementById('generateExcelBtn').addEventListener('click', generateExcel);
    document.getElementById('searchInput').addEventListener('input', filterOffers);
    document.getElementById('sortSelect').addEventListener('change', sortOffers);

    // Wyświetl nazwę firmy
    document.getElementById('nazwaFirmyDisplay').textContent = nazwaFirmy;

    // Dodaj opcje sortowania
    populateSortOptions();
});

function createDynamicForm() {
    const dynamicFields = document.getElementById('dynamicFields');
    selectedFields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-group';
        if (field === 'rekomendacja') {
            fieldDiv.innerHTML = `
                <label for="${field}">${getFieldLabel(field)}</label>
                <input type="range" id="${field}" name="${field}" min="1" max="10" value="5" required>
                <output for="${field}">5 ${getStarRating(5)}</output>
            `;
            const input = fieldDiv.querySelector('input');
            const output = fieldDiv.querySelector('output');
            input.addEventListener('input', function() {
                output.textContent = `${this.value} ${getStarRating(parseInt(this.value))}`;
            });
        } else {
            fieldDiv.innerHTML = `
                <label for="${field}">${getFieldLabel(field)}</label>
                <input type="${getInputType(field)}" id="${field}" name="${field}" required>
            `;
        }
        dynamicFields.appendChild(fieldDiv);
    });
}

function getFieldLabel(fieldId) {
    const fieldLabels = {
        nazwaFirmy: 'Nazwa firmy',
        usluga: 'Usługa',
        kwotaBrutto: 'Kwota brutto',
        rekomendacja: 'Rekomendacja (1-10)',
        iloscGodzinRBH: 'Ilość godzin w RBH',
        iloscDni: 'Ilość dni',
        vat: 'VAT',
        kwotaNetto: 'Kwota netto',
        uwagi: 'Uwagi',
        iloscOsob: 'Ilość osób',
        ilosc: 'Ilość',
        cenaJednostkowa: 'Cena jednostkowa',
        linkDoOferty: 'Link do oferty',
        linkDoStrony: 'Link do strony',
        ocenaMerytoryczna: 'Ocena merytoryczna'
    };
    return fieldLabels[fieldId] || fieldId;
}

function getInputType(fieldId) {
    const numericFields = ['kwotaBrutto', 'kwotaNetto', 'iloscGodzinRBH', 'iloscDni', 'vat', 'iloscOsob', 'ilosc', 'cenaJednostkowa'];
    return numericFields.includes(fieldId) ? 'number' : 'text';
}

function getStarRating(rating) {
    const fullStar = '★';
    const emptyStar = '☆';
    const fullStars = fullStar.repeat(rating);
    const emptyStars = emptyStar.repeat(10 - rating);
    return fullStars + emptyStars;
}

function initializeTable() {
    const table = document.getElementById('offerTable');
    const thead = table.createTHead();
    const row = thead.insertRow();
    selectedFields.forEach(field => {
        const th = document.createElement('th');
        th.textContent = getFieldLabel(field);
        row.appendChild(th);
    });
    const actionsHeader = document.createElement('th');
    actionsHeader.textContent = 'Akcje';
    row.appendChild(actionsHeader);
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const offer = {};
    selectedFields.forEach(field => {
        offer[field] = formData.get(field);
    });
    offers.push(offer);
    updateTable();
    e.target.reset();
    updateRecommendation();
}

function updateTable() {
    const tableBody = document.getElementById('offerTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    offers.forEach((offer, index) => {
        const row = tableBody.insertRow();
        selectedFields.forEach(field => {
            const cell = row.insertCell();
            if (field === 'rekomendacja') {
                cell.textContent = `${offer[field]} ${getStarRating(parseInt(offer[field]))}`;
            } else {
                cell.textContent = offer[field];
            }
        });
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
            <button class="btn btn-small btn-secondary" onclick="editOffer(${index})">Edytuj</button>
            <button class="btn btn-small btn-danger" onclick="deleteOffer(${index})">Usuń</button>
        `;
    });
}

function editOffer(index) {
    const offer = offers[index];
    selectedFields.forEach(field => {
        const input = document.getElementById(field);
        input.value = offer[field];
        if (field === 'rekomendacja') {
            input.nextElementSibling.textContent = `${offer[field]} ${getStarRating(parseInt(offer[field]))}`;
        }
    });
    offers.splice(index, 1);
    updateTable();
    updateRecommendation();
}

function deleteOffer(index) {
    offers.splice(index, 1);
    updateTable();
    updateRecommendation();
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setLanguage("pl");
    doc.setFont("helvetica", "bold");
    doc.text(`Zestawienie ofert dla ${nazwaFirmy}`, 10, 10);
    doc.setFont("helvetica", "normal");
    
    const tableData = offers.map(offer => 
        selectedFields.map(field => 
            field === 'rekomendacja' ? `${offer[field]} ${getStarRating(parseInt(offer[field]))}` : offer[field]
        )
    );
    
    doc.autoTable({
        head: [selectedFields.map(getFieldLabel)],
        body: tableData,
        startY: 20,
        styles: { font: "helvetica", language: "pl" }
    });
    
    doc.save(`zestawienie_ofert_${nazwaFirmy}.pdf`);
}

function generateExcel() {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(offers.map(offer => {
        const newOffer = {...offer};
        if (newOffer.rekomendacja) {
            newOffer.rekomendacja = `${newOffer.rekomendacja} ${getStarRating(parseInt(newOffer.rekomendacja))}`;
        }
        return newOffer;
    }));
    
    // Dodaj nazwę firmy jako pierwszą komórkę
    XLSX.utils.sheet_add_aoa(worksheet, [[`Zestawienie ofert dla ${nazwaFirmy}`]], { origin: "A1" });
    
    // Dostosuj szerokość kolumn
    const cols = Object.keys(offers[0] || {}).map(() => ({ wch: 20 }));
    worksheet['!cols'] = cols;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Zestawienie ofert');
    XLSX.writeFile(workbook, `zestawienie_ofert_${nazwaFirmy}.xlsx`);
}

function filterOffers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredOffers = offers.filter(offer => 
        Object.values(offer).some(value => 
            value.toString().toLowerCase().includes(searchTerm)
        )
    );
    updateTableWithData(filteredOffers);
}

function sortOffers() {
    const sortField = document.getElementById('sortSelect').value;
    if (!sortField) return;
    
    const sortedOffers = [...offers].sort((a, b) => {
        if (getInputType(sortField) === 'number') {
            return parseFloat(a[sortField]) - parseFloat(b[sortField]);
        }
        return a[sortField].localeCompare(b[sortField]);
    });
    updateTableWithData(sortedOffers);
}

function updateTableWithData(data) {
    const tableBody = document.getElementById('offerTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    data.forEach((offer, index) => {
        const row = tableBody.insertRow();
        selectedFields.forEach(field => {
            const cell = row.insertCell();
            if (field === 'rekomendacja') {
                cell.textContent = `${offer[field]} ${getStarRating(parseInt(offer[field]))}`;
            } else {
                cell.textContent = offer[field];
            }
        });
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
            <button class="btn btn-small btn-secondary" onclick="editOffer(${index})">Edytuj</button>
            <button class="btn btn-small btn-danger" onclick="deleteOffer(${index})">Usuń</button>
        `;
    });
}

function updateRecommendation() {
    const recommendationDiv = document.getElementById('recommendation');
    if (offers.length === 0) {
        recommendationDiv.textContent = "Brak ofert do porównania";
        return;
    }
    
    const bestOffer = offers.reduce((best, current) => {
        const currentScore = parseFloat(current.kwotaBrutto) * (11 - parseInt(current.rekomendacja));
        const bestScore = parseFloat(best.kwotaBrutto) * (11 - parseInt(best.rekomendacja));
        return currentScore < bestScore ? current : best;
    });
    
    recommendationDiv.innerHTML = `
        Rekomendowana oferta: ${bestOffer.nazwaFirmy}<br>
        Kwota: ${bestOffer.kwotaBrutto} PLN brutto<br>
        Rekomendacja: ${bestOffer.rekomendacja} ${getStarRating(parseInt(bestOffer.rekomendacja))}
    `;
}

function populateSortOptions() {
    const sortSelect = document.getElementById('sortSelect');
    selectedFields.forEach(field => {
        const option = document.createElement('option');
        option.value = field;
        option.textContent = getFieldLabel(field);
        sortSelect.appendChild(option);
    });
}