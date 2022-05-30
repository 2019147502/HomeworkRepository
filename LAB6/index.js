var express = require("express");
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const fs = require("fs").promises;
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

async function getDBConnection(){
    const db = await sqlite.open({
        filename: 'product.db',
        driver: sqlite3.Database
    });
    return db;
}

async function initialize(products) {
    console.log(document.title);
    const category = document.getElementById('category');
    const searchTerm = document.getElementById('searchTerm');
    const searchBtn = document.querySelector('button');
    const main = document.getElementById('main');
  
    let categoryGroup;
    let finalGroup;
  
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
    
    function selectCategory(e) {
      e.preventDefault();
      categoryGroup = [];
      finalGroup = [];
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
  
    function fetchBlob(product) {
      // construct the URL path to the image file from the product.image property
      fs.readFile(product["product_image"], async function(err, data){
          if(err){
              res.status(500).send("500 error, wrong image name");
            }else{
                showProduct(data.blob(), product);
            }
      });
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
      section.setAttribute('class', product["product_category"]);
  
      title.textContent = 'name: '+product["product_name"];
      price.textContent = 'price:'+`$${product["product_price"].toFixed(2)}`;
  
      image.src = objectURL;
      image.alt = product.name;
  
      main.appendChild(section);
      section.appendChild(image);
      section.appendChild(title);
      section.appendChild(price);
  
  
      section.addEventListener("click", description);
    }
  
    function description(e){
      if(e.target.classList.contains('description')){
        e.target.classList.remove('description');
      }else{
        e.target.classList.add('description');
      }
    }
}

app.get('/', async function(req, res){
    let db = await getDBConnection();
    let rows = await db.all('select * from product');
    await db.close();
    let product = rows;
    if(req.query.type){
        if(req.query.type!='ALL'){
            product = product.filter( product => product["product_category"] == req.query.type );
        }
        if (!(req.query.searchTerm.trim() == '')) {
            const lowerCaseSearchTerm = req.query.searchTerm.trim().toLowerCase();
            product = product.filter( product => product["product_title"].includes(lowerCaseSearchTerm));
          }
    }
    content = '';
    for(let i=0;i<product.length;i++){
        content += '<section class="'+product[i]["product_category"]+'"><a href="/product/'+product[i]["product_id"]+'"><img src="'+product[i]["product_image"]+'"></a></section>'; 
    }
    var output = 
    `<!DOCTYPE html>
    <html lang="kr">
        <head>
            <meta charset="utf-8">
            <title>IP Online Shop</title>
            <link rel = "stylesheet" type = "text/css" href = "/main.css">
        </head>
        <body>
            <h1  class="index">Welcome to INTERNET-PROGRAMMING Online-Shop</h1>
            <nav>
                <span class="current nav">메인페이지</span>
                <a class="nav" href="/login">로그인</a>
                <a class="nav" href="/signup">회원가입</a>
            </nav>
            <div id="body">
                <div id="aside">
                    <form id="categorize" action="/" method="GET">
                        <div>
                            <label>Choose a category:</label>
                            <select id="category" name="type">
                                <option value="ALL" selected>All</option>
                                <option value="CPU">CPU</option>
                                <option value="GPU">GPU</option>
                                <option value="SSD">SSD</option>
                                <option value"Keyboard">Keyboard</option>
                                <option value="Mouse">Mouse</option>
                            </select>
                            </div>
                            <div>
                                <label>Enter search term:</label>
                                <input type="text" id="searchTerm" placeholder="e.g. RTX 3080" name="searchTerm">
                            </div>
                            <div>
                                <button>Filter results</button>
                            </div>
                    </form>
                    <p>click images for detail</p>
                </div>
                <div id="main">${content}</div>
            </div>
        </body>
    </html>`;
    res.send(output);
});

app.get("/login", function(req, res){
    var output = `
    <!DOCTYPE html>
<html lang="kr">
    <head>
        <meta charset="utf-8">
        <title>IP Online Shop - login</title>
        <link rel = "stylesheet" type = "text/css" href = "main.css">
    </head>
    <body>
        <h1>Welcome to INTERNET-PROGRAMMING Online-Shop</h1>

        <nav>
            <a class = "nav" href="/">메인페이지</a>
            <span class="current nav">로그인</span>
        </nav>

        <div class="intro">
            <div class="required">회원정보(필수)</div>
            <form method="post" action="#">
                <p><label>아이디: </label><input type="text" placeholder="아이디를 입력하세요" autofocus required></p>
                <p><label>비밀번호: </label><input type="password" placeholder="비밀번호를 입력하세요" required></p>
                <p>
                    <input type="submit" value="로그인">
                    <a class="signup" href="/signup">회원가입</a>
                </p>

            </form>
        </div>
    </body>
</html>
    `;
    res.send(output);
});

app.get("/signup", function(req, res){
    var output = `
    <!DOCTYPE html>
<html lang="kr">
    <head>
        <meta charset="utf-8">
        <title>IP Online Shop - signup</title>
        <link rel = "stylesheet" type = "text/css" href = "main.css">
    </head>
    <body>
        <h1 >Welcome to INTERNET-PROGRAMMING Online-Shop</h1>
        <nav>
            <a class="nav" href="/">메인페이지</a>
            <a class="login nav" href="/login">로그인</a>
            <span class="current nav">회원가입</span>
        </nav>

        <div class="intro">
            <div class="required">개인정보(필수)</div>
            <form method="post" action="#">
                <p><label>이름: </label><input type="text" placeholder="이름을 입력하세요" autofocus required></p>
                <p><label>생년월일: </label><input type="date" required></p>
                <p><label>전화번호: </label><input type="tel" pattern="\d{3}-\d{4}-\d{4}" placeholder="000-0000-0000" required></p>
                <p><label>이메일: </label><input type="email" placeholder="name@domain.com" required></p>
                <p><label>아이디: </label><input type="text" placeholder="아이디를 입력하세요" required></p>
                <p><label>비밀번호: </label><input type="password" placeholder="비밀번호를 입력하세요" required></p>
                <p><label>비밀번호 확인: </label><input type="password" placeholder="비밀번호 확인" required></p>
                
                <p class="preference">개인취향 조사 (더욱 정확한 추천을 받을 수 있습니다.)</p>
                <p><label>좋아하는 색깔: </label><input type="color"></p>
                <p><label>좋아하는 숫자(0~100): </label><input type="number" min=0 max=100></p>
                <p><label>주로 공부하는 시간(10분 단위): </label><input type="time" step="600"></p>
                
                <p>
                    <input type="submit" value="회원가입">
                    <input type="reset" value="초기화">
                </p>
    
            </form>
        </div>

    </body>
</html>`;
    res.send(output);
});

app.get("/product/:product_id", async function(req, res){
    let db = await getDBConnection();
    let rows = await db.all('select * from product where product_id = '+ req.params.product_id);
    await db.close();
    let comments = await fs.readFile("comment.json", "utf-8");
    comments = JSON.parse(comments);
    index = parseInt(req.params.product_id) - 1;
    let tables = '<table border="1"><th>Comments</th>';
    for(let i=0;i<comments[index]["comments"].length;i++){
        tables += '<tr><td>'+comments[index]["comments"][i]+'</td></tr>';
    }
    tables += '</table>'
    product = rows.slice();
    content = '<div id="aside"><img src="/'+product[0]["product_image"]+'"/></div><div id="content"><p>product id: '
    +req.params.product_id+'</p><p>name: '+product[0]["product_title"]+'</p><p>price: $'+product[0]["product_price"]
    +'</p><p>category: '+product[0]["product_category"]+'</p>' 
    +tables
    +'<form method="POST" id="categorize" action="/product/'+req.params.product_id
    +'"><div><label>Enter new comments:</label><input type="text" placeholder="Review" name="comment"></div><div><button>Submit</button></div></form>'
    +'</div>'; 
    var output = 
    `<!DOCTYPE html>
    <html lang="kr">
        <head>
            <meta charset="utf-8">
            <title>IP Online Shop</title>
            <link rel = "stylesheet" type = "text/css" href = "/main.css">
        </head>
        <body>
            <h1  class="index">Welcome to INTERNET-PROGRAMMING Online-Shop</h1>
            <nav>
                <a class="nav" href="/">메인페이지</a>
                <a class="nav" href="/login">로그인</a>
                <a class="nav" href="/signup">회원가입</a>
            </nav>
            <div id="body">
            ${content}
            </div>
        </body>
    </html>`;
    res.send(output);
});

app.post("/product/:product_id", async function(req, res){
    if(req.body.comment != ''){
        let comments = await fs.readFile("comment.json", "utf-8");
        comments = JSON.parse(comments);
        comments[parseInt(req.params.product_id) - 1]["comments"].unshift(req.body.comment);
    
        fs.writeFile("comment.json", JSON.stringify(comments));
    }
    let db = await getDBConnection();
    let rows = await db.all('select * from product where product_id = '+ req.params.product_id);
    await db.close();
    let comments = await fs.readFile("comment.json", "utf-8");
    comments = JSON.parse(comments);
    index = parseInt(req.params.product_id) - 1;
    let tables = '<table border="1"><th>Comments</th>';
    for(let i=0;i<comments[index]["comments"].length;i++){
        tables += '<tr><td>'+comments[index]["comments"][i]+'</td></tr>';
    }
    tables += '</table>'
    product = rows.slice();
    content = '<div id="aside"><img src="/'+product[0]["product_image"]+'"/></div><div id="content"><p>product id: '
    +req.params.product_id+'</p><p>name: '+product[0]["product_title"]+'</p><p>price: $'+product[0]["product_price"]
    +'</p><p>category: '+product[0]["product_category"]+'</p>' 
    +tables
    +'<form method="POST" id="categorize" action="/product/'+req.params.product_id
    +'"><div><label>Enter new comments:</label><input type="text" placeholder="Review" name="comment"></div><div><button>Submit</button></div></form>'
    +'</div>'; 
    var output = 
    `<!DOCTYPE html>
    <html lang="kr">
        <head>
            <meta charset="utf-8">
            <title>IP Online Shop</title>
            <link rel = "stylesheet" type = "text/css" href = "/main.css">
        </head>
        <body>
            <h1  class="index">Welcome to INTERNET-PROGRAMMING Online-Shop</h1>
            <nav>
                <a class="nav" href="/">메인페이지</a>
                <a class="nav" href="/login">로그인</a>
                <a class="nav" href="/signup">회원가입</a>
            </nav>
            <div id="body">
            ${content}
            </div>
        </body>
    </html>`;
    res.send(output);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("서버가 실행됐습니다.");
    console.log(`서버주소: http://localhost:${PORT}`);
});