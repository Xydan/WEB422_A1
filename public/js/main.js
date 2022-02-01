//const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const perPage = 10;

var restaurantData;
var currentRestaurant;
var page = 1;
var map = null;

//functionss
const avg = (restaurant) => {
    return _.reduce(restaurant.grades, (a, b) => {
        return a += b.score;
    }, 0);
}

//extend Lodash functionality to include custom avg()
_.mixin({'avg': avg});

const tableRows = _.template(
    `<% _.forEach(restaurants, function(est){%> 
        <tr data-id="<%= est._id%>">
            <td><%= est.name%></td>
            <td><%= est.cuisine%></td>  
            <td><%= est.address.building%> <%=est.address.street%></td>
            <td><%= _.avg(est)%></td>
        </tr>        
    <%});%>`
);

//GET Req
const retrieveRestData = async (host, page, perPage) => {
    var response = await fetch((host + "/api/restaurants?page=" + page + "&perPage=" + perPage), {
        "method": 'GET'
    });
    return response.json();
}

const loadRestaurantData = () => {
    retrieveRestData("https://web422a1-ali.herokuapp.com", page, perPage).then(data => {
        restaurantData = [];
        data.forEach(element => {
            if (element.name){
                restaurantData.push(element);
            }
    });
        var htmlReturn = tableRows({"restaurants" : restaurantData});
        $("#restaurant-table > tbody").html(htmlReturn);
        $("#current-page").html(page);
    }).then(() => {
        //wait until the table is populated with restaurants before assigning click events
        $("tbody > tr").click(function(){
            var id = $(this).attr('data-id');
            currentRestaurant = restaurantData.find(element => element._id == id);
            $(".modal-title").html(currentRestaurant.name);
            $("#restaurant-address").html(currentRestaurant.address.building +" "+ currentRestaurant.address.street);
            $("#restaurant-modal").modal({
                "show":true
            });
        });
    });
}

$(document).ready(function(){
    $("#previous-page").click(()=>{
        if (page > 1) {
            page--;
            loadRestaurantData();
        }
    });
    $("#next-page").click(()=>{
            page++;
            loadRestaurantData();
    });

    $("#restaurant-modal").on("shown.bs.modal", function(){
        var [x, y] = currentRestaurant.address.coord;
        map = L.map('leaflet').setView([y, x], 18);
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1IjoieHlkYW4iLCJhIjoiY2t6NGUxa29wMGRuajJucHY5Yjhza2Q5YSJ9.nDrOczoScYpZBM7ktPr5Xw'
        }).addTo(map);
        // map = new L.map('leaflet', {
        //     center:[Math.round(x), Math.round(y)],
        //     zoom: 13,
        //     id: 'mapbox/streets-v11',
        //     accessToken: 'pk.eyJ1IjoieHlkYW4iLCJhIjoiY2t6NGUxa29wMGRuajJucHY5Yjhza2Q5YSJ9.nDrOczoScYpZBM7ktPr5Xw',
        //     layers: [
        //     new L.TileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}')
        //     ]
        // });
        // L.marker([Math.round(x), Math.round(y)]).addTo(map);
    });

    $("#restaurant-modal").on("hidden.bs.modal", function(){
        map.remove();
    });
});

loadRestaurantData();

