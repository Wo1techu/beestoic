document.addEventListener('DOMContentLoaded', function() {
    const fieldCheckboxes = document.getElementById('fieldCheckboxes');
    const offerFieldsForm = document.getElementById('offerFieldsForm');
    const addNewFieldBtn = document.getElementById('addNewField');
    
    const availableFields = [
        { id: 'nazwaWspolnoty', label: 'Nazwa Wspólnoty Mieszkaniowej', required: true },
        { id: 'usluga', label: 'Usługa', required: true },
        { id: 'kwotaBrutto', label: 'Kwota brutto', required: true },
        { id: 'uwagi', label: 'Uwagi', required: true },
        { id: 'iloscGodzinRBH', label: 'Ilość godzin w RBH' },
        { id: 'iloscDni', label: 'Ilość dni' },
        { id: 'vat', label: 'VAT' },
        { id: 'kwotaNetto', label: 'Kwota netto' },
        { id: 'iloscOsob', label: 'Ilość osób' },
        { id: 'rekomendacja', label: 'Rekomendacja' },
        { id: 'ilosc', label: 'Ilość' },
        { id: 'cenaJednostkowa', label: 'Cena jednostkowa' },
        { id: 'linkDoOferty', label: 'Link do oferty' },
        { id: 'linkDoStrony', label: 'Link do strony' },
        { id: 'ocenaMerytoryczna', label: 'Ocena merytoryczna' }
    ];

    availableFields.forEach(field => {
        addCheckbox(field.id, field.label, field.required);
    });

    addNewFieldBtn.addEventListener('click', function() {
        const newFieldInput = document.getElementById('newField');
        const newFieldName = newFieldInput.value.trim();
        if (newFieldName) {
            const newFieldId = newFieldName.toLowerCase().replace(/\s+/g, '_');
            addCheckbox(newFieldId, newFieldName, false);
            newFieldInput.value = '';
        }
    });

    offerFieldsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const selectedFields = Array.from(document.querySelectorAll('input[name="fields"]:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedFields.length === 0) {
            alert('Wybierz co najmniej jedno pole do zestawienia.');
            return;
        }

        const nazwaWspolnoty = document.getElementById('nazwaWspolnoty').value.trim();
        const usluga = document.getElementById('usluga').value.trim();

        if (!nazwaWspolnoty || !usluga) {
            alert('Podaj nazwę Wspólnoty Mieszkaniowej i Usługę.');
            return;
        }

        const formData = {
            nazwaWspolnoty: nazwaWspolnoty,
            usluga: usluga,
            selectedFields: selectedFields
        };

        localStorage.setItem('offerFormData', JSON.stringify(formData));
        window.location.href = 'offer-form.html';
    });

    function addCheckbox(id, label, required = false) {
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';
        checkboxWrapper.innerHTML = `
            <input type="checkbox" id="${id}" name="fields" value="${id}" ${required ? 'checked disabled' : ''}>
            <label for="${id}">${label}</label>
        `;
        fieldCheckboxes.appendChild(checkboxWrapper);
    }
});