document.addEventListener('DOMContentLoaded', function() {
    const fieldCheckboxes = document.getElementById('fieldCheckboxes');
    const offerFieldsForm = document.getElementById('offerFieldsForm');
    
    // Lista dostępnych pól
    const availableFields = [
        { id: 'nazwaWspolnoty', label: 'Nazwa wspólnoty' },
        { id: 'usluga', label: 'Usługa' },
        { id: 'iloscGodzinRBH', label: 'Ilość godzin w RBH' },
        { id: 'iloscDni', label: 'Ilość dni' },
        { id: 'vat', label: 'VAT' },
        { id: 'kwotaNetto', label: 'Kwota netto' },
        { id: 'kwotaBrutto', label: 'Kwota brutto' },
        { id: 'uwagi', label: 'Uwagi' },
        { id: 'iloscOsob', label: 'Ilość osób' },
        { id: 'rekomendacja', label: 'Rekomendacja' },
        { id: 'ilosc', label: 'Ilość' },
        { id: 'cenaJednostkowa', label: 'Cena jednostkowa' },
        { id: 'linkDoOferty', label: 'Link do oferty' },
        { id: 'linkDoStrony', label: 'Link do strony' },
        { id: 'rekomendacja1_10', label: 'Rekomendacja 1-10' },
        { id: 'ocenaMerytoryczna', label: 'Ocena merytoryczna' }
    ];

    // Generowanie checkboxów
    availableFields.forEach(field => {
        const checkboxWrapper = document.createElement('label');
        checkboxWrapper.className = 'checkbox-wrapper';
        checkboxWrapper.innerHTML = `
            ${field.label}
            <input type="checkbox" id="${field.id}" name="fields" value="${field.id}">
            <span class="checkmark"></span>
        `;
        fieldCheckboxes.appendChild(checkboxWrapper);
    });

    // Obsługa formularza
    offerFieldsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const selectedFields = Array.from(document.querySelectorAll('input[name="fields"]:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedFields.length === 0) {
            alert('Wybierz co najmniej jedno pole do zestawienia.');
            return;
        }

        // Zapisz wybrane pola i przejdź do tworzenia zestawienia
        localStorage.setItem('selectedFields', JSON.stringify(selectedFields));
        window.location.href = 'offer-summary.html';
    });
});