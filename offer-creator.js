document.addEventListener('DOMContentLoaded', function() {
    const fieldCheckboxes = document.getElementById('fieldCheckboxes');
    const offerFieldsForm = document.getElementById('offerFieldsForm');
    const nazwaWspolnotyInput = document.getElementById('nazwaWspolnotyInput');
    
    // Lista dostępnych pól
    const availableFields = [
        { id: 'nazwaWspolnoty', label: 'Nazwa Wspólnoty Mieszkaniowej', required: true },
        { id: 'usluga', label: 'Usługa', required: true },
        { id: 'kwotaBrutto', label: 'Kwota brutto', required: true },
        { id: 'rekomendacja', label: 'Rekomendacja (1-10)', required: true },
        { id: 'iloscGodzinRBH', label: 'Ilość godzin w RBH' },
        { id: 'iloscDni', label: 'Ilość dni' },
        { id: 'vat', label: 'VAT' },
        { id: 'kwotaNetto', label: 'Kwota netto' },
        { id: 'uwagi', label: 'Uwagi' },
        { id: 'iloscOsob', label: 'Ilość osób' },
        { id: 'ilosc', label: 'Ilość' },
        { id: 'cenaJednostkowa', label: 'Cena jednostkowa' },
        { id: 'linkDoOferty', label: 'Link do oferty' },
        { id: 'linkDoStrony', label: 'Link do strony' },
        { id: 'ocenaMerytoryczna', label: 'Ocena merytoryczna' }
    ];

    // Generowanie checkboxów
    availableFields.forEach(field => {
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = `checkbox-wrapper ${field.required ? 'required' : ''}`;
        checkboxWrapper.innerHTML = `
            <input type="checkbox" id="${field.id}" name="fields" value="${field.id}" 
                   ${field.required ? 'checked disabled' : ''}>
            <label for="${field.id}">${field.label}</label>
        `;
        fieldCheckboxes.appendChild(checkboxWrapper);

        // Dodaj interaktywność
        const checkbox = checkboxWrapper.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            checkboxWrapper.classList.toggle('checked', this.checked);
        });

        // Ustaw początkowy stan dla wymaganych pól
        if (field.required) {
            checkboxWrapper.classList.add('checked');
        }
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

        const nazwaWspolnoty = nazwaWspolnotyInput.value.trim();
        if (!nazwaWspolnoty) {
            alert('Podaj nazwę Wspólnoty Mieszkaniowej.');
            return;
        }

        // Zapisz wybrane pola i nazwę wspólnoty, i przejdź do następnego kroku
        localStorage.setItem('selectedFields', JSON.stringify(selectedFields));
        localStorage.setItem('nazwaWspolnoty', nazwaWspolnoty);
        window.location.href = 'offer-form.html';
    });
});