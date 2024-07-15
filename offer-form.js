// Stan aplikacji
const state = {
    offers: [],
    selectedFields: [],
    nazwaWspolnoty: '',
    usluga: '',
    zestawienieNumer: ''
};

let chart;

// Inicjalizacja strony
document.addEventListener('DOMContentLoaded', initializePage);

function initializePage() {
    loadFormData();
    displayWspolnotaInfo();
    setupEventListeners();
    initializeTable();
    updateChart();
}

// Ładowanie danych
function loadFormData() {
    const formData = JSON.parse(localStorage.getItem('offerFormData') || '{}');
    state.selectedFields = formData.selectedFields || [];
    state.nazwaWspolnoty = formData.nazwaWspolnoty || '';
    state.usluga = formData.usluga || '';
    state.offers = JSON.parse(localStorage.getItem('offers') || '[]');
    state.zestawienieNumer = generateZestawienieNumer();
}

function generateZestawienieNumer() {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${randomNum}/${currentDate}`;
}

// Wyświetlanie informacji o wspólnocie
function displayWspolnotaInfo() {
    document.getElementById('nazwaWspolnotyDisplay').textContent = state.nazwaWspolnoty;
    document.getElementById('uslugaDisplay').textContent = state.usluga;
    document.getElementById('zestawienieNumer').textContent = state.zestawienieNumer;
}

// Ustawienie nasłuchiwaczy zdarzeń
function setupEventListeners() {
    document.getElementById('offerForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
    document.getElementById('generateExcelBtn').addEventListener('click', generateExcel);
    document.getElementById('searchInput').addEventListener('input', filterOffers);
    document.getElementById('sortSelect').addEventListener('change', sortOffers);
}

// Obsługa formularza
function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newOffer = {
        nazwaFirmyWykonawczej: formData.get('nazwaFirmyWykonawczej'),
        kwotaBrutto: parseFloat(formData.get('kwotaBrutto')),
        uwagi: formData.get('uwagi'),
        ocenaMerytoryczna: formData.get('ocenaMerytoryczna')
    };
    state.offers.push(newOffer);
    updateTable();
    updateChart();
    updateRecommendation();
    saveOffers();
    e.target.reset();
}

// Inicjalizacja i aktualizacja tabeli
function initializeTable() {
    const table = document.getElementById('offerTable');
    const thead = table.createTHead();
    const row = thead.insertRow();
    ['Nazwa firmy', 'Kwota brutto', 'Uwagi', 'Ocena merytoryczna', 'Akcje'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        row.appendChild(th);
    });
    updateTable();
}

function updateTable() {
    const tableBody = document.getElementById('offerTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    state.offers.forEach((offer, index) => {
        const row = tableBody.insertRow();
        Object.values(offer).forEach(value => {
            const cell = row.insertCell();
            cell.textContent = value;
        });
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
            <button onclick="editOffer(${index})" class="button">Edytuj</button>
            <button onclick="deleteOffer(${index})" class="button button-danger">Usuń</button>
        `;
    });
}

// Edycja i usuwanie ofert
function editOffer(index) {
    const offer = state.offers[index];
    document.getElementById('nazwaFirmyWykonawczej').value = offer.nazwaFirmyWykonawczej;
    document.getElementById('kwotaBrutto').value = offer.kwotaBrutto;
    document.getElementById('uwagi').value = offer.uwagi;
    document.getElementById('ocenaMerytoryczna').value = offer.ocenaMerytoryczna;
    state.offers.splice(index, 1);
    updateTable();
    updateChart();
    updateRecommendation();
    saveOffers();
}

function deleteOffer(index) {
    state.offers.splice(index, 1);
    updateTable();
    updateChart();
    updateRecommendation();
    saveOffers();
}

// Generowanie raportów
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Dodanie czcionki obsługującej polskie znaki
    doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    doc.setLanguage("pl");
    doc.setFontSize(16);
    doc.text(`Zestawienie ofert nr ${state.zestawienieNumer}`, 10, 20);
    doc.setFontSize(12);
    doc.text(`Wspólnota Mieszkaniowa: ${state.nazwaWspolnoty}`, 10, 30);
    doc.text(`Usługa: ${state.usluga}`, 10, 40);
    
    // Dodanie tabeli ofert
    doc.autoTable({
        head: [['Nazwa firmy', 'Kwota brutto', 'Uwagi', 'Ocena merytoryczna']],
        body: state.offers.map(offer => Object.values(offer)),
        startY: 50,
        styles: { font: 'Roboto', fontSize: 10 },
        headStyles: { fillColor: [25, 118, 210] }
    });

    // Dodanie rekomendacji
    const bestOffer = state.offers.reduce((best, current) => 
        current.kwotaBrutto < best.kwotaBrutto ? current : best
    );

    let finalY = doc.lastAutoTable.finalY || 50;
    finalY += 10;

    doc.setFontSize(14);
    doc.text('Rekomendacja', 10, finalY);
    finalY += 10;
    doc.setFontSize(12);
    doc.text(`Firma: ${bestOffer.nazwaFirmyWykonawczej}`, 10, finalY);
    finalY += 7;
    doc.text(`Kwota: ${bestOffer.kwotaBrutto} PLN brutto`, 10, finalY);
    finalY += 7;
    doc.text(`Ocena: ${bestOffer.ocenaMerytoryczna}`, 10, finalY);

    // Dodanie wykresu na nowej stronie
    if (chart) {
        doc.addPage();
        const chartCanvas = document.getElementById('offerChart');
        const chartImage = chartCanvas.toDataURL('image/png', 1.0);
        doc.addImage(chartImage, 'PNG', 10, 10, 190, 100);
    }
    
    doc.save(`zestawienie_ofert_${state.zestawienieNumer}.pdf`);
}

// Filtrowanie i sortowanie
function filterOffers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredOffers = state.offers.filter(offer => 
        Object.values(offer).some(value => 
            value.toString().toLowerCase().includes(searchTerm)
        )
    );
    updateTableWithData(filteredOffers);
}

function sortOffers() {
    const sortField = document.getElementById('sortSelect').value;
    if (!sortField) return;
    
    const sortedOffers = [...state.offers].sort((a, b) => {
        if (typeof a[sortField] === 'number') {
            return a[sortField] - b[sortField];
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
        Object.values(offer).forEach(value => {
            const cell = row.insertCell();
            cell.textContent = value;
        });
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
            <button onclick="editOffer(${index})" class="button">Edytuj</button>
            <button onclick="deleteOffer(${index})" class="button button-danger">Usuń</button>
        `;
    });
}

// Aktualizacja wykresu
function updateChart() {
    const ctx = document.getElementById('offerChart').getContext('2d');
    const data = {
        labels: state.offers.map(offer => offer.nazwaFirmyWykonawczej),
        datasets: [{
            label: 'Kwota brutto',
            data: state.offers.map(offer => offer.kwotaBrutto),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
        }]
    };

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Aktualizacja rekomendacji
function updateRecommendation() {
    const recommendationDiv = document.getElementById('recommendation');
    if (state.offers.length === 0) {
        recommendationDiv.textContent = "Brak ofert do porównania";
        return;
    }
    
    const bestOffer = state.offers.reduce((best, current) => 
        current.kwotaBrutto < best.kwotaBrutto ? current : best
    );
    
    recommendationDiv.innerHTML = `
        <h3>Rekomendowana oferta:</h3>
        <p><strong>Firma:</strong> ${bestOffer.nazwaFirmyWykonawczej}</p>
        <p><strong>Kwota:</strong> ${bestOffer.kwotaBrutto} PLN brutto</p>
        <p><strong>Ocena:</strong> ${bestOffer.ocenaMerytoryczna}</p>
    `;
}

// Zapisywanie ofert
function saveOffers() {
    localStorage.setItem('offers', JSON.stringify(state.offers));
}