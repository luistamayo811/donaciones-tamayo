
/* ==========================================
   DONACIONES TAMAYO
   Archivo: js/primer.js
========================================== */


// ==========================================
// 1. ELEMENTOS HTML
// ==========================================

const donation = document.getElementById("donation");
const donationThanks = document.getElementById("donation-thanks");

const donationHidden = document.getElementById("donation-hidden");
const donationHidden2 = document.getElementById("donation-hidden2");

const donationComplete = document.getElementById("donation-complete");

// Botones de la primera pantalla
const accept1 = document.getElementById("accept1");
const decline1 = document.getElementById("decline1");

// Botones de la segunda pantalla
const accept2 = document.getElementById("accept2");
const decline2 = document.getElementById("decline2");

// Botones de la tercera pantalla
const accept3 = document.getElementById("accept3");
const decline3 = document.getElementById("decline3");

// Botones de reinicio
const restart = document.getElementById("restart");
const restartThanks = document.getElementById("restart-thanks");

// Mensajes
const finalTitle = document.getElementById("final-title");
const finalMessage = document.getElementById("final-message");

const dragMessage = document.getElementById("drag-message");
const targetLabel = document.getElementById("target-label");

const confirmationTitle =
    document.getElementById("confirmation-title");

// Hamburguesa
const caja = document.getElementById("drag");

// Imagen feliz
const happyImage = document.getElementById("happy-image");
const happyFallback = document.getElementById("happy-fallback");


// ==========================================
// 2. VARIABLES
// ==========================================

let respuestaPendiente = null;

// Variables de arrastre
let arrastrando = false;
let pointerActivo = null;

let inicioX = 0;
let inicioY = 0;

let posicionX = 0;
let posicionY = 0;


// ==========================================
// 3. MOSTRAR PANTALLA
// ==========================================

function mostrarPantalla(pantalla) {

    const pantallas = [
        donation,
        donationThanks,
        donationHidden,
        donationHidden2,
        donationComplete
    ];

    pantallas.forEach(elemento => {
        elemento.hidden = elemento !== pantalla;
    });
}


// ==========================================
// 4. PANTALLA DE AGRADECIMIENTO
// ==========================================

function agradecerDonacion() {

    mostrarPantalla(donationThanks);
}


// ==========================================
// 5. PRIMERA PANTALLA
// ==========================================

// Si selecciona YES:
// Mostrar directamente el agradecimiento.

accept1.addEventListener("click", () => {

    agradecerDonacion();

});


// Si selecciona NO:
// Mostrar la segunda pregunta.

decline1.addEventListener("click", () => {

    mostrarPantalla(donationHidden);

});


// ==========================================
// 6. SEGUNDA PANTALLA
// ==========================================

function prepararConfirmacion(respuesta) {

    // Guardar respuesta
    respuestaPendiente = respuesta;

    const texto = respuesta === "yes"
        ? "YES"
        : "NO";

    // Actualizar título
    confirmationTitle.textContent =
        `Confirma tu respuesta: ${texto}`;

    // Actualizar instrucciones
    targetLabel.textContent = texto;

    // Limpiar mensaje
    dragMessage.textContent = "";

    // Limpiar botones
    limpiarBotones();

    // Centrar hamburguesa
    centrarHamburguesa();

    // Mostrar tercera pantalla
    mostrarPantalla(donationHidden2);
}


// YES en la segunda pantalla
accept2.addEventListener("click", () => {

    prepararConfirmacion("yes");

});


// NO en la segunda pantalla
decline2.addEventListener("click", () => {

    prepararConfirmacion("no");

});


// ==========================================
// 7. OBTENER BOTÓN CORRECTO
// ==========================================

function obtenerBotonObjetivo() {

    if (respuestaPendiente === "yes") {
        return accept3;
    }

    if (respuestaPendiente === "no") {
        return decline3;
    }

    return null;
}


// ==========================================
// 8. CENTRAR HAMBURGUESA
// ==========================================

function centrarHamburguesa() {

    posicionX = 0;
    posicionY = 0;

    caja.style.left = "50%";
    caja.style.top = "50%";

    caja.style.transform =
        "translate(-50%, -50%)";
}


// ==========================================
// 9. DETECTAR POSICIÓN DEL BOTÓN
// ==========================================

function estaSobreBoton(x, y, boton) {

    if (!boton) return false;

    const rect = boton.getBoundingClientRect();

    return (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
    );
}


// ==========================================
// 10. LIMPIAR BOTONES
// ==========================================

function limpiarBotones() {

    accept3.classList.remove("drop-hover");
    decline3.classList.remove("drop-hover");
}


// ==========================================
// 11. CONFIRMAR RESPUESTA
// ==========================================

function confirmarRespuesta() {

    if (respuestaPendiente === "yes") {

        // Mostrar niño feliz
        agradecerDonacion();

    } else if (respuestaPendiente === "no") {

        // Mostrar confirmación negativa
        finalTitle.textContent = "Entendido";

        finalMessage.textContent =
            "Has confirmado que no deseas donar.";

        mostrarPantalla(donationComplete);
    }
}


// ==========================================
// 12. CLIC DIRECTO EN BOTONES
// ==========================================

function mostrarInstruccion() {

    const texto = respuestaPendiente === "yes"
        ? "YES"
        : "NO";

    dragMessage.textContent =
        `🍔 Arrastra la hamburguesa hasta ${texto}.`;
}

// No permitir confirmar con clic directo
accept3.addEventListener("click", mostrarInstruccion);
decline3.addEventListener("click", mostrarInstruccion);


// ==========================================
// 13. COMENZAR ARRASTRE
// ==========================================

caja.addEventListener("pointerdown", (e) => {

    if (arrastrando) return;

    if (!respuestaPendiente) return;

    arrastrando = true;

    pointerActivo = e.pointerId;

    // Guardar posición inicial del puntero
    inicioX = e.clientX;
    inicioY = e.clientY;

    // Capturar puntero
    caja.setPointerCapture(e.pointerId);

    dragMessage.textContent = "";

});


// ==========================================
// 14. MOVER HAMBURGUESA
// ==========================================

caja.addEventListener("pointermove", (e) => {

    if (!arrastrando) return;

    if (e.pointerId !== pointerActivo) {
        return;
    }

    // Movimiento desde el punto inicial
    posicionX = e.clientX - inicioX;
    posicionY = e.clientY - inicioY;

    // Mover hamburguesa
    caja.style.transform =
        `translate(
            calc(-50% + ${posicionX}px),
            calc(-50% + ${posicionY}px)
        )`;

    // Obtener botón correcto
    const boton = obtenerBotonObjetivo();

    // Detectar si estamos sobre el botón
    const sobreBoton = estaSobreBoton(
        e.clientX,
        e.clientY,
        boton
    );

    // Iluminar únicamente el botón correcto
    limpiarBotones();

    if (sobreBoton && boton) {

        boton.classList.add("drop-hover");

    }

});


// ==========================================
// 15. SOLTAR HAMBURGUESA
// ==========================================

caja.addEventListener("pointerup", (e) => {

    if (!arrastrando) return;

    if (e.pointerId !== pointerActivo) {
        return;
    }

    // Obtener botón correcto
    const boton = obtenerBotonObjetivo();

    // Verificar dónde soltó
    const sobreBoton = estaSobreBoton(
        e.clientX,
        e.clientY,
        boton
    );

    arrastrando = false;
    pointerActivo = null;

    limpiarBotones();

    // Regresar hamburguesa al centro
    centrarHamburguesa();

    if (sobreBoton) {

        confirmarRespuesta();

    } else {

        mostrarInstruccion();

    }

});


// ==========================================
// 16. CANCELAR ARRASTRE
// ==========================================

caja.addEventListener("pointercancel", () => {

    arrastrando = false;
    pointerActivo = null;

    limpiarBotones();

    centrarHamburguesa();

});


// ==========================================
// 17. REINICIAR APLICACIÓN
// ==========================================

function reiniciarAplicacion() {

    respuestaPendiente = null;

    arrastrando = false;
    pointerActivo = null;

    dragMessage.textContent = "";

    limpiarBotones();

    centrarHamburguesa();

    mostrarPantalla(donation);
}


// Ambos botones comparten la función
restart.addEventListener("click", reiniciarAplicacion);

restartThanks.addEventListener("click", reiniciarAplicacion);


// ==========================================
// 18. ALTERNATIVA DE IMAGEN FELIZ
// ==========================================

// Si happy-kid.jpg no existe,
// se mostrará una carita feliz.

function mostrarImagenAlternativa() {

    happyImage.hidden = true;
    happyFallback.hidden = false;
}

happyImage.addEventListener(
    "error",
    mostrarImagenAlternativa
);

// Detectar si la imagen ya falló al cargar
if (happyImage.complete && happyImage.naturalWidth === 0) {
    mostrarImagenAlternativa();
}


// ==========================================
// 19. INICIALIZAR APLICACIÓN
// ==========================================

centrarHamburguesa();

mostrarPantalla(donation);
