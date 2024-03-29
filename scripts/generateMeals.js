async function generateMeals() {
    let el = document.getElementById("home-screen");
    el.innerHTML = "";
    let flexbox = document.createElement("div");
    flexbox.id = "meals-flexbox"

    const day_selector = document.createElement("div");
    day_selector.id = "day-selector";
    day_selector.className = "selector";

    // Create 5 buttons, one for the next five days
    let today = new Date();

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
        const day_button = document.createElement("button");
        let day = getYYYYMMDD(today);
        day_button.id = `day-${day}`;
        day_button.innerText = days[today.getDay()];

        if (i == 0) {
            day_button.innerText = "Today";
        }

        day_button.addEventListener("click", () => {
            database.selected_day = day;
            updateDayMeal();
        });

        day_selector.appendChild(day_button);
        today.setDate(today.getDate() + 1);
    }
    
    const meal_selector = document.createElement("div");
    meal_selector.id = "meal-selector";
    meal_selector.className = "selector";

    // Create 4 buttons, one for each meal
    const meals = ["Brunch", "Breakfast", "Lunch", "Dinner", "Night"];
    for (let i = 0; i < 5; i++) {
        const meal_button = document.createElement("button");
        meal_button.id = `meal-${meals[i]}`;
        meal_button.innerText = meals[i];
        meal_button.addEventListener("click", () => {
            database.selected_meal = meals[i];
            updateDayMeal();
        });

        if (meals[i] == "Brunch") {
            meal_button.classList.add("hidden");
        }

        meal_selector.appendChild(meal_button);
    }

    today = new Date();
    database.selected_meal = meals[determineMealToShow()];
    database.selected_day = getYYYYMMDD(today);

    flexbox.appendChild(day_selector);
    flexbox.appendChild(meal_selector);

    today = new Date();
    
    for (let i = 0; i < 7; i++) {
        // format as YYYY-MM-DD
        let format_date = getYYYYMMDD(today);

        for (let i = 0; i < 4; i++) {
            const meals = getMealsAtTime(database.menus, format_date, i);
            if (Object.values(meals).length > 0) {
                let meal_el = createMealElement(meals, format_date, i);
                flexbox.appendChild(meal_el);
            }
        }      
        
        today.setDate(today.getDate() + 1);
    }
    
    el.appendChild(flexbox);

    updateDayMeal();
}

function getYYYYMMDD(date) {
    return date.getFullYear() + "-" + (date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
}

function updateDayMeal() {
    let meal_selector = document.getElementById("meal-selector");
    let day_selector = document.getElementById("day-selector");

    let time_slots = [];

    let meals = getMealsAtTime(database.menus, database.selected_day, 0);

    for (let school of Object.values(meals)) {
        for (let cafe of school) {
            time_slots.push(cafe.meal.time_slot)
        }
    }

    time_slots = Array.from(new Set(time_slots));


    if (time_slots.includes("Brunch")) {
        meal_selector.children[0].classList.remove("hidden");
        meal_selector.children[1].classList.add("hidden");
        meal_selector.children[2].classList.add("hidden");
        if (database.selected_meal == "Breakfast" || database.selected_meal == "Lunch") {
            database.selected_meal = "Brunch";
        }
    } else {
        meal_selector.children[0].classList.add("hidden");
        meal_selector.children[1].classList.remove("hidden");
        meal_selector.children[2].classList.remove("hidden");
        if (database.selected_meal == "Brunch") {
            database.selected_meal = "Breakfast";
        }
    }

    for (let i = 0; i < meal_selector.children.length; i++) {
        if (meal_selector.children[i].id == `meal-${database.selected_meal}`) {
            meal_selector.children[i].classList.add("selected");
        } else {
            meal_selector.children[i].classList.remove("selected");
        }
    }

    for (let i = 0; i < day_selector.children.length; i++) {
        if (day_selector.children[i].id == `day-${database.selected_day}`) {
            day_selector.children[i].classList.add("selected");
        } else {
            day_selector.children[i].classList.remove("selected");
        }
    }

    
    let els = document.getElementsByClassName("meal-full");
    for (let el of els) {
        el.classList.add("hidden");
    }
    let el = document.getElementById(`meal-${database.selected_day}-${database.selected_meal}`);

    if (el == null && database.selected_meal != "Night") {
        el = document.getElementById(`meal-${database.selected_day}-Brunch`);
    }
    
    if (el != null) {
        el.classList.remove("hidden");
    }
}

function getMealsAtTime(menus, day_to_get, meal_to_get) {
    let meals = {};
    for (let school of Object.values(menus)) {
        for (let cafe of school.cafes) {
            for (let menu of cafe.day_menus) {
                if (menu.date === day_to_get) {
                    if (menu.menus[meal_to_get] != undefined) {
                        let obj = {
                            meal: menu.menus[meal_to_get],
                            cafe: cafe.name
                        };

                        if (meals[school.school] == undefined) {
                            meals[school.school] = [obj];
                        } else {
                            meals[school.school].push(obj);
                        }
                    }
                }
            }
        }
    }
    return meals;
}

function mode(array) {
    if (array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for (var i = 0; i < array.length; i++) {
        var el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

function createMealElement(meals, format_date) {
    let all_names = [];

    for (let name of Object.values(meals)) {
        all_names.push(name[0].meal.time_slot);
    }

    // choose most common time slot
    let name = mode(all_names);

    let meal_el = document.createElement("div");
    meal_el.classList.add("meal-full");
    meal_el.classList.add("hidden");

    meal_el.id = "meal-" + format_date + "-" + name;

    let buttons = document.createElement("div");
    buttons.classList.add("meal-buttons");
    for (let school of Object.keys(meals)) {
        // Scroll to school
        let button = document.createElement("button");
        button.classList.add("meal-button");
        button.classList.add(school);
        button.innerText = schoolToAbbreviation(school);
        button.onclick = () => {
            let school_el = document.getElementById(`${school}-${name}-${format_date}`);
            school_el.scrollIntoView();
        }

        buttons.appendChild(button);
    }

    meal_el.appendChild(buttons);

    for (let school of Object.keys(meals)) {
        let school_el = document.createElement("div");
        school_el.classList.add("school");
        school_el.id = `${school}-${name}-${format_date}`;

        let school_name_el = document.createElement("div");
        school_name_el.classList.add("school-name");
        school_name_el.classList.add(school);

        school_name_el.innerText = schoolToReadable(school);
        school_el.appendChild(school_name_el);

        for (let meal of meals[school]) {
            let cafe_name_el = document.createElement("div");
            cafe_name_el.classList.add("cafe-name");

            if (meal.meal.time_opens.trim() == "") {
                cafe_name_el.innerHTML = `${meal.cafe}`;
            } else {
                cafe_name_el.innerHTML = `${meal.cafe}<br>${parseTime(meal.meal.time_opens)} - ${parseTime(meal.meal.time_closes)}`;
            }

            let meal_text_el = document.createElement("div");
            meal_text_el.classList.add("meal-container");

            let stations = adjusted_stations(meal.meal.stations);

            for (let station of stations) {
                let station_el = document.createElement("div");
                station_el.classList.add("meal-station");
                
                let station_name_el = document.createElement("div");
                station_name_el.classList.add("station-name");
                station_name_el.innerText = normalizeTitleCapitalization(station.name);

                let station_items_el = document.createElement("div");
                station_items_el.classList.add("station-items");
                // only get first 10
                let items = station.meals.slice(0, 10);
                station_items_el.innerHTML = `<ul>${items.map(x => "<li>" + normalizeTitleCapitalization(x.name) + "</li>").join("")}</ul>`;

                let stations_dietary_el = document.createElement("div");
                stations_dietary_el.classList.add("station-dietary");
                let dietary_options = station.meals.map(x => x.dietary_options);

                let dietary_options_set = new Set();
                for (let options of dietary_options) {
                    for (let option of options) {
                        if (option.contains === true) {
                            dietary_options_set.add(option.food.Other ?? option.food);
                        }
                    }
                }

                stations_dietary_el.innerText = Array.from(dietary_options_set).join(", ");

                station_el.appendChild(station_name_el);
                station_el.appendChild(station_items_el);

                if (stations_dietary_el.innerText != "") {
                    station_el.appendChild(stations_dietary_el);
                }
                
                meal_text_el.appendChild(station_el);
            }


            school_el.appendChild(cafe_name_el);
            school_el.appendChild(meal_text_el);
        }


        meal_el.appendChild(school_el);
    }

    return meal_el;
}