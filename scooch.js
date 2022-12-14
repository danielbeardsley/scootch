const stopVelocity = 0.0001;
const userScrollThreshold = 1;
const friction = 0.002;
const velocityHalfLife = 300; // ms

function addEvent(type, fn) {
    window.addEventListener(type, fn, false);
}

let prevWheel = {e:null};
let velocity = 0;
addEvent('wheel', function(event) {
   const now = Date.now();
   if (prevWheel.e) {
      const deltaT = now - prevWheel.t;
      if (!deltaT) {
         return;
      }
      if (velocity == 0) {
         start();
      }
      velocity = prevWheel.e.deltaY / deltaT;
   }
   prevWheel.e = event;
   prevWheel.t = now;
});

let lastTime = null;
let prev = {y: 0, t: Date.now()}

function start() {
   prev.t = Date.now();
   prev.y = window.scrollY;
   window.requestAnimationFrame(step);
}

function step() {
   const now = Date.now();
   const deltaT = now - prev.t;
   const userScroll = Math.abs(window.scrollY - prev.y);
   prev.y = window.scrollY;
   prev.t = now;
   prev.velocity = velocity;

   velocity = slower(velocity, deltaT);

   lastTime = now;
   if (Math.abs(velocity) < stopVelocity) {
      velocity = 0;
      return;
   }

   if (userScroll < userScrollThreshold) {
      const scrollPix = scrollMe(velocity, deltaT);
      if (window.scrollDebug) {
         console.log("Velocity: %.2f  PrevVelocity: %.2f  userScroll: %.2f, scrollPix: %.2f",
            velocity, prev.velocity, userScroll, scrollPix);
      }
      prev.y += scrollPix;
   } else {
      if (window.scrollDebug) {
         console.log("User is scrolling");
      }
   }

   window.requestAnimationFrame(step);
}

let scrollBuffer = 0;
function scrollMe(v, deltaT) {
   scrollBuffer += v * deltaT;
   // buffer tiny scroll operations till they are > 1 px of movement
   if (Math.abs(scrollBuffer) < 1) {
      return 0;
   }

   const scrollPix = Math.round(scrollBuffer);
   window.scrollBy(0, scrollPix);
   scrollBuffer = scrollBuffer - scrollPix;
   return scrollPix
}

function slower(v, deltaT) {
   if (deltaT == 0) {
      return v;
   }
   const deltaV = deltaT * friction;
   const deltaVClamped = Math.min(Math.abs(v), deltaV);
   const exponentialDecayFactor = Math.pow(2, -deltaT/velocityHalfLife);
   return (v - Math.sign(v) * deltaVClamped)* exponentialDecayFactor;
}
