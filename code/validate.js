function showError(id, message) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = message;
        el.style.display = "block";
    }
}

function clearErrors() {
    document.querySelectorAll(".error-message").forEach(el => {
        el.textContent = "";
        el.style.display = "none";
    });
}

export default function validate(amount, rate, years, months, depositsAdd, adjustRecurrent) {
    clearErrors();

    let valid = true;

    if (isNaN(amount)) {
        showError("amount-error", "Введите сумму");
        valid = false;
    }

    if (isNaN(rate) || rate < 0 || rate > 100) {
        showError("rate-error", "Введите процентную ставку от 0 до 100");
        valid = false;
    }

    if (isNaN(years) || years < 0 || years > 100) {
        showError("years-error", "Введите количество лет от 0 до 100");
        valid = false;
    }

    if (isNaN(months) || months < 0 || months > 11) {
        showError("months-error", "Введите количество месяцев от 0 до 11");
        valid = false;
    }

    if (!depositsAdd && adjustRecurrent) {
        showError("deposits-error", "Введите сумму пополнения");
        valid = false;
    }

    return valid;
}