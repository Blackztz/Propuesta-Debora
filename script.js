/* =========================================
   PROPUESTA DÉBORA
   SISTEMA INTERACTIVO + AUDIO + CAMINATA
========================================= */


/* =========================
   ESCENAS
========================= */

const scenes = [
    document.getElementById("scene1"),
    document.getElementById("scene2"),
    document.getElementById("scene3"),
    document.getElementById("scene4"),
    document.getElementById("scene5")
];

let currentScene = 0;

function showScene(index) {

    if (index < 0 || index >= scenes.length) return;

    scenes.forEach((scene, i) => {

        scene.classList.toggle(
            "active",
            i === index
        );

    });

    currentScene = index;

    if (index === 2) {
        resetBeach();
        startBeachAudio();
    } else {
        stopBeachAudio();
    }

    if (index === 4) {
        playSound("transition");
        createHeartExplosion();
    }
}


/* =========================
   AUDIO
========================= */

const audio = {

    lofi:
        document.getElementById("lofiAudio"),

    ocean:
        document.getElementById("oceanAudio"),

    footsteps:
        document.getElementById("footstepsAudio"),

    airplane:
        document.getElementById("airplaneAudio"),

    letter:
        document.getElementById("letterAudio"),

    click:
        document.getElementById("clickAudio"),

    transition:
        document.getElementById("transitionAudio")

};

let masterVolume = 0.55;
let audioStarted = false;
let muted = false;

function updateVolumes() {

    const musicVolume =
        muted ? 0 : masterVolume;

    audio.lofi.volume =
        musicVolume * 0.32;

    audio.ocean.volume =
        musicVolume * 0.38;

    audio.footsteps.volume =
        musicVolume * 0.65;

    audio.airplane.volume =
        musicVolume * 0.65;

    audio.letter.volume =
        musicVolume * 0.65;

    audio.click.volume =
        musicVolume * 0.45;

    audio.transition.volume =
        musicVolume * 0.6;
}

updateVolumes();


async function startAudio() {

    if (audioStarted) return;

    audioStarted = true;

    updateVolumes();

    try {
        await audio.lofi.play();
    } catch (error) {
        console.log(
            "El navegador bloqueó el audio:",
            error
        );
    }
}


function startBeachAudio() {

    updateVolumes();

    audio.ocean.currentTime = 0;

    audio.ocean.play().catch(() => {});

    scheduleAirplane();
}


function stopBeachAudio() {

    audio.ocean.pause();
    audio.ocean.currentTime = 0;

    stopWalking();
}


function playSound(name) {

    const sound = audio[name];

    if (!sound) return;

    try {

        sound.currentTime = 0;

        sound.play().catch(() => {});

    } catch (error) {
        console.log(error);
    }
}


/* =========================
   CONTROL DE VOLUMEN
========================= */

const volumeSlider =
    document.getElementById(
        "volumeSlider"
    );

const volumeIcon =
    document.getElementById(
        "volumeIcon"
    );

volumeSlider.addEventListener(
    "input",
    () => {

        masterVolume =
            Number(volumeSlider.value) / 100;

        muted = masterVolume === 0;

        updateVolumes();

        volumeIcon.textContent =
            masterVolume === 0
                ? "🔇"
                : masterVolume < .35
                    ? "🔉"
                    : "🔊";
    }
);

volumeIcon.addEventListener(
    "click",
    () => {

        muted = !muted;

        if (muted) {

            updateVolumes();

            volumeIcon.textContent =
                "🔇";

        } else {

            if (masterVolume === 0) {
                masterVolume = .55;
                volumeSlider.value = 55;
            }

            updateVolumes();

            volumeIcon.textContent =
                "🔊";
        }
    }
);


/* =========================
   BOTONES
========================= */

const startBtn =
    document.getElementById(
        "startBtn"
    );

const goBeachBtn =
    document.getElementById(
        "goBeachBtn"
    );

const letterContinue =
    document.getElementById(
        "letterContinue"
    );


startBtn.addEventListener(
    "click",
    async () => {

        await startAudio();

        playSound("click");

        showScene(1);
    }
);


goBeachBtn.addEventListener(
    "click",
    () => {

        playSound("transition");

        showScene(2);
    }
);


letterContinue.addEventListener(
    "click",
    () => {

        playSound("click");

        createHeartExplosion();

        setTimeout(() => {

            showScene(4);

        }, 500);

    }
);


/* =========================
   PLAYA
========================= */

const player =
    document.getElementById("player");

const chair =
    document.getElementById("chair");

const missionText =
    document.getElementById("missionText");

const interactionHint =
    document.getElementById("interactionHint");

const leftBtn =
    document.getElementById("leftBtn");

const rightBtn =
    document.getElementById("rightBtn");


/* =========================
   ESTADO
========================= */

let playerPosition = 18;

let movingLeft = false;
let movingRight = false;

let beachStarted = false;

let letterOpened = false;

let letterOpenPending = false;

let playerSpeed = 0.45;

let lastStepTime = 0;

let airplaneTimer = null;


/* =========================
   POSICIÓN DEL JUGADOR
========================= */

function renderPlayer() {

    player.style.left =
        playerPosition + "%";

}


/* =========================
   REINICIAR PLAYA
========================= */

function resetBeach() {

    beachStarted = true;

    letterOpened = false;

    letterOpenPending = false;

    movingLeft = false;
    movingRight = false;

    playerPosition = 18;

    renderPlayer();

    missionText.textContent =
        "Busca la carta...";

    interactionHint.classList.remove(
        "show"
    );

    stopWalking();

    clearTimeout(airplaneTimer);

    scheduleAirplane();
}


/* =========================
   MOVIMIENTO PRINCIPAL
========================= */

function gameLoop(timestamp) {

    if (
        beachStarted &&
        currentScene === 2
    ) {

        let isMoving = false;


        if (movingLeft) {

            playerPosition -=
                playerSpeed;

            isMoving = true;
        }


        if (movingRight) {

            playerPosition +=
                playerSpeed;

            isMoving = true;
        }


        /* LIMITES */

        if (playerPosition < 5) {
            playerPosition = 5;
        }

        if (playerPosition > 91) {
            playerPosition = 91;
        }


        /* ACTUALIZAR PANTALLA */

        renderPlayer();


        /* CAMINANDO */

        if (isMoving) {

            startWalking();


            if (
                timestamp -
                lastStepTime >
                360
            ) {

                playFootstep();

                lastStepTime =
                    timestamp;
            }

        } else {

            stopWalking();
        }


        checkChairDistance();
    }


    requestAnimationFrame(
        gameLoop
    );
}


requestAnimationFrame(
    gameLoop
);


/* =========================
   CAMINATA
========================= */

function startWalking() {

    player.classList.add(
        "walking"
    );
}


function stopWalking() {

    player.classList.remove(
        "walking"
    );

    /* DETENER FOOTSTEPS INMEDIATAMENTE */
    const sound = audio.footsteps;

    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }
}


function playFootstep() {

    if (
        currentScene !== 2
    ) {
        return;
    }

    const sound =
        audio.footsteps;

    if (!sound) return;

    /* VOLUMEN DE PASOS */
    sound.volume = 0.65;

    sound.currentTime = 0;

    sound.play().catch(
        () => {}
    );
}


/* =========================
   SILLA
========================= */

function checkChairDistance() {

    const chairPosition = 72;

    const distance =
        Math.abs(
            playerPosition -
            chairPosition
        );


    if (distance < 15) {

        interactionHint.classList.add(
            "show"
        );

        missionText.textContent =
            "¡La carta está cerca!";

    } else {

        interactionHint.classList.remove(
            "show"
        );

        missionText.textContent =
            "Busca la carta...";
    }


    if (
        distance < 9 &&
        !letterOpened &&
        !letterOpenPending
    ) {

        letterOpenPending = true;

        missionText.textContent =
            "¡Encontraste la carta! 💌";

        interactionHint.textContent =
            "✨ ¡La encontraste!";

        interactionHint.classList.add(
            "show"
        );

        playSound("letter");


        setTimeout(
            () => {

                openLetter();

            },
            650
        );
    }
}


/* =========================
   ABRIR CARTA
========================= */

function openLetter() {

    if (letterOpened) {
        return;
    }

    letterOpened = true;

    letterOpenPending = false;

    movingLeft = false;
    movingRight = false;

    stopWalking();

    if (
        navigator.vibrate
    ) {

        navigator.vibrate([
            40,
            40,
            80
        ]);
    }

    playSound(
        "transition"
    );

    createHeartExplosion();


    setTimeout(
        () => {

            showScene(3);

        },
        800
    );
}


/* =========================
   TECLADO
========================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            currentScene !== 2 ||
            !beachStarted
        ) {
            return;
        }


        const key =
            event.key.toLowerCase();


        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            movingLeft = true;

            event.preventDefault();

            return;
        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {

            movingRight = true;

            event.preventDefault();

            return;
        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            movingLeft = false;

            event.preventDefault();
        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {

            movingRight = false;

            event.preventDefault();
        }

    }
);


/* =========================
   BOTONES EN PANTALLA
========================= */

function startDirection(
    direction
) {

    if (
        currentScene !== 2
    ) {
        return;
    }


    if (direction === "left") {

        movingLeft = true;
        movingRight = false;

    }


    if (direction === "right") {

        movingRight = true;
        movingLeft = false;

    }


    startWalking();
}


function stopDirection() {

    movingLeft = false;
    movingRight = false;

    stopWalking();
}


/* TOUCH / MOUSE / PEN */

[
    [leftBtn, "left"],
    [rightBtn, "right"]

].forEach(
    ([button, direction]) => {

        button.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                startDirection(
                    direction
                );

            }
        );


        button.addEventListener(
            "pointerup",
            event => {

                event.preventDefault();

                stopDirection();

            }
        );


        button.addEventListener(
            "pointercancel",
            event => {

                event.preventDefault();

                stopDirection();

            }
        );


        button.addEventListener(
            "pointerleave",
            event => {

                event.preventDefault();

                stopDirection();

            }
        );

    }
);


/* =========================
   AVIÓN
========================= */

const plane =
    document.querySelector(
        ".plane"
    );


function scheduleAirplane() {

    clearTimeout(
        airplaneTimer
    );


    const delay =
        7000 +
        Math.random() * 8000;


    airplaneTimer =
        setTimeout(
            () => {

                if (
                    currentScene === 2
                ) {

                    /* AVIÓN MÁS FUERTE */
                    if (audio.airplane) {
                        audio.airplane.volume = 1.0;
                        audio.airplane.currentTime = 0;
                    }

                    playSound(
                        "airplane"
                    );


                    plane.style.animation =
                        "none";


                    void plane.offsetWidth;


                    plane.style.animation =
                        "planeFly 18s linear";


                    setTimeout(
                        () => {

                            plane.style.animation =
                                "planeFly 18s linear infinite";

                        },
                        18000
                    );
                }


                scheduleAirplane();

            },
            delay
        );
}


/* =========================
   FIN DEL SISTEMA PLAYA
========================= */

/* =========================
   PARTICULAS
========================= */

function createParticle() {

    const particle =
        document.createElement(
            "div"
        );

    particle.className =
        "particle";

    particle.style.left =
        Math.random() * 100 + "%";

    particle.style.bottom =
        "-10px";

    particle.style.animationDuration =
        (5 + Math.random() * 7) + "s";

    particle.style.opacity =
        .3 + Math.random() * .7;

    document
        .getElementById("particles")
        .appendChild(particle);


    setTimeout(() => {

        particle.remove();

    }, 13000);
}


setInterval(
    createParticle,
    600
);


/* =========================
   CORAZONES
========================= */

function createHeartExplosion() {

    const hearts = [
        "❤️",
        "💜",
        "💗",
        "💕",
        "💖"
    ];

    for (
        let i = 0;
        i < 22;
        i++
    ) {

        const heart =
            document.createElement(
                "div"
            );

        heart.className =
            "floating-heart";

        heart.textContent =
            hearts[
                Math.floor(
                    Math.random() *
                    hearts.length
                )
            ];

        heart.style.left =
            "50%";

        heart.style.top =
            "50%";

        heart.style.setProperty(
            "--x",
            (
                Math.random() * 500 -
                250
            ) + "px"
        );

        heart.style.setProperty(
            "--y",
            (
                Math.random() * 500 -
                250
            ) + "px"
        );

        document.body.appendChild(
            heart
        );

        setTimeout(() => {

            heart.remove();

        }, 2200);
    }
}


/* =========================
   INICIO
========================= */

window.addEventListener(
    "load",
    () => {

        showScene(0);

        updateVolumes();

    }
);
