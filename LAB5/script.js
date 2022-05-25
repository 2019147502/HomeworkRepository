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
  const searchBtn = document.querySelector('button');
  const main = document.getElementById('main');

  let categoryGroup;
  let finalGroup;
  let onDisplay = [];

  finalGroup = products.slice();
  updateDisplay();

  searchBtn.addEventListener('click', selectCategory);
  window.onscroll = () => {
    if(window.innerHeight + window.scrollY >= document.body.offsetHeight){
      if (finalGroup.length < 6) {
        const l = finalGroup.length;
        for (let i = 0;i<l;i++) {
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
  onDisplay.forEach(function(element){
    element.onclick = function(e){
      if(e.target.classList.contain('description')){
        e.target.classList.remove('description');
      }else{
        e.target.classList.add('description');
      }
    }
  });

  function selectCategory(e) {
    e.preventDefault();
    categoryGroup = [];
    finalGroup = [];
    onDisplay = [];
    // update the record of last category and search term
    if (category.value === 'All') {
      categoryGroup = products.slice();
      selectProducts();
    } else {
      categoryGroup = products.slice().filter( product => product.type == category.value );
      selectProducts();
    }
  }

  function selectProducts() {
    if (searchTerm.value.trim() === '') {
      finalGroup = categoryGroup;
    } else {
      const lowerCaseSearchTerm = searchTerm.value.trim().toLowerCase();
      finalGroup = categoryGroup.filter( product => product.name.includes(lowerCaseSearchTerm));
    }
    updateDisplay();
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
      if (finalGroup.length < 6) {
        const l = finalGroup.length;
        for (let i = 0;i<l;i++) {
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

    title.textContent = 'name: '+product.name;
    price.textContent = 'price:'+`$${product.price.toFixed(2)}`;

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
          const l = finalGroup.length;
          for (let i = 0;i<l;i++) {
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


}