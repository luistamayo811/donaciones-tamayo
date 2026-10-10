
/* ==========================================
   DONACIONES TAMAYO
   Archivo: js/primer.js
   Contador global con Cloudflare D1
========================================== */


// ==========================================
// 1. CONFIGURACIÓN DE CLOUDFLARE
// ==========================================

const API_URL =
    "https://donaciones-api.luis-tamayo2104.workers.dev";


// ==========================================
// 2. ELEMENTOS HTML
// ==========================================

// Pantallas
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

// Elementos de confirmación
const confirmationTitle =
    document.getElementById("confirmation-title");

const targetLabel = document.getElementById("target-label");
const dragMessage = document.getElementById("drag-message");

// Pantalla final
const finalTitle = document.getElementById("final-title");
const finalMessage = document.getElementById("final-message");

// Hamburguesa
const caja = document.getElementById("drag");

// Imagen feliz
const happyImage = document.getElementById("happy-image");
const happyFallback = document.getElementById("happy-fallback");

// Estadísticas
const statsYes = document.getElementById("stats-yes");
const statsNo = document.getElementById("stats-no");
const statsMessage = document.getElementById("stats-message");


// ==========================================
// 3. VARIABLES
// ==========================================

let respuestaPendiente = null;
let guardandoVoto = false;

// Control del arrastre
let arrastrando = false;
let pointerActivo = null;

let inicioX = 0;
let inicioY = 0;

let posicionX = 0;
let posicionY = 0;

// Evitar que una consulta antigua sobrescriba
// estadísticas más recientes
let versionEstadisticas = 0;


// ==========================================
// 4. CARGAR ESTADÍSTICAS
// ==========================================

async function cargarEstadisticas() {

    const version = ++versionEstadisticas;

    statsMessage.textContent = "Actualizando resultados...";

    try {

        const respuesta = await fetch(
            `${API_URL}/stats`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!respuesta.ok) {
            throw new Error(
                `Error HTTP: ${respuesta.status}`
            );
        }

        const datos = await respuesta.json();

        // Comprobar que los datos sean válidos
        if (
            !Number.isSafeInteger(datos.yes) ||
            !Number.isSafeInteger(datos.no) ||
            datos.yes < 0 ||
            datos.no < 0
        ) {
            throw new Error("Estadísticas inválidas");
        }

        // Ignorar consultas anteriores
        if (version !== versionEstadisticas) {
            return;
        }

        // Mostrar cantidades
        statsYes.textContent =
            datos.yes.toLocaleString("es-MX");

        statsNo.textContent =
            datos.no.toLocaleString("es-MX");

        statsMessage.textContent =
            "Resultados globales actualizados";

    } catch (error) {

        if (version !== versionEstadisticas) {
            return;
        }

        console.error(
            "Error al cargar estadísticas:",
            error
        );

        statsMessage.textContent =
            "No se pudieron cargar los resultados.";
    }
}


// ==========================================
// 5. REGISTRAR UN VOTO
// ==========================================

async function registrarVoto(respuesta) {

    // Evitar guardar dos votos simultáneos
    if (guardandoVoto) {
        return false;
    }

    if (respuesta !== "yes" && respuesta !== "no") {
        return false;
    }

    guardandoVoto = true;

    try {

        const resultado = await fetch(
            `${API_URL}/vote`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    respuesta: respuesta
                }),

                cache: "no-store"
            }
        );

        if (!resultado.ok) {
            throw new Error(
                `Error HTTP: ${resultado.status}`
            );
        }

        const datos = await resultado.json();

        if (datos.ok !== true) {
            throw new Error(
                "El servidor no confirmó el voto"
            );
        }

        console.log(
            "Voto registrado correctamente:",
            respuesta
        );

        // Actualizar el contador automáticamente
        cargarEstadisticas();

        return true;

    } catch (error) {

        console.error(
            "Error al registrar voto:",
            error
        );

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
// 6. NAVEGACIÓN ENTRE PANTALLAS
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
// 7. MOSTRAR AGRADECIMIENTO
// ==========================================

function agradecerDonacion() {

    mostrarPantalla(donationThanks);
}


// ==========================================
// 8. PRIMERA PANTALLA
// ==========================================

// YES: registrar directamente el voto

accept1.addEventListener("click", async () => {

    if (guardandoVoto) {
        return;
    }

    // Deshabilitar mientras se guarda
    accept1.disabled = true;
    decline1.disabled = true;

    const registrado = await registrarVoto("yes");

    accept1.disabled = false;
    decline1.disabled = false;

    if (registrado) {
        agradecerDonacion();
    }
});


// NO: mostrar segunda pregunta sin votar

decline1.addEventListener("click", () => {

    if (guardandoVoto) {
        return;
    }

    mostrarPantalla(donationHidden);
});


// ==========================================
// 9. PREPARAR CONFIRMACIÓN
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


// YES EN LA SEGUNDA PANTALLA

accept2.addEventListener("click", () => {

    prepararConfirmacion("yes");
});


// NO EN LA SEGUNDA PANTALLA

decline2.addEventListener("click", () => {

    prepararConfirmacion("no");
});


// ==========================================
// 10. OBTENER BOTÓN CORRECTO
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
// 11. CENTRAR HAMBURGUESA
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
// 12. DETECTAR POSICIÓN SOBRE UN BOTÓN
// ==========================================

function estaSobreBoton(x, y, boton) {

    if (!boton) {
        return false;
    }

    const rect = boton.getBoundingClientRect();

    return (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
    );
}


// ==========================================
// 13. LIMPIAR EFECTOS DE BOTONES
// ==========================================

function limpiarBotones() {

    accept3.classList.remove("drop-hover");
    decline3.classList.remove("drop-hover");
}


// ==========================================
// 14. CONFIRMAR RESPUESTA
// ==========================================

async function confirmarRespuesta() {

    if (!respuestaPendiente || guardandoVoto) {
        return;
    }

    const respuesta = respuestaPendiente;

    dragMessage.textContent =
        "Guardando respuesta...";

    // Enviar voto a Cloudflare
    const registrado = await registrarVoto(respuesta);

    if (!registrado) {

        dragMessage.textContent =
            "No se pudo registrar. Inténtalo nuevamente.";

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
// 15. EVITAR CONFIRMACIÓN CON CLIC
// ==========================================

function mostrarInstruccion() {

    const texto = respuestaPendiente === "yes"
        ? "YES"
        : "NO";

    dragMessage.textContent =
        `🍔 Arrastra la hamburguesa hasta ${texto}.`;
}

accept3.addEventListener(
    "click",
    mostrarInstruccion
);

decline3.addEventListener(
    "click",
    mostrarInstruccion
);


// ==========================================
// 16. INICIAR ARRASTRE
// ==========================================

caja.addEventListener("pointerdown", (e) => {

    if (arrastrando || guardandoVoto) {
        return;
    }

    if (!respuestaPendiente) {
        return;
    }

    arrastrando = true;
    pointerActivo = e.pointerId;

    inicioX = e.clientX;
    inicioY = e.clientY;

    caja.setPointerCapture(e.pointerId);

    dragMessage.textContent = "";
});


// ==========================================
// 17. MOVER HAMBURGUESA
// ==========================================

caja.addEventListener("pointermove", (e) => {

    if (!arrastrando) {
        return;
    }

    if (e.pointerId !== pointerActivo) {
        return;
    }

    posicionX = e.clientX - inicioX;
    posicionY = e.clientY - inicioY;

    // Actualizar posición visual
    caja.style.transform =
        `translate(
            calc(-50% + ${posicionX}px),
            calc(-50% + ${posicionY}px)
        )`;

    // Detectar el botón correcto
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
// 18. SOLTAR HAMBURGUESA
// ==========================================

caja.addEventListener("pointerup", (e) => {

    if (!arrastrando) {
        return;
    }

    if (e.pointerId !== pointerActivo) {
        return;
    }

    const boton = obtenerBotonObjetivo();

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

        // Confirmar y registrar voto
        confirmarRespuesta();

    } else {

        mostrarInstruccion();
    }
});


// ==========================================
// 19. CANCELAR ARRASTRE
// ==========================================

caja.addEventListener("pointercancel", () => {

    arrastrando = false;
    pointerActivo = null;

    limpiarBotones();
    centrarHamburguesa();
});


// ==========================================
// 20. REINICIAR APLICACIÓN
// ==========================================

function reiniciarAplicacion() {

    if (guardandoVoto) {
        return;
    }

    respuestaPendiente = null;

    arrastrando = false;
    pointerActivo = null;

    dragMessage.textContent = "";

    limpiarBotones();
    centrarHamburguesa();

    mostrarPantalla(donation);
}

restart.addEventListener(
    "click",
    reiniciarAplicacion
);

restartThanks.addEventListener(
    "click",
    reiniciarAplicacion
);


// ==========================================
// 21. IMAGEN FELIZ ALTERNATIVA
// ==========================================

function mostrarImagenAlternativa() {

    happyImage.hidden = true;
    happyFallback.hidden = false;
}

happyImage.addEventListener(
    "error",
    mostrarImagenAlternativa
);

if (
    happyImage.complete &&
    happyImage.naturalWidth === 0
) {
    mostrarImagenAlternativa();
}


// ==========================================
// 22. INICIALIZAR APLICACIÓN
// ==========================================

// Centrar hamburguesa
centrarHamburguesa();

// Mostrar pantalla inicial
mostrarPantalla(donation);

// Consultar los votos reales de Cloudflare
cargarEstadisticas();
