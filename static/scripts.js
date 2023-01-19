const links = document.querySelectorAll('nav a');
const currentPage = window.location.pathname;

for (let i = 0; i < links.length; i++) {
  if (links[i].getAttribute('href') === currentPage) {
    links[i].parentNode.classList.add('active');
  }
}

// Search runner
$('#search-input').on('input', function() {
  let searchValue = $(this).val().toLowerCase();
  filterResults(searchValue);
});

function filterResults(searchValue) {
  $('tbody tr').filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1);
  });
}
