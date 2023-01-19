const links = document.querySelectorAll('nav a');
const currentPage = window.location.pathname;

for (let i = 0; i < links.length; i++) {
  if (links[i].getAttribute('href') === currentPage) {
    links[i].parentNode.classList.add('active');
  }
}
