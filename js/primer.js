
/* ==========================================
   DONACIONES TAMAYO
   Archivo: js/primer.js
   Contador global con Cloudflare D1
========================================== */

// ==========================================
// 1. CONFIGURACIÓN DE LA API
// ==========================================

const API_URL =
    "https://donaciones-api.luis-tamayo2104.workers.dev";

let guardandoVoto = false;


// ==========================================
// 2. ELEMENTOS HTML
// ==========================================

const donation = document.getElementById("donation");
const donationThanks = document.getElementById("donation-thanks");

const donationHidden = document.getElementById("donation-hidden");
const donationHidden2 = document.getElementById("donation-hidden2");
const donationComplete = document.getElementById("donation-complete");

const accept1 = document.getElementById("accept1");
const decline1 = document.getElementById("decline1");

const accept2 = document.getElementById("accept2");
const decline2 = document.getElementById("decline2");

const accept3 = document.getElementById("accept3");
const decline3 = document.getElementById("decline3");

const restart = document.getElementById("restart");
const restartThanks = document.getElementById("restart-thanks");

const finalTitle = document.getElementById("final-title");
const finalMessage = document.getElementById("final-message");

const dragMessage = document.getElementById("drag-message");
const targetLabel = document.getElementById("target-label");

const confirmationTitle =
    document.getElementById("confirmation-title");

const caja = document.getElementById("drag");

const happyImage = document.getElementById("happy-image");
const happyFallback = document.getElementById("happy-fallback");


// ==========================================
// 3. VARIABLES
// ==========================================

let respuestaPendiente = null;

let arrastrando = false;
let pointerActivo = null;

let inicioX = 0;
let inicioY = 0;

let posicionX = 0;
let posicionY = 0;


// ==========================================
// 4. REGISTRAR VOTO EN CLOUDFLARE
// ==========================================

async function registrarVoto(respuesta) {

    // Evitar solicitudes simultáneas
    if (guardandoVoto) return false;

    guardandoVoto = true;

    try {

        const resultado = await fetch(`${API_URL}/vote`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                respuesta: respuesta
            }),

            cache: "no-store"
        });

        if (!resultado.ok) {
            throw new Error("Error HTTP: " + resultado.status);
        }

        const datos = await resultado.json();

        if (datos.ok !== true) {
            throw new Error("El servidor no confirmó el voto");
        }

        console.log("Respuesta registrada:", respuesta);

        return true;

    } catch (error) {

        console.error("Error al registrar respuesta:", error);

        alert(
            "No se pudo confirmar el registro. " +
            "Revisa tu conexión e inténtalo nuevamente."
        );

        return false;

    } finally {

        guardandoVoto = false;
    }
}


// ==========================================
// 5. MOSTRAR PANTALLAS
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
// 6. MOSTRAR AGRADECIMIENTO
// ==========================================

function agradecerDonacion() {

    mostrarPantalla(donationThanks);
}


// ==========================================
// 7. PRIMERA PANTALLA
// ==========================================

// YES: registrar inmediatamente

accept1.addEventListener("click", async () => {

    if (guardandoVoto) return;

    accept1.disabled = true;
    decline1.disabled = true;

    const registrado = await registrarVoto("yes");

    accept1.disabled = false;
    decline1.disabled = false;

    if (registrado) {
        agradecerDonacion();
    }
});


// NO: avanzar sin registrar todavía

decline1.addEventListener("click", () => {

    if (guardandoVoto) return;

    mostrarPantalla(donationHidden);
});


// ==========================================
// 8. SEGUNDA PANTALLA
// ==========================================

function prepararConfirmacion(respuesta) {

    respuestaPendiente = respuesta;

    const texto = respuesta === "yes"
        ? "YES"
        : "NO";

    confirmationTitle.textContent =
        `Confirma tu respuesta: ${texto}`;

    targetLabel.textContent = texto;

    dragMessage.textContent = "";

    limpiarBotones();
    centrarHamburguesa();

    mostrarPantalla(donationHidden2);
}


// YES: pasar a la hamburguesa
accept2.addEventListener("click", () => {
    prepararConfirmacion("yes");
});


// NO: pasar a la hamburguesa
decline2.addEventListener("click", () => {
    prepararConfirmacion("no");
});


// ==========================================
// 9. BOTÓN OBJETIVO
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
// 10. CENTRAR HAMBURGUESA
// ==========================================

function centrarHamburguesa() {

    posicionX = 0;
    posicionY = 0;

    caja.style.left = "50%";
    caja.style.top = "50%";

    caja.style.transform = "translate(-50%, -50%)";
}


// ==========================================
// 11. DETECTAR BOTÓN
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
// 12. LIMPIAR BOTONES
// ==========================================

function limpiarBotones() {

    accept3.classList.remove("drop-hover");
    decline3.classList.remove("drop-hover");
}


// ==========================================
// 13. CONFIRMAR Y GUARDAR RESPUESTA
// ==========================================

async function confirmarRespuesta() {

    if (!respuestaPendiente || guardandoVoto) return;

    const respuesta = respuestaPendiente;

    dragMessage.textContent = "Guardando respuesta...";

    // Registrar en Cloudflare
    const registrado = await registrarVoto(respuesta);

    if (!registrado) {

        dragMessage.textContent =
            "No se pudo confirmar. Inténtalo nuevamente.";

        return;
    }

    // Mostrar resultado
    if (respuesta === "yes") {

        agradecerDonacion();

    } else {

        finalTitle.textContent = "Entendido";

        finalMessage.textContent =
            "Has confirmado que no deseas donar.";

        mostrarPantalla(donationComplete);
    }
}


// ==========================================
// 14. CLIC DIRECTO EN BOTONES
// ==========================================

function mostrarInstruccion() {

    const texto = respuestaPendiente === "yes"
        ? "YES"
        : "NO";

    dragMessage.textContent =
        `🍔 Arrastra la hamburguesa hasta ${texto}.`;
}

accept3.addEventListener("click", mostrarInstruccion);
decline3.addEventListener("click", mostrarInstruccion);


// ==========================================
// 15. COMENZAR ARRASTRE
// ==========================================

caja.addEventListener("pointerdown", (e) => {

    if (arrastrando || guardandoVoto) return;
    if (!respuestaPendiente) return;

    arrastrando = true;
    pointerActivo = e.pointerId;

    inicioX = e.clientX;
    inicioY = e.clientY;

    caja.setPointerCapture(e.pointerId);

    dragMessage.textContent = "";
});


// ==========================================
// 16. MOVER HAMBURGUESA
// ==========================================

caja.addEventListener("pointermove", (e) => {

    if (!arrastrando) return;
    if (e.pointerId !== pointerActivo) return;

    posicionX = e.clientX - inicioX;
    posicionY = e.clientY - inicioY;

    caja.style.transform =
        `translate(
            calc(-50% + ${posicionX}px),
            calc(-50% + ${posicionY}px)
        )`;

    const boton = obtenerBotonObjetivo();

    const sobreBoton = estaSobreBoton(
        e.clientX,
        e.clientY,
        boton
    );

    limpiarBotones();

    if (sobreBoton && boton) {
        boton.classList.add("drop-hover");
    }
});


// ==========================================
// 17. SOLTAR HAMBURGUESA
// ==========================================

caja.addEventListener("pointerup", (e) => {

    if (!arrastrando) return;
    if (e.pointerId !== pointerActivo) return;

    const boton = obtenerBotonObjetivo();

    const sobreBoton = estaSobreBoton(
        e.clientX,
        e.clientY,
        boton
    );

    arrastrando = false;
    pointerActivo = null;

    limpiarBotones();
    centrarHamburguesa();

    if (sobreBoton) {

        // Guardar solamente al confirmar
        confirmarRespuesta();

    } else {

        mostrarInstruccion();
    }
});


// ==========================================
// 18. CANCELAR ARRASTRE
// ==========================================

caja.addEventListener("pointercancel", () => {

    arrastrando = false;
    pointerActivo = null;

    limpiarBotones();
    centrarHamburguesa();
});


// ==========================================
// 19. REINICIAR APLICACIÓN
// ==========================================

function reiniciarAplicacion() {

    if (guardandoVoto) return;

    respuestaPendiente = null;

    arrastrando = false;
    pointerActivo = null;

    dragMessage.textContent = "";

    limpiarBotones();
    centrarHamburguesa();

    mostrarPantalla(donation);
}

restart.addEventListener("click", reiniciarAplicacion);

restartThanks.addEventListener("click", reiniciarAplicacion);


// ==========================================
// 20. IMAGEN FELIZ ALTERNATIVA
// ==========================================

function mostrarImagenAlternativa() {

    happyImage.hidden = true;
    happyFallback.hidden = false;
}

happyImage.addEventListener(
    "error",
    mostrarImagenAlternativa
);

if (happyImage.complete && happyImage.naturalWidth === 0) {
    mostrarImagenAlternativa();
}


// ==========================================
// 21. INICIALIZACIÓN
// ==========================================

centrarHamburguesa();
mostrarPantalla(donation);
