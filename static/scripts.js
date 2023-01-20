// Highlight the active navigation tab
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
  $('#sticky-search-input').val(storedSearchValue);
  filterResults(storedSearchValue);
}

$('#search-input').on('input', function() {
  let searchValue = $(this).val().toLowerCase();
  $('#sticky-search-input').val(searchValue);
  filterResults(searchValue);
});

$('#sticky-search-input').on('input', function() {
  let searchValue = $(this).val().toLowerCase();
  $('#search-input').val(searchValue);
  filterResults(searchValue);
});

function filterResults(searchValue) {
  const searchValues = searchValue.split(',').map(val => val.trim().toLowerCase());
  $('tbody tr').filter(function() {
      $(this).toggle(searchValues.some(val => $(this).text().toLowerCase().indexOf(val) > -1));
  });
  localStorage.setItem("searchValue", searchValue);
  //clear the value of the category input field
  document.getElementById('category-select').value = 'all';
  document.getElementById('sticky-category-select').value = 'all';
  localStorage.removeItem("categoryValue");
}


// Search category
const categorySelect = document.getElementById('category-select');
const stickyCategorySelect = document.getElementById('sticky-category-select');

const categoryValues = new Set();
const stickyCategoryValues = new Set();

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

// populate the select element with unique categories
document.querySelectorAll('td[headers="category"]').forEach(categoryTd => {
  stickyCategoryValues.add(categoryTd.textContent);
});
stickyCategoryValues.forEach(category => {
  const option = document.createElement('option');
  option.value = category;
  option.textContent = category;
  stickyCategorySelect.appendChild(option);
});



const storedCategoryValue = localStorage.getItem("categoryValue");
if (storedCategoryValue) {
  $('#category-select').val(storedCategoryValue);
  $('#sticky-category-select').val(storedCategoryValue);
  document.querySelectorAll('tbody tr').forEach(row => {
    if (storedCategoryValue === 'all' || row.querySelector('td[headers="category"]').textContent === storedCategoryValue) {
        row.style.display = '';
    } else {
        row.style.display = 'none';
    }
});
}


categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    document.querySelectorAll('tbody tr').forEach(row => {
        if (selectedCategory === 'all' || row.querySelector('td[headers="category"]').textContent === selectedCategory) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    //clear the value of the runner search input field
    document.getElementById('search-input').value = '';
    document.getElementById('sticky-search-input').value = '';
    localStorage.removeItem("searchValue");
});

stickyCategorySelect.addEventListener('change', () => {
  const selectedCategory = stickyCategorySelect.value;
  document.querySelectorAll('tbody tr').forEach(row => {
      if (selectedCategory === 'all' || row.querySelector('td[headers="category"]').textContent === selectedCategory) {
          row.style.display = '';
      } else {
          row.style.display = 'none';
      }
  });
  //clear the value of the runner search input field
  document.getElementById('search-input').value = '';
  document.getElementById('sticky-search-input').value = '';
  localStorage.removeItem("searchValue");
});

$('#category-select').on('change', function() {
  let categoryValue = $('#category-select').val();
  $('#sticky-category-select').val(categoryValue);
  localStorage.setItem('categoryValue', categoryValue);
});

$('#sticky-category-select').on('change', function() {
  let categoryValue = $('#sticky-category-select').val();
  $('#category-select').val(categoryValue);
  localStorage.setItem('categoryValue', categoryValue);
});