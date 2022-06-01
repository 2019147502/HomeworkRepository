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


document.getElementById("baseball_list").addEventListener("click", function(e){
    fetch('baseball.json')
        .then( response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then( json => initialize(json) )
        .catch( err => console.error(`Fetch problem: ${err.message}`) );
    
    function initialize(list){
        var main = document.getElementById("main");
        let index = 0;
        if(e.target.value=="0"){
            if (navigator.geolocation) {
                var latitude = 0;
                var longitude = 0;
                navigator.geolocation.getCurrentPosition(function(position){
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                });
                let distance = Math.pow(list[0].Latitude - latitude, 2) + Math.pow(list[0].Longitude - longitude, 2);
                for(let i=1;i<list.length;i++){
                    let new_dist = Math.pow(list[i].Latitude - latitude, 2) + Math.pow(list[i].Longitude - longitude, 2);
                    if(new_dist < distance){
                        distance = new_dist;
                        index = i;
                    }
                }
            }else{
                x.innerHTML="Failed:Not allowed to get your location"
                return;
            }
        }else{
            index = parseInt(e.target.value);
        }
        console.log(list);
        console.log(list[index]);
        fetch(list[index].Sit_image)
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
    }
});


document.getElementById("football_list").addEventListener("click", function(e){
    fetch('football.json')
        .then( response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then( json => initialize(json) )
        .catch( err => console.error(`Fetch problem: ${err.message}`) );
    
    function initialize(list){
        var main = document.getElementById("main");
        let index = 0;
        if(e.target.value=="0"){
            if (navigator.geolocation) {
                var latitude = 0;
                var longitude = 0;
                navigator.geolocation.getCurrentPosition(function(position){
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                });
                let distance = Math.pow(list[0].Latitude - latitude, 2) + Math.pow(list[0].Longitude - longitude, 2);
                for(let i=1;i<list.length;i++){
                    let new_dist = Math.pow(list[i].Latitude - latitude, 2) + Math.pow(list[i].Longitude - longitude, 2);
                    if(new_dist < distance){
                        distance = new_dist;
                        index = i;
                    }
                }
            }else{
                x.innerHTML="Failed:Not allowed to get your location"
                return;
            }
        }else{
            index = parseInt(e.target.value);
        }

        const heading = document.createElement('h2');
        heading.innerHTML = list[index].name;

        main.appendChild(heading);
    }
});
