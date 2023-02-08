const currentPage = window.location.pathname.trim();

const smallLinks = document.querySelectorAll('nav.small-nav a');
const mainLinks = document.querySelectorAll('nav.main-nav a');

let resultType = localStorage.getItem("resultType");


document.addEventListener("DOMContentLoaded", function() {
  
  for (let i = 0; i < mainLinks.length; i++) {
    if (currentPage.startsWith("/results/")) {
      const number = currentPage.split("/")[2];
      if (mainLinks[i].getAttribute("href") === `/kings` && number === "1") {
        mainLinks[i].parentNode.classList.add("active");
      } else if (mainLinks[i].getAttribute("href") === `/linn` && number === "2") {
        mainLinks[i].parentNode.classList.add("active");
      }
      else if (mainLinks[i].getAttribute("href") === `/rouken` && number === "3") {
        mainLinks[i].parentNode.classList.add("active");
      }
      else if (mainLinks[i].getAttribute("href") === `/pollok` && number === "4") {
        mainLinks[i].parentNode.classList.add("active");
      }
      else if (mainLinks[i].getAttribute("href") === `/bellahouston` && number === "5") {
        mainLinks[i].parentNode.classList.add("active");
      }
    } else if (mainLinks[i].getAttribute("href") === currentPage) {
      mainLinks[i].parentNode.classList.add("active");
    }

    // Disable toggle between race results and classification for home mainLinks[0] and about pages mainLinks[mainLinks.length - 1]
    for (let i = 1; i < mainLinks.length - 1; i++)
    mainLinks[i].addEventListener("click", function(event) {
      if (resultType === "classification") {
          event.preventDefault();
          window.location.href = smallLinkMap[mainLinks[i].getAttribute("href")];
      }
    });   
  }

  for (let i = 0; i < smallLinks.length; i++) {
    if (smallLinks[i].getAttribute('href') === currentPage) {
      smallLinks[i].parentNode.classList.add('small-active');
    }

    smallLinks[i].addEventListener("click", function(event) {
      if (smallLinks[i].getAttribute('href').startsWith('/results')) {
        localStorage.setItem("resultType", 'classification');
        
      }
      else {
        localStorage.setItem("resultType", 'raceResults');
        
      }
    });
  }
});

// Create mappings between race results and classification results

const smallLinkMap = {
  "/kings": "/results/1",
  "/linn": "/results/2",
  "/rouken": "/results/3",
  "/pollok": "/results/4",
  "/bellahouston": "/results/5"
};

const raceLinkMap = {
  "/results/1": "/kings",
  "/results/2": "/linn",
  "/results/3": "/rouken",
  "/results/4": "/pollok",
  "/results/5": "/bellahouston"
}

// // Make li elements clickable links
// var lis = document.querySelectorAll("li");
// lis.forEach(function(li) {
//     li.addEventListener("click", function() {
//         window.location.href = li.querySelector("a").href;
//     });
// });

if (currentPage.startsWith("/results/")) {
  smallLinks[0].setAttribute("href", raceLinkMap[currentPage]);
  smallLinks[1].setAttribute("href", currentPage);
}
else {
  smallLinks[0].setAttribute("href", currentPage);
  smallLinks[1].setAttribute("href", smallLinkMap[currentPage]);
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
    categoryValues.add(categoryTd.textContent.trim());
    console.log(categoryValues)
});

categoryValues.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
});

// Populate the select element with unique categories
document.querySelectorAll('td[headers="category"]').forEach(categoryTd => {
  stickyCategoryValues.add(categoryTd.textContent.trim());
});
stickyCategoryValues.forEach(category => {
  const option = document.createElement('option');
  option.value = category;
  option.textContent = category;
  stickyCategorySelect.appendChild(option);
});

// Filter categories
function getStoredCategoryValue() {
  let storedCategoryValue = localStorage.getItem("categoryValue");
  
  if (storedCategoryValue) {
    // storedCategoryValue = storedCategoryValue.trim()
    console.log(storedCategoryValue)
    $('#category-select').val(storedCategoryValue);
    $('#sticky-category-select').val(storedCategoryValue);
    
    document.querySelectorAll('tbody tr').forEach(row => {
      if (storedCategoryValue === 'all' || row.querySelector('td[headers="category"]').textContent.trim() === storedCategoryValue) {
          row.style.display = '';
      } else {   
          row.style.display = 'none';
      }
    });
  }
}

getStoredCategoryValue()


categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    
    document.querySelectorAll('tbody tr').forEach(row => {
        if (selectedCategory === 'all' || row.querySelector('td[headers="category"]').textContent.trim() === selectedCategory) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    localStorage.setItem("categoryValue", selectedCategory);
  
    //clear the value of the runner search input field
    document.getElementById('search-input').value = '';
    document.getElementById('sticky-search-input').value = '';
    localStorage.removeItem("searchValue");
});

stickyCategorySelect.addEventListener('change', () => {
  const selectedCategory = stickyCategorySelect.value;
  document.querySelectorAll('tbody tr').forEach(row => {
      if (selectedCategory === 'all' || row.querySelector('td[headers="category"]').textContent.trim() === selectedCategory) {
          row.style.display = '';
      } else {
          row.style.display = 'none';
      }
  });

  localStorage.setItem("categoryValue", selectedCategory);
  // Clear the value of the runner search input field
  document.getElementById('search-input').value = '';
  document.getElementById('sticky-search-input').value = '';
  localStorage.removeItem("searchValue");
});