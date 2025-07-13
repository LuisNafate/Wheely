        function handleLogin(event) {
            event.preventDefault();
            // Aquí iría la lógica de autenticación
            alert('Iniciando sesión...');
            // Redirigir a la aplicación principal
            window.location.href = 'mapa.html';
        }

        function goBack() {
            window.location.href = 'index.html';
        }

        // Animación de entrada de los elementos del formulario
        document.addEventListener('DOMContentLoaded', function() {
            const formGroups = document.querySelectorAll('.form-group');
            formGroups.forEach((group, index) => {
                group.style.opacity = '0';
                group.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    group.style.transition = 'all 0.6s ease';
                    group.style.opacity = '1';
                    group.style.transform = 'translateY(0)';
                }, 300 + (index * 100));
            });
        });

        // Función para volver (si es necesario, ajusta según tu navegación)
function goBack() {
    window.history.back();
}

// Función para alternar la visibilidad de la contraseña
function togglePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}

// Función para manejar el inicio de sesión
async function handleLogin(event) {
    event.preventDefault(); // Evitar el envío predeterminado del formulario

    const usernameOrEmail = document.getElementById('usernameOrEmailInput').value;
    const password = document.getElementById('passwordInput').value;
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = ''; // Limpiar mensajes de error anteriores

    // Validación básica (puede ser más robusta)
    if (!usernameOrEmail || !password) {
        errorMessageElement.textContent = 'Por favor, ingresa tu usuario/email y contraseña.';
        return;
    }

    try {
        const response = await fetch('http://localhost:7000/login', { // Reemplaza TU_ENDPOINT_API
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usernameOrEmail: usernameOrEmail,
                password: password,
            }),
        });

        const data = await response.json(); // Analizar la respuesta JSON

        if (response.ok) { // Comprobar si el estado HTTP está entre 200 y 299
            // Inicio de sesión exitoso
            alert('¡Inicio de sesión exitoso!');
            // Almacenar datos del usuario o token (por ejemplo, en localStorage o sessionStorage)
            localStorage.setItem('userToken', data.token); // Suponiendo que tu API devuelve un token
            localStorage.setItem('userName', data.userName); // Suponiendo que tu API devuelve un nombre de usuario
            // Redirigir a una página protegida
            window.location.href = 'dashboard.html'; // Reemplaza con tu página de panel de control real
        } else {
            // Inicio de sesión fallido
            errorMessageElement.textContent = data.message || 'Error en el inicio de sesión. Por favor, verifica tus credenciales.';
            console.error('Inicio de sesión fallido:', data.message);
        }
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        errorMessageElement.textContent = 'Hubo un problema al intentar iniciar sesión. Por favor, inténtalo de nuevo más tarde.';
    }
}