const links = document.querySelectorAll('nav a');
const currentPage = window.location.pathname;

for (let i = 0; i < links.length; i++) {
  if (links[i].getAttribute('href') === currentPage) {
    links[i].parentNode.classList.add('active');
  }
}


// Search runner
const storedSearchValue = localStorage.getItem("searchValue");
if (storedSearchValue) {
  $('#search-input').val(storedSearchValue);
  filterResults(storedSearchValue);
}

$('#search-input').on('input', function() {
  let searchValue = $(this).val().toLowerCase();
  filterResults(searchValue);
});

function filterResults(searchValue) {
  $('tbody tr').filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1);
  });
  localStorage.setItem("searchValue", searchValue);
}

// Search category
const categorySelect = document.getElementById('category-select');
const categoryValues = new Set();

// populate the select element with unique categories
document.querySelectorAll('td[headers="category"]').forEach(categoryTd => {
    categoryValues.add(categoryTd.textContent);
});
categoryValues.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
});

categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    document.querySelectorAll('tbody tr').forEach(row => {
        if (selectedCategory === 'all' || row.querySelector('td[headers="category"]').textContent === selectedCategory) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Save search values to Local Storage
$('#search-form').on('submit', function(event) {
  event.preventDefault();
  let searchValue = $('#search-input').val();
  let categoryValue = $('#category-select').val();
  localStorage.setItem('searchValue', searchValue);
  localStorage.setItem('categoryValue', categoryValue);
});
$('#category-select').on('change', function() {
  let categoryValue = $('#category-select').val();
  localStorage.setItem('categoryValue', categoryValue);
});

