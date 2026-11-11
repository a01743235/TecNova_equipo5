// Animación de estrellas de fondo y cohetes despegando dinámicamente

const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Generador de estrellas
const STARS_COUNT = 140;
const stars = [];
for (let i = 0; i < STARS_COUNT; i++) {
  stars.push({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.6 + 0.4,
    alpha: Math.random() * 0.8 + 0.2,
    speed: Math.random() * 0.02 + 0.005
  });
}

// Clase Cohete
class Rocket {
  constructor(isMainLaunch = false) {
    this.reset(isMainLaunch);
  }

  reset(isMainLaunch = false) {
    this.isMain = isMainLaunch;
    this.x = isMainLaunch ? width * 0.5 : Math.random() * (width - 100) + 50;
    this.y = height + 100;
    this.speed = isMainLaunch ? 7.5 : Math.random() * 3 + 3.5;
    this.scale = isMainLaunch ? 1.6 : Math.random() * 0.6 + 0.6;
    this.angle = isMainLaunch ? 0 : (Math.random() - 0.5) * 0.2;
    this.particles = [];
    this.active = true;
  }

  update() {
    this.y -= this.speed;
    this.x += Math.sin(this.angle) * 1.5;
    this.speed += 0.05; // aceleración constante

    // Estela de propulsión (fuego y humo)
    for (let i = 0; i < (this.isMain ? 4 : 2); i++) {
      this.particles.push({
        x: this.x + (Math.random() - 0.5) * 8 * this.scale,
        y: this.y + 40 * this.scale,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 2,
        radius: Math.random() * 6 * this.scale + 2,
        alpha: 1,
        color: Math.random() > 0.4 ? '#D4AF37' : (Math.random() > 0.5 ? '#FF7A00' : '#1E5FA8')
      });
    }

    // Actualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      p.radius *= 0.96;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.y < -150 && !this.isMain) {
      this.reset(false);
    } else if (this.y < -250 && this.isMain) {
      this.active = false;
    }
  }

  draw(ctx) {
    // Dibujar estela de fuego
    for (let p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Dibujar Cohete estilizado TecNova
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(this.scale, this.scale);

    // Cuerpo principal (fuselaje)
    ctx.fillStyle = '#F4F6F8';
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.bezierCurveTo(12, -15, 12, 20, 10, 35);
    ctx.lineTo(-10, 35);
    ctx.bezierCurveTo(-12, 20, -12, -15, 0, -38);
    ctx.fill();

    // Punta dorada
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.bezierCurveTo(6, -26, 8, -15, 8, -10);
    ctx.lineTo(-8, -10);
    ctx.bezierCurveTo(-8, -15, -6, -26, 0, -38);
    ctx.fill();

    // Aletas laterales Azul Tec
    ctx.fillStyle = '#1E5FA8';
    // Aleta izquierda
    ctx.beginPath();
    ctx.moveTo(-10, 15);
    ctx.lineTo(-24, 38);
    ctx.lineTo(-10, 32);
    ctx.fill();
    // Aleta derecha
    ctx.beginPath();
    ctx.moveTo(10, 15);
    ctx.lineTo(24, 38);
    ctx.lineTo(10, 32);
    ctx.fill();

    // Ventana / Escudo central Azul Profundo y Dorado
    ctx.fillStyle = '#0B2E5B';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

// Lista de cohetes en pantalla
const rockets = [
  new Rocket(false),
  new Rocket(false)
];

// Temporizador para lanzar cohetes de fondo periódicamente
setInterval(() => {
  if (rockets.length < 5) {
    rockets.push(new Rocket(false));
  }
}, 3800);

// Ciclo de animación
function animate() {
  ctx.clearRect(0, 0, width, height);

  // 1. Estrellas titilantes
  for (let s of stars) {
    s.alpha += s.speed;
    if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
    ctx.fillStyle = `rgba(244, 246, 248, ${Math.max(0.1, s.alpha)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Cohetes
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    r.update();
    r.draw(ctx);
    if (!r.active) {
      rockets.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}
animate();

// Interacción del botón de Despegue
const launchBtn = document.getElementById('launchBtn');
const countdownStatus = document.getElementById('countdownStatus');

launchBtn.addEventListener('click', () => {
  // Reproducir audio
  if (window.rocketAudio) {
    window.rocketAudio.playLaunchSound();
  }

  // Desplegar cohete principal desde el centro
  const mainRocket = new Rocket(true);
  rockets.push(mainRocket);

  // Efecto visual de despegue
  countdownStatus.textContent = '🔥 ¡IGNICIÓN! PROPULSORES AL MÁXIMO 🔥';
  countdownStatus.style.color = '#FFB800';
  countdownStatus.style.textShadow = '0 0 15px rgba(255, 184, 0, 0.9)';

  launchBtn.disabled = true;
  launchBtn.style.opacity = '0.85';

  setTimeout(() => {
    countdownStatus.textContent = '🚀 ¡DESPEGUE EXITOSO! EN TRAYECTORIA ORBITAL 🌌';
    countdownStatus.style.color = '#5AF276';
    countdownStatus.style.textShadow = '0 0 15px rgba(90, 242, 118, 0.8)';
  }, 1600);

  setTimeout(() => {
    countdownStatus.textContent = 'LISTO PARA LA SIGUIENTE MISIÓN • T-0';
    countdownStatus.style.color = '#D4AF37';
    countdownStatus.style.textShadow = 'none';
    launchBtn.disabled = false;
    launchBtn.style.opacity = '1';
  }, 6000);
});
