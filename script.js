const container = document.querySelector('.orbit-lines');
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = (e.clientY / window.innerHeight) * 2 - 1; 
  container.style.transform = `translate(-50%, -50%) rotateX(${y * 20}deg) rotateY(${x * 20}deg)`;
});

