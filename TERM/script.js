document.getElementById("baseball_list").style.display = "none";
document.getElementById("football_list").style.display = "none";

document.getElementById("baseball").addEventListener("click", function(){
    document.getElementById("baseball_list").style.display = "block";
    document.getElementById("football_list").style.display = "none";
});

document.getElementById("football").addEventListener("click", function(){
    document.getElementById("baseball_list").style.display = "none";
    document.getElementById("football_list").style.display = "block";
});

fetch('baseball.json')
.then( response => {
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
})
.then( json => initialize_b(json) )
.catch( err => console.error(`Fetch problem: ${err.message}`) );

function initialize_b(list){
    document.getElementById("baseball_list").childNodes.forEach(function(each){
        each.addEventListener("click", function(e){
            var main = document.getElementById("main");
            while (main.firstChild) {
                main.removeChild(main.firstChild);
            }
            let index = 0;
            if(e.target.getAttribute('value')=="0"){
                if (navigator.geolocation) {
                    var latitude = 0;
                    var longitude = 0;
                    navigator.geolocation.getCurrentPosition(function(position){
                        latitude = position.coords.latitude;
                        longitude = position.coords.longitude;
                        let distance = Math.pow(list[0].Latitude - latitude, 2) + Math.pow(list[0].Longitude - longitude, 2);
                        for(let i=1;i<list.length;i++){
                            let new_dist = Math.pow(list[i].Latitude - latitude, 2) + Math.pow(list[i].Longitude - longitude, 2);
                            if(new_dist < distance){
                                distance = new_dist;
                                index = i;
                            }
                        }
                    });
                    console.log(index);
                }else{
                    main.innerHTML="Failed:Not allowed to get your location"
                    return;
                }
            }else{
                index = parseInt(e.target.getAttribute('value')) - 1;
            }

            const url = `images/${list[index].Sit_image}`;
            fetch(url)
            .then( response => {
              if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
              }
              return response.blob();
            })
            .then( blob => show(blob, list) )
            .catch( err => console.error(`Fetch problem: ${err.message}`) );
    
            function show(blob, list){
                const objectURL = URL.createObjectURL(blob);
                const image = document.createElement('img');
                const heading = document.createElement('h2');
                const form = document.createElement("form");
                const selection = document.createElement('select');
                for(let i=0;i<list[index].Sits.length;i++){
                    let option = document.createElement('option');
                    option.innerHTML = list[index].Sits[i][0];
                    option.setAttribute("value", list[index].Sits[i][0]);
                    option.style.color = list[index].Sits[i][1];
                    selection.appendChild(option);
                }
                form.appendChild(selection);

    
                heading.innerHTML = list[index].name;
    
                image.src = objectURL;
                image.alt = list[index].name;
                
                main.appendChild(heading);
                main.appendChild(image);
                main.appendChild(form)
            }
        });
    });
}

fetch('football.json')
    .then( response => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then( json => initialize_f(json) )
    .catch( err => console.error(`Fetch problem: ${err.message}`) );        
        
function initialize_f(list){
    document.getElementById("football_list").childNodes.forEach(function(each){
        each.addEventListener("click", function(e){
            var main = document.getElementById("main");
            while (main.firstChild) {
                main.removeChild(main.firstChild);
            }
            let index = 0;
            if(e.target.getAttribute('value')=="0"){
                if (navigator.geolocation) {
                    var latitude = 0;
                    var longitude = 0;
                    navigator.geolocation.getCurrentPosition(function(position){
                        latitude = position.coords.latitude;
                        longitude = position.coords.longitude;
                        for(let i=1;i<list.length;i++){
                            let new_dist = Math.pow(list[i].Latitude - latitude, 2) + Math.pow(list[i].Longitude - longitude, 2);
                            if(new_dist < distance){
                                distance = new_dist;
                                index = i;
                            }
                        }
                    });
                    let distance = Math.pow(list[0].Latitude - latitude, 2) + Math.pow(list[0].Longitude - longitude, 2);

                }else{
                    main.innerHTML="Failed:Not allowed to get your location"
                    return;
                }
            }else{
                index = parseInt(e.target.getAttribute('value')) - 1;
            }

            const url = `images/${list[index].Sit_image}`;
            fetch(url)
            .then( response => {
              if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
              }
              return response.blob();
            })
            .then( blob => show(blob, list) )
            .catch( err => console.error(`Fetch problem: ${err.message}`) );
    
            function show(blob, list){
                const objectURL = URL.createObjectURL(blob);
                const image = document.createElement('img');
                const heading = document.createElement('h2');
    
                heading.innerHTML = list[index].name;
    
                image.src = objectURL;
                image.alt = list[index].name;
                
                main.appendChild(heading);
                main.appendChild(image);
            }
        });
    });
}