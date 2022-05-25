fetch('products.json')
  .then( response => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  })
  .then( json => initialize(json) )
  .catch( err => console.error(`Fetch problem: ${err.message}`) );

function initialize(products) {
  const category = document.getElementById('category');
  const searchTerm = document.getElementById('searchTerm');
  const searchBtn = document.querySelector("input[type='submit']");
  const main = document.getElementById('main');

  let lastCategory = category.value;
  let lastSearch = '';

  let categoryGroup;
  let finalGroup;
  let onDisplay = [];

  finalGroup = products;
  updateDisplay();

  categoryGroup = [];
  finalGroup = [];

  searchBtn.addEventListener('click', selectCategory);
  window.onscroll = infiniteScroll();
  onDisplay.forEach(toggle(section));

  function selectCategory(e) {
    // Use preventDefault() to stop the form submitting — that would ruin
    // the experience
    e.preventDefault();

    categoryGroup = [];
    finalGroup = [];

    // if the category and search term are the same as they were the last time a
    // search was run, the results will be the same, so there is no point running
    // it again — just return out of the function
    if (category.value === lastCategory && searchTerm.value.trim() === lastSearch) {
      return;
    } else {
      // update the record of last category and search term
      lastCategory = category.value;
      lastSearch = searchTerm.value.trim();
      // In this case we want to select all products, then filter them by the search
      // term, so we just set categoryGroup to the entire JSON object, then run selectProducts()
      if (category.value === 'All') {
        categoryGroup = products;
        updateDisplay();
      // If a specific category is chosen, we need to filter out the products not in that
      // category, then put the remaining products inside categoryGroup, before running
      // selectProducts()
      } else {
        categoryGroup = products.filter( product => product.type === category.value );

        updateDisplay();
      }
    }
  }

  // start the process of updating the display with the new set of products
  function updateDisplay() {
    while (main.firstChild) {
      main.removeChild(main.firstChild);
    }

    // if no products match the search term, display a "No results to display" message
    if (finalGroup.length === 0) {
      const para = document.createElement('p');
      para.textContent = 'No results to display!';
      main.appendChild(para);
    // for each product we want to display, pass its product object to fetchBlob()
    } else {
      for (let i = 0;i<6;i++) {
        const product = finalGroup.shift();
        fetchBlob(product);
      }
    }
  }

  // fetchBlob uses fetch to retrieve the image for that product, and then sends the
  // resulting image display URL and product object on to showProduct() to finally
  // display it
  function fetchBlob(product) {
    // construct the URL path to the image file from the product.image property
    const url = `images/${product.image}`;
    // Use fetch to fetch the image, and convert the resulting response to a blob
    // Again, if any errors occur we report them in the console.
    fetch(url)
      .then( response => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.blob();
      })
      .then( blob => showProduct(blob, product) )
      .catch( err => console.error(`Fetch problem: ${err.message}`) );
  }

  // Display a product inside the <main> element
  function showProduct(blob, product) {
    // Convert the blob to an object URL — this is basically an temporary internal URL
    // that points to an object stored inside the browser
    const objectURL = URL.createObjectURL(blob);
    // create <section>, <h2>, <p>, and <img> elements
    const section = document.createElement('section');
    const title = document.createElement('h2');
    const price = document.createElement('p');
    const image = document.createElement('img');

    // give the <section> a classname equal to the product "type" property so it will display the correct icon
    section.setAttribute('class', product.type);

    title.textContent = product.name;
    price.textContent = `$${product.price.toFixed(2)}`;

    image.src = objectURL;
    image.alt = product.name;

    main.appendChild(section);
    section.appendChild(title);
    section.appendChild(price);
    section.appendChild(image);

    onDisplay.push(section);
  }

  function infiniteScroll(){
      if(window.innerHeight + window.scrollY >= document.body.offsetHeight){
        if (finalGroup.length < 6) {
          for (let i = 0;i<finalGroup.length;i++) {
            const product = finalGroup.shift();
            fetchBlob(product);
          }
        } else {
          for (let i = 0;i<6;i++) {
            const product = finalGroup.shift();
            fetchBlob(product);
          }
        }
      }
  }

  function toggle(section){
    section.onclick = function(){
      if(section.classList.contain("description")){
        section.querySelector('img').style.filter = 'none';
        section.querySelector('h2').style.display = 'none';
        section.querySelector('p').style.display = 'none';
        section.classList.remove("description");
      }else{
        section.querySelector('img').style.filter = 'brightness(50%)';
        section.querySelector('h2').style.display = 'block';
        section.querySelector('p').style.display = 'block';
        section.classList.add("description");
      }
    }
  }
}