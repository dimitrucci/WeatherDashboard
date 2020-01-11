$(function () {
    let history = [];

    const cityName = $('#cityName');
    const cityDate = $('#cityDate');
    const cityImg = $('#cityImg');
    const tValue = $('#t-value');
    const wValue = $('#w-value');
    const iValue = $('#i-value');
    const hValue = $('#h-value');
    let ajaxData;
    let today;


    function getHistory () {
        $('#history').empty();
        if (localStorage.getItem('history')){
            history = JSON.parse(localStorage.getItem('history'));
            history.forEach((item) => {
                let historyItem = $("<div class='history-item'></div>");
                historyItem.text(item);
                $('#history').addClass('active');
                $('#history').append(historyItem);
            })
        }
    }

    getHistory();


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude.toFixed(4);
            const longitude = position.coords.longitude.toFixed(4);
            getWithLatitudes(latitude, longitude);
        })
    }

    function getWithLatitudes(lat, lon) {
        if (history && history.length>0) {
            getWithCity(history[0]);
            return;
        }
        $.ajax({
            url: `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&cnt=6&appid=a3f53024b94463abe3e782ec0818c7e3`,
            success: function(data){
                iValue.text(data.value)
            }
        });
        $.ajax({
            url: `http://api.openweathermap.org/data/2.5/forecast/daily?units=imperial&lat=${lat}&lon=${lon}&cnt=6&appid=a3f53024b94463abe3e782ec0818c7e3`,
            success: function(data){
                ajaxData = Object.assign({}, data);
                today = ajaxData.list[0];
                ajaxData.list.splice(0, 1);
                console.log(ajaxData.list);
                cityName.text(ajaxData.city.name);
                cityDate.text(`(${moment().format('L')})`);
                tValue.text(today.temp.day);
                hValue.text(today.humidity);
                wValue.text(today.speed);
                let img = $(`<img src="https://openweathermap.org/img/wn/${today.weather[0].icon}.png">`);
                cityImg.empty();
                cityImg.append(img);
                ajaxData.list.forEach((item, index) => {
                    let dayItem = $(`<div class='day-item'>
                    <div class="date">
                    ${moment().add(index+1, 'days').format('L')}
                    </div>
                    <div class="img">
                        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
                    </div>
                    <div class="temp">
                        Temp: <span class="temp-value">${item.temp.day}</span> &#8457;
                    </div>
                    <div class="humidity">
                        Humidity: <span class="hum-value">${item.humidity}</span> %
                    </div></div>`);
                    $('#other').append(dayItem);
                })
            }
        });
    }


    function getWithCity(city) {
        $.ajax({
            url: `http://api.openweathermap.org/data/2.5/forecast/daily?units=imperial&q=${city}&cnt=6&appid=a3f53024b94463abe3e782ec0818c7e3`,
            success: function(data){
                localHistory(city);
                $.ajax({
                    url: `http://api.openweathermap.org/data/2.5/uvi?lat=${data.city.coord.lat}&lon=${data.city.coord.lon}&cnt=6&appid=a3f53024b94463abe3e782ec0818c7e3`,
                    success: function(data){
                        iValue.text(data.value)
                    }
                });
                ajaxData = Object.assign({}, data);
                today = ajaxData.list[0];
                ajaxData.list.splice(0, 1);
                console.log(ajaxData.list);
                cityName.text(ajaxData.city.name);
                cityDate.text(`(${moment().format('L')})`);
                tValue.text(today.temp.day);
                hValue.text(today.humidity);
                wValue.text(today.speed);
                let img = $(`<img src="https://openweathermap.org/img/wn/${today.weather[0].icon}.png">`);
                cityImg.empty();
                cityImg.append(img);
                $('#other').empty();
                ajaxData.list.forEach((item, index) => {
                    let dayItem = $(`<div class='day-item'>
                    <div class="date">
                    ${moment().add(index+1, 'days').format('L')}
                    </div>
                    <div class="img">
                        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
                    </div>
                    <div class="temp">
                        Temp: <span class="temp-value">${item.temp.day}</span> &#8457;
                    </div>
                    <div class="humidity">
                        Humidity: <span class="hum-value">${item.humidity}</span> %
                    </div></div>`);
                    $('#other').append(dayItem);
                })
            }
        });
    }


    function localHistory(text){
        if (history.includes(text)){
            history.splice(history.indexOf(text), 1)
        }
        history.unshift(text);
        localStorage.setItem('history', JSON.stringify(history));
        getHistory()
    }


    let input = $('#search-input');
    let search = $('#search');
    search.on('click', function () {
        let text = input.val().toLowerCase();
        getWithCity(text);
        input.val('')
    });


    $(document).on('click','.history-item', function () {
        let text = this.innerText.toLowerCase();
        getWithCity(text)
    })
});
