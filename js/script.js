/* =========================================================
   ELEMENTS
   ========================================================= */

const scene =
  document.querySelector('#scene');

const cat =
  document.querySelector('#cat');

const stage =
  document.querySelector('#stage');

const cursorMark =
  document.querySelector('#cursorMark');

const pupils = [
  ...document.querySelectorAll('.cat-pupil')
];


/* =========================================================
   EYES
   ========================================================= */

const eyes = [
  {
    white: document.querySelector('.cat-left-eye'),
    pupil: document.querySelector('.cat-pupil-left'),
    x: 0,
    y: 0
  },
  {
    white: document.querySelector('.cat-right-eye'),
    pupil: document.querySelector('.cat-pupil-right'),
    x: 0,
    y: 0
  }
];

const lookTarget = { x: null, y: null };

const FULL_LOOK_DISTANCE = 220;

const EYE_EASING = 0.22;

const EYE_MARGIN = 1;

function updateEyes() {

  eyes.forEach((eye) => {

    const w = eye.white.offsetWidth;
    const h = eye.white.offsetHeight;
    const r = eye.pupil.offsetWidth / 2;

    const rangeX = Math.max(0, w / 2 - r - EYE_MARGIN);
    const rangeY = Math.max(0, h / 2 - r - EYE_MARGIN);

    let goalX = 0;
    let goalY = 0;

    if (lookTarget.x !== null) {

      const box = eye.white.getBoundingClientRect();

      const dx = lookTarget.x - (box.left + box.width / 2);
      const dy = lookTarget.y - (box.top + box.height / 2);

      const dist = Math.hypot(dx, dy);

      if (dist > 0.001) {

        const strength = Math.min(
          1,
          dist / (FULL_LOOK_DISTANCE * currentScale)
        );

        const eased = strength * strength * (3 - 2 * strength);

        goalX = (dx / dist) * rangeX * eased;
        goalY = (dy / dist) * rangeY * eased;
      }
    }

    eye.x += (goalX - eye.x) * EYE_EASING;
    eye.y += (goalY - eye.y) * EYE_EASING;

    eye.pupil.style.transform =
      `translate(${eye.x.toFixed(2)}px, ${eye.y.toFixed(2)}px)`;
  });

  requestAnimationFrame(updateEyes);
}

updateEyes();


/* =========================================================
   DESIGN SIZE
   ========================================================= */

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

/* Width of the important content (title + playground), used on narrow screens */
const CONTENT_WIDTH = 1250;


/* =========================================================
   DRAGGING
   ========================================================= */

let draggingCursor = false;


/* =========================================================
   FIT THE DESIGN TO THE VIEWPORT
   ========================================================= */

let currentScale = 1;
let stageOffsetX = 0;
let stageOffsetY = 0;
let sceneWidth = DESIGN_WIDTH;
let sceneHeight = DESIGN_HEIGHT;

function fitDesignFrame() {

  const vw = window.innerWidth;
  const vh = window.innerHeight;


  const fullScale = Math.min(
    vw / DESIGN_WIDTH,
    vh / DESIGN_HEIGHT
  );

  const contentScale = Math.min(
    vw / CONTENT_WIDTH,
    vh / DESIGN_HEIGHT
  );

  currentScale = Math.max(fullScale, contentScale);

  sceneWidth  = vw / currentScale;
  sceneHeight = vh / currentScale;

  scene.style.width  = `${sceneWidth}px`;
  scene.style.height = `${sceneHeight}px`;
  scene.style.transform = `scale(${currentScale})`;

  stageOffsetX = (sceneWidth  - DESIGN_WIDTH)  / 2;

  stageOffsetY = Math.min(
    0,
    (sceneHeight - DESIGN_HEIGHT) / 2
  );

  const spare = Math.max(0, sceneHeight - DESIGN_HEIGHT);

  const PLAYGROUND_WIDTH  = 979;
  const PLAYGROUND_HEIGHT = 650;
  const CAT_HEIGHT        = 358;

  const maxGrow =
    (Math.min(sceneWidth, DESIGN_WIDTH) - 150) / PLAYGROUND_WIDTH;

  const wanted = 1 + (spare * 0.7) / PLAYGROUND_HEIGHT;

  const grow = Math.max(1, Math.min(maxGrow, wanted));

  const catGrow = Math.min(
    2.2,
    Math.max(
      1,
      1 + (((PLAYGROUND_HEIGHT * wanted) / grow) - PLAYGROUND_HEIGHT)
          / CAT_HEIGHT
    )
  );

  const boxExtra = CAT_HEIGHT * (catGrow - 1);

  const growExtra =
    (PLAYGROUND_HEIGHT + boxExtra) * grow - PLAYGROUND_HEIGHT;

  stage.style.setProperty('--grow', grow);
  stage.style.setProperty('--cat-grow', catGrow);
  stage.style.setProperty('--box-extra', `${boxExtra}px`);
  stage.style.setProperty('--grow-extra', `${growExtra}px`);
  stage.style.setProperty('--shift', `${Math.max(0, spare - growExtra) / 2}px`);

  document.documentElement.style.setProperty('--ui-scale', currentScale);

  stage.style.left = `${stageOffsetX}px`;
  stage.style.top  = `${stageOffsetY}px`;
}


fitDesignFrame();


window.addEventListener(
  'resize',
  fitDesignFrame
);


/* =========================================================
   START DRAGGING
   ========================================================= */

cursorMark.addEventListener(
  'pointerdown',
  (event) => {

    draggingCursor = true;

    cursorMark.setPointerCapture(
      event.pointerId
    );

    event.preventDefault();
  }
);


/* =========================================================
   STOP DRAGGING
   ========================================================= */

cursorMark.addEventListener(
  'pointerup',
  (event) => {

    draggingCursor = false;

    if (
      cursorMark.hasPointerCapture(
        event.pointerId
      )
    ) {

      cursorMark.releasePointerCapture(
        event.pointerId
      );
    }
  }
);


/* =========================================================
   CANCEL DRAGGING
   ========================================================= */

cursorMark.addEventListener(
  'pointercancel',
  () => {

    draggingCursor = false;
  }
);


/* =========================================================
   MOVE CURSOR
   ========================================================= */

window.addEventListener(
  'pointermove',
  (event) => {

    if (!draggingCursor) {
      return;
    }

    let x =
      event.clientX / currentScale - stageOffsetX;

    let y =
      event.clientY / currentScale - stageOffsetY;


    x -= 55;
    y -= 58;


    /* -----------------------------------------
       Keep cursor inside the whole viewport
       ----------------------------------------- */

    x = Math.max(
      -stageOffsetX,
      Math.min(
        sceneWidth - stageOffsetX - 110,
        x
      )
    );


    y = Math.max(
      -stageOffsetY,
      Math.min(
        sceneHeight - stageOffsetY - 116,
        y
      )
    );


    /* -----------------------------------------
       Move cursor
       ----------------------------------------- */

    cursorMark.style.left =
      `${x}px`;

    cursorMark.style.top =
      `${y}px`;


    /* =================================================
       CAT EYES FOLLOW CURSOR
       ================================================= */


    const cursorCenterX =
      (x + stageOffsetX + 55) * currentScale;

    const cursorCenterY =
      (y + stageOffsetY + 58) * currentScale;


  

    const catBounds =
      cat.getBoundingClientRect();


    lookTarget.x = cursorCenterX;
    lookTarget.y = cursorCenterY;


    /* =================================================
       HAPPY CAT
       The cat is happy while the dragged cursor is
       hovering over it.
       ================================================= */

    const hoveringCat =
      cursorCenterX >= catBounds.left &&
      cursorCenterX <= catBounds.right &&
      cursorCenterY >= catBounds.top &&
      cursorCenterY <= catBounds.bottom;

    if (!hoveringCat) {
      afterFeed = false;
    }

    cat.classList.toggle(
      'is-happy',
      (hoveringCat && !afterFeed) || isFed
    );

  }
);


/* =========================================================
   HOLD HINT + HEARTS
   ========================================================= */

const HOLD_DELAY = 900;  /* ms the cursor must be held on the cat (change me) */

let holdTimer = null;
let stayAngry = false;
let afterFeed = false; /* cursor still on the cat after he ate: stay normal until it leaves */
let isFed = false;   /* true for a moment after the cat eats the fish */

function cancelHold() {

  clearTimeout(holdTimer);
  holdTimer = null;
}

function updateHold() {

  const c = cursorMark.getBoundingClientRect();
  const k = cat.getBoundingClientRect();

  const px = c.left + c.width / 2;
  const py = c.top + c.height / 2;

  const overCat =
    px >= k.left && px <= k.right &&
    py >= k.top  && py <= k.bottom;

  const u = (px - k.left) / k.width;
  const v = (py - k.top) / k.height;

  const overHead =
    overCat &&
    u >= 0.17 && u <= 0.68 &&
    v >= 0.03 && v <= 0.46;

  const ux = u * 293;
  const vy = v * 358;

  const onStomach =
    ux >= 105 && ux <= 149 &&
    vy >= 188 && vy <= 320;

  if (!overCat) {
    afterFeed = false;
  }

  if (overCat && onStomach && !isFed && !afterFeed) {
    stayAngry = true;
  }

  const angry = stayAngry;

  cat.classList.toggle('is-angry', angry);

  const holding = overCat && draggingCursor && !angry && !afterFeed;

  if (!holding && !isFed) {
    cancelHold();
    cat.classList.remove('is-petting');
  }

  const petting = cat.classList.contains('is-petting');

  cat.classList.toggle('is-over-head', overHead && !petting && !angry && !isFed && !afterFeed);

  syncFish();

  if (holding && !petting && !holdTimer) {

    holdTimer = setTimeout(() => {

      holdTimer = null;

      cat.classList.add('is-petting');
      cat.classList.remove('is-over-head');

    }, HOLD_DELAY);
  }
}

window.addEventListener('pointermove', updateHold);
cursorMark.addEventListener('pointerdown', updateHold);
window.addEventListener('pointerup', updateHold);
window.addEventListener('pointercancel', updateHold);
window.addEventListener('resize', updateHold);


/* =========================================================
   FISH
   ========================================================= */

const fish = document.querySelector('#fish');

const FISH_W = 130;
const FISH_H = 70;
const FED_TIME = 2000;   /* ms the cat stays happy after eating (change me) */

let draggingFish = false;
let carryingFish = false;

let fishSpot = { fx: 0.12, fy: 0.62 };

function pickFishSpot() {

  const box = document.querySelector('.playground').getBoundingClientRect();
  const k = cat.getBoundingClientRect();

  const halfW = (FISH_W / 2) * currentScale;
  const halfH = (FISH_H / 2) * currentScale;
  const pad = 14 * currentScale;
  const gap = 16 * currentScale;

  const left  = { min: box.left + halfW + pad,  max: k.left  - halfW - gap };
  const right = { min: k.right + halfW + gap,    max: box.right - halfW - pad };

  const sides = [left, right].filter((s) => s.max > s.min);

  let cx;

  if (sides.length) {
    const s = sides[Math.floor(Math.random() * sides.length)];
    cx = s.min + Math.random() * (s.max - s.min);
  } else {
    cx = box.left + halfW + pad;
  }

  const yMin = Math.max(k.top + k.height * 0.1, box.top + halfH + pad);
  const yMax = Math.min(k.bottom - halfH, box.bottom - halfH - pad);
  const cy = yMax > yMin ? yMin + Math.random() * (yMax - yMin) : yMin;

  fishSpot = {
    fx: (cx - box.left) / box.width,
    fy: (cy - box.top) / box.height
  };
}

function fishHome() {

  const box = document.querySelector('.playground').getBoundingClientRect();

  return {
    cx: box.left + fishSpot.fx * box.width,
    cy: box.top  + fishSpot.fy * box.height
  };
}

function placeFish(cx, cy) {

  fish.style.left = `${cx / currentScale - stageOffsetX - FISH_W / 2}px`;
  fish.style.top  = `${cy / currentScale - stageOffsetY - FISH_H / 2}px`;
}

function fishCenter() {

  const r = fish.getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
}

let fishShown = false;

function syncFish() {

  const want = stayAngry && !isFed;

  if (want === fishShown) {
    return;
  }

  fishShown = want;

  if (want) {
    pickFishSpot();
    const h = fishHome();
    fish.classList.remove('is-eaten', 'is-returning');
    placeFish(h.cx, h.cy);
    fish.classList.add('is-visible');
  } else {
    fish.classList.remove('is-visible', 'is-dragging');
  }
}

function updateFishOver() {

  const holding = carryingFish || draggingFish;

  let over = false;

  if (holding) {
    const f = fishCenter();
    const k = cat.getBoundingClientRect();
    over =
      f.cx >= k.left && f.cx <= k.right &&
      f.cy >= k.top  && f.cy <= k.bottom;
  }

  cat.classList.toggle('fish-over', over);
}

function returnFish() {

  const h = fishHome();
  fish.classList.add('is-returning');
  placeFish(h.cx, h.cy);

  setTimeout(() => fish.classList.remove('is-returning'), 450);
}

function feedCat() {

  /* gulp: fish shrinks toward the cat's mouth */
  const k = cat.getBoundingClientRect();
  fish.classList.add('is-eaten');
  fish.classList.remove('is-dragging');
  placeFish(k.left + k.width * 0.42, k.top + k.height * 0.36);

  isFed = true;
  stayAngry = false;

  cat.classList.remove('is-angry');
  cat.classList.add('is-happy', 'is-fed', 'is-petting');

  updateHold();

  setTimeout(() => {

    isFed = false;

    cat.classList.remove('is-fed', 'is-petting');

    const c = cursorMark.getBoundingClientRect();
    const kk = cat.getBoundingClientRect();
    const px = c.left + c.width / 2;
    const py = c.top + c.height / 2;

    afterFeed =
      px >= kk.left && px <= kk.right && py >= kk.top && py <= kk.bottom;

    cat.classList.remove('is-happy');

    updateHold();

  }, FED_TIME);
}

fish.addEventListener('pointerdown', (event) => {

  draggingFish = true;

  fish.classList.remove('is-returning');
  fish.classList.add('is-dragging');
  fish.setPointerCapture(event.pointerId);

  event.preventDefault();
});

fish.addEventListener('pointermove', (event) => {

  if (!draggingFish) {
    return;
  }

  let x = event.clientX / currentScale - stageOffsetX - FISH_W / 2;
  let y = event.clientY / currentScale - stageOffsetY - FISH_H / 2;

  x = Math.max(-stageOffsetX, Math.min(sceneWidth  - stageOffsetX - FISH_W, x));
  y = Math.max(-stageOffsetY, Math.min(sceneHeight - stageOffsetY - FISH_H, y));

  fish.style.left = `${x}px`;
  fish.style.top  = `${y}px`;

  /* the eyes follow the fish too */
  lookTarget.x = event.clientX;
  lookTarget.y = event.clientY;

  updateFishOver();
});

function dropFish(event) {

  if (!draggingFish) {
    return;
  }

  draggingFish = false;
  fish.classList.remove('is-dragging');
  cat.classList.remove('fish-over');

  if (fish.hasPointerCapture(event.pointerId)) {
    fish.releasePointerCapture(event.pointerId);
  }

  const f = fishCenter();
  const k = cat.getBoundingClientRect();

  const onCat =
    f.cx >= k.left && f.cx <= k.right &&
    f.cy >= k.top  && f.cy <= k.bottom;

  if (onCat) {
    feedCat();
  } else {
    returnFish();
  }
}

/* ---------------------------------------------------------
   Carry the fish with the cursor itself
   --------------------------------------------------------- */

function carryFish() {

  if (!fishShown || isFed || draggingFish || !draggingCursor) {
    return;
  }

  const c = cursorMark.getBoundingClientRect();
  const px = c.left + c.width / 2;
  const py = c.top + c.height / 2;

  if (!carryingFish) {

    const f = fish.getBoundingClientRect();

    const touching =
      px >= f.left && px <= f.right &&
      py >= f.top  && py <= f.bottom;

    if (!touching) {
      return;
    }

    carryingFish = true;
    fish.classList.remove('is-returning');
    fish.classList.add('is-dragging');
  }

  placeFish(px, py + 14 * currentScale);
  updateFishOver();
}

function releaseCarry() {

  if (!carryingFish) {
    return;
  }

  carryingFish = false;
  fish.classList.remove('is-dragging');

  const f = fishCenter();
  cat.classList.remove('fish-over');
  const k = cat.getBoundingClientRect();

  const onCat =
    f.cx >= k.left && f.cx <= k.right &&
    f.cy >= k.top  && f.cy <= k.bottom;

  if (onCat) {
    feedCat();
  } else {
    returnFish();
  }
}

window.addEventListener('pointermove', carryFish);
cursorMark.addEventListener('pointerdown', carryFish);
cursorMark.addEventListener('pointerup', releaseCarry);
cursorMark.addEventListener('pointercancel', releaseCarry);

fish.addEventListener('pointerup', dropFish);
fish.addEventListener('pointercancel', dropFish);

window.addEventListener('resize', () => {
  if (fishShown && !draggingFish) {
    const h = fishHome();
    placeFish(h.cx, h.cy);
  }
});


/* =========================================================
   HELP POPUP
   ========================================================= */

const helpButton = document.querySelector('#helpButton');
const helpModal  = document.querySelector('#helpModal');
const helpClose  = document.querySelector('#helpClose');

function openHelp() {

  helpModal.hidden = false;
  helpClose.focus();
}

function closeHelp() {

  helpModal.hidden = true;
  helpButton.focus();
}

helpButton.addEventListener('click', openHelp);
helpClose.addEventListener('click', closeHelp);

/* click on the dark area outside the box closes it too */
helpModal.addEventListener('click', (event) => {

  if (event.target === helpModal) {
    closeHelp();
  }
});

window.addEventListener('keydown', (event) => {

  if (event.key === 'Escape' && !helpModal.hidden) {
    closeHelp();
  }
});


/* =========================================================
   START POSITION OF THE CURSOR
   Sits to the right of the cat, inside the blue box.
   ========================================================= */

let cursorMoved = false;

cursorMark.addEventListener('pointerdown', () => {
  cursorMoved = true;
});

function placeCursorStart() {

  if (cursorMoved) {
    return;
  }

  const box = document.querySelector('.playground').getBoundingClientRect();
  const k = cat.getBoundingClientRect();

  const halfW = 44 * currentScale;
  const halfH = 46 * currentScale;
  const pad = 14 * currentScale;

  let cx = (k.right + box.right) / 2;
  let cy = k.top + k.height * 0.62;

  cx = Math.min(cx, box.right - halfW - pad);
  cy = Math.min(cy, box.bottom - halfH - pad);
  cy = Math.max(cy, box.top + halfH + pad);

  cursorMark.style.left = `${cx / currentScale - stageOffsetX - 55}px`;
  cursorMark.style.top  = `${cy / currentScale - stageOffsetY - 58}px`;

  updateHold();
}

placeCursorStart();
window.addEventListener('resize', placeCursorStart);


/* =========================================================
   SOUNDS
   - Angry meow: plays once each time the cat turns angry.
   - Purr: plays (looping, fading in / out) while the cat is
     being petted, i.e. while the hearts are showing.
   ========================================================= */

const MEOW_VOLUME = 0.35;   
const PURR_VOLUME = 0.55;   

const PURR_FADE_IN  = 600;  
const PURR_FADE_OUT = 500;  

const meowSound = new Audio('assets/Audio/mixkit-angry-cartoon-kitty-meow-94.wav');
const purrSound = new Audio('assets/Audio/dragon-studio-purring-cat-401727.mp3');

meowSound.volume = MEOW_VOLUME;
meowSound.preload = 'auto';

purrSound.loop = true;
purrSound.volume = 0;
purrSound.preload = 'auto';

let purrFade = null;

meowSound.addEventListener('error', () => console.warn('Meow file not found: assets/Audio/mixkit-angry-cartoon-kitty-meow-94.wav'));
purrSound.addEventListener('error', () => console.warn('Purr file not found: assets/Audio/dragon-studio-purring-cat-401727.mp3'));

let audioUnlocked = false;

function unlockAudio() {

  if (audioUnlocked) {
    return;
  }

  audioUnlocked = true;

  [meowSound, purrSound].forEach((sound) => {

    sound.muted = true;

    const playing = sound.play();

    const done = () => {
      sound.pause();
      sound.currentTime = 0;
      sound.muted = false;
    };

    if (playing && playing.then) {
      playing.then(done).catch(() => {
        sound.muted = false;
        audioUnlocked = false; 
      });
    } else {
      done();
    }
  });
}

['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown'].forEach((name) => {
  window.addEventListener(name, unlockAudio, { capture: true });
});

function fadePurr(target, duration, onDone) {

  clearInterval(purrFade);

  const from  = purrSound.volume;
  const start = performance.now();

  purrFade = setInterval(() => {

    const t = Math.min(1, (performance.now() - start) / duration);

    purrSound.volume = from + (target - from) * t;

    if (t >= 1) {
      clearInterval(purrFade);
      purrFade = null;

      if (onDone) {
        onDone();
      }
    }
  }, 30);
}

function startPurr() {

  const playing = purrSound.play();

  if (playing && playing.catch) {
    playing.catch((error) => console.warn('Purr could not play:', error.name));
  }

  fadePurr(PURR_VOLUME, PURR_FADE_IN);
}

function stopPurr() {

  fadePurr(0, PURR_FADE_OUT, () => purrSound.pause());
}

function playMeow() {

  meowSound.currentTime = 0;

  const playing = meowSound.play();

  if (playing && playing.catch) {
    playing.catch((error) => console.warn('Meow could not play:', error.name));
  }
}

let wasAngry   = cat.classList.contains('is-angry');
let wasPetting = cat.classList.contains('is-petting');

new MutationObserver(() => {

  const angry   = cat.classList.contains('is-angry');
  const petting = cat.classList.contains('is-petting');

  if (angry && !wasAngry) {
    playMeow();
  }

  if (petting && !wasPetting) {
    startPurr();
  } else if (!petting && wasPetting) {
    stopPurr();
  }

  wasAngry   = angry;
  wasPetting = petting;

}).observe(cat, { attributes: true, attributeFilter: ['class'] });

document.addEventListener('visibilitychange', () => {

  if (document.hidden) {
    meowSound.pause();
    purrSound.pause();
    clearInterval(purrFade);
    purrSound.volume = 0;
  }
});