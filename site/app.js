const menuBtn = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuBtn?.addEventListener('click', () => {
const open = nav.classList.toggle('open');
menuBtn.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
const toast = document.getElementById('toast');
function showToast(message){
toast.textContent = message;
toast.classList.add('show');
clearTimeout(window.__toastTimer);
window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
}
function demoWhatsApp(){
showToast('Demo visual: el número oficial de WhatsApp se conectará al aprobar el contenido.');
}
document.getElementById('waFloat')?.addEventListener('click', demoWhatsApp);
document.getElementById('leadForm')?.addEventListener('submit', (e) => {
e.preventDefault();
const name = document.getElementById('name').value.trim();
const phone = document.getElementById('phone').value.trim();
if(!name || !phone){
showToast('Para la demo, captura nombre y WhatsApp para probar el formulario.');
return;
}
showToast(`Gracias, ${name}. La demo registró correctamente tu solicitud visual.`);
});
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
const sections = [...document.querySelectorAll('main section[id], header[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
window.addEventListener('scroll', () => {
const pos = window.scrollY + 150;
let current = 'inicio';
sections.forEach(sec => { if(sec.offsetTop <= pos) current = sec.id; });
navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
},{passive:true});