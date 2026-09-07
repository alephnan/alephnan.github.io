(() => {
    const form = document.getElementById('contact-form');
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    function sanitizeSingleLine(value) {
        return value
            .replace(/[\u0000-\u001F\u007F]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function stripControlChars(value) {
        return value
            .replace(/[\u0000-\u001F\u007F]+/g, '')
            .trim();
    }

    function sanitizeMessage(value) {
        return value
            .replace(/\r\n|\r/g, '\n')
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function sanitizeVisibleFields() {
        if (!form) return;

        const sanitizers = {
            name: sanitizeSingleLine,
            email: stripControlChars,
            subject: sanitizeSingleLine,
            message: sanitizeMessage
        };

        Object.entries(sanitizers).forEach(([fieldName, sanitizer]) => {
            const field = form.elements[fieldName];
            if (!field) return;
            field.value = sanitizer(field.value);
        });
    }

    if (form) {
        ['name', 'email', 'subject', 'message'].forEach((fieldName) => {
            const field = form.elements[fieldName];
            if (!field) return;

            field.addEventListener('blur', sanitizeVisibleFields);
        });

        form.addEventListener('submit', function(e) {
            sanitizeVisibleFields();

            if (!form.checkValidity()) {
                e.preventDefault();
                form.reportValidity();
                return;
            }

            if (isLocalhost) {
                e.preventDefault();

                const formData = new FormData(form);

                fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(() => {
                    window.location.href = form.elements._next.value;
                })
                .catch(error => {
                    console.error('Error:', error);
                    const errorEl = document.getElementById('form-error');
                    if (errorEl) errorEl.hidden = false;
                });
            }
        });
    }
})();
