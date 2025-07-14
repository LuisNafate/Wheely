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