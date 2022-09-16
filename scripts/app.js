const API_URL = "https://api.5scheduler.io/"
const MENUS = "getMenus"

function removeFader() {
    document.getElementById("fader").classList.add("fade-out");
    setTimeout(function () {
        document.getElementById("fader").remove();
    }, 500);
}

function toggle_theme() {
	if (document.documentElement.getAttribute("data-theme") != "dark") {
		document.documentElement.setAttribute('data-theme', 'dark');
		localStorage.setItem("theme", "dark");
	}
	else {
		document.documentElement.setAttribute('data-theme', 'light');
		localStorage.setItem("theme", "light");
	}
}

async function load_json_data(name) {
    return localforage.getItem(name);
}

async function save_json_data(name, data) {
    return localforage.setItem(name, data);
}

function replaceHtml(el, html) {
	var oldEl = typeof el === "string" ? document.getElementById(el) : el;
	/*@cc_on // Pure innerHTML is slightly faster in IE
		oldEl.innerHTML = html;
		return oldEl;
	@*/
	var newEl = oldEl.cloneNode(false);
	newEl.innerHTML = html;
	oldEl.parentNode.replaceChild(newEl, oldEl);
	/* Since we just removed the old element from the DOM, return a reference
	to the new element, which can be used to restore variable references. */
	return newEl;
};

async function generateSchools() {
    let database = await load_json_data("database");
    let el = document.getElementById("main-content");

    let flexbox = document.createElement("div");
    flexbox.id = "school-flexbox"

    for (let school_name of database.school_orderings) {
        let school_menu = database.menus[school_name];

        let school_div = document.createElement("button");
        school_div.className = `school-button ${school_name}`;
        school_div.innerHTML = `<b>${schoolToReadable(school_name)}</b>`;
        school_div.onclick = function () {
            generateCafes(school_name);
        };

        flexbox.appendChild(school_div);
    }

    el.removeChild(el.childNodes[0]);
    el.appendChild(flexbox);
}

document.getElementById("username").addEventListener("keyup", function(event) {
    // enter key using new api
    if (event.key.toLowerCase() === "enter") {
        document.getElementById("password").focus();
    }
});

document.getElementById("password").addEventListener("keyup", function(event) {
    // enter key using new api
    if (event.key.toLowerCase() === "enter") {
        get_balances();
    }
});

async function get_balances() {
    const info = document.getElementById("info");

    info.innerHTML = "<div class='loader'></div>";

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    const response = await fetch(`${API_URL}getClaremontBalances/${username}/${password}`);

    if (response.status == 200) {

        let data = await response.json();

        if (data.Err != undefined) {
            info.innerHTML = data.Err;
        } else {
            // Save data to global state
            database.claremont_login.username = username;
            database.claremont_login.password = password;   
            
            await save_json_data("database", database);
            
            const div = createBalancesDiv(data.Ok);
            info.innerHTML = div;
        }
    } else {
        info.innerHTML = "An error occurred.";
    }
}

function createBalancesDiv(balances) {
    let div = "";
    for (let account of balances) {
        div += `<span><b>${account.name}</b>: $${account.balance}<br></span>`;
    }
    return div;
}

function toApiSchool(school) {
	let l_school = school.toLowerCase();
	if (["hmc", "hm", "harvey", "mudd", "harveymudd", "harvey-mudd"].includes(l_school)) {
		return "HarveyMudd";
	} else if (["cmc", "cm", "claremont", "mckenna", "claremontmckenna", "claremont-mckenna"].includes(l_school)) {
		return "ClaremontMckenna";
	} else if (["scripps", "scripp", "scrps", "scrip", "scrips", "sc"].includes(l_school)) {
		return "Scripps";
	} else if (["pm", "po", "pomona", "pomna", "pom"].includes(l_school)) {
		return "Pomona"
	} else if (["pz", "pitz", "pitzer", "pitze", "ptz"].includes(l_school)) {
		return "Pitzer"
	}
}


function schoolToReadable(school) {
	switch (school) {
		case "HarveyMudd":
			return "Harvey Mudd College";
		case "ClaremontMckenna":
			return "Claremont McKenna College";
		case "Pomona":
			return "Pomona College";
		case "Pitzer":
			return "Pitzer College";
		case "Scripps":
			return "Scripps College";
	}
}

function schoolToAbbreviation(school) {
	switch (school) {
		case "HarveyMudd":
			return "HMC";
		case "ClaremontMckenna":
			return "CMC";
		case "Pomona":
			return "Pomona";
		case "Pitzer":
			return "Pitzer";
		case "Scripps":
			return "Scripps";
	}
}

async function generateCafes(school_name) {
    let database = await load_json_data("database");
    let el = document.getElementById("main-content");

    let flexbox = document.createElement("div");
    flexbox.id = "cafe-flexbox";

    if (database.menus[school_name].cafes.length == 1) {
        generateMenu(database.menus[school_name].cafes[0], school_name, single=true);
        return
    } else {
        // Append back button
        let back_button = document.createElement("button");
        back_button.id = "back-button";

        back_button.innerHTML = "Back";
        back_button.onclick = function () {
            generateSchools();
        };

        flexbox.appendChild(back_button);

        for (let cafe_menu of database.menus[school_name].cafes) {
            let cafe_div = document.createElement("button");
            cafe_div.className = `cafe-button`;
            cafe_div.innerHTML = `<b>${cafe_menu.name}</b>`;
            cafe_div.addEventListener("click", function () {
                generateMenu(cafe_menu, school_name);
            });
            flexbox.appendChild(cafe_div);
    
        }
        
        el.removeChild(el.childNodes[0]);
        el.appendChild(flexbox);
    }   
}

async function generateMenu(cafe_menu, school_name, single=false) {
    let database = await load_json_data("database");
    let el = document.getElementById("main-content");

    let flexbox = document.createElement("div");
    flexbox.id = "menu-flexbox";

    // Append back button
    let back_button = document.createElement("button");
    back_button.id = "back-button";
    
    back_button.innerHTML = "Back";

    if (single) {
        back_button.onclick = function () {
            generateSchools();
        };
    } else {
        back_button.onclick = function () {
            generateCafes(school_name);
        };
    }

    flexbox.appendChild(back_button);

    // Append name of cafe
    let cafe_name = document.createElement("h1");
    cafe_name.innerHTML = `<b>${cafe_menu.name}</b>`;
    flexbox.appendChild(cafe_name);

    if (cafe_menu.description.length > 5) {
        // Append description of cafe
        let cafe_description = document.createElement("p");
        cafe_description.innerHTML = cafe_menu.description;
        flexbox.appendChild(cafe_description);
    }

    // If there's to-go items, append them
    if (cafe_menu.to_go_items.length > 0) {
        let to_go_items_div = document.createElement("div");
        to_go_items_div.className = "day-part";
        
        to_go_items_div.onclick = function () {
            toggleMenuVisibility(this);
        };

        let to_go_items_title = document.createElement("h2");
        to_go_items_title.innerHTML = "To-Go Items";
        to_go_items_div.appendChild(to_go_items_title);

        let day_part_content = document.createElement("div");
        day_part_content.className = "day-part-content";

        // Append to go items
        for (let item of cafe_menu.to_go_items) {
            let item_div = createMeal(item);
            day_part_content.appendChild(item_div);
        }

        to_go_items_div.appendChild(day_part_content);

        flexbox.appendChild(to_go_items_div);
    }

    // Create menu from database
    for (let day_part of cafe_menu.day_menus) {
        if (day_part.menus.length == 0) {
            continue;
        }

        // Append date
        let day_part_div = document.createElement("div");
        day_part_div.className = "day-part";

        // Append a title div and a content div
        let day_part_title = document.createElement("h2");
        day_part_title.innerHTML = `<b>${parseDate(day_part.date)}</b>`;

        day_part_div.appendChild(day_part_title);

        let day_part_content = document.createElement("div");
        day_part_content.className = "day-part-content";

        for (let menu of day_part.menus) {
            let time_slot_div = document.createElement("div");

            time_slot_div.className = "time-slot";

            time_slot_div.onclick = function () {
                toggleMenuVisibility(this);
            };

            // Append time slot
            let time_slot_title = document.createElement("div");
            time_slot_title.className = "row time-slot";

            if (menu.time_opens.trim() == "") {
                time_slot_title.innerHTML = `<b>${menu.time_slot}</b>`;
            } else {
                time_slot_title.innerHTML = `<b>${menu.time_slot}: ${parseTime(menu.time_opens)} - ${parseTime(menu.time_closes)}</b>`;
            }

            time_slot_div.appendChild(time_slot_title);

            let time_slot_content = document.createElement("div");
            time_slot_content.className = "time-slot content hidden";
            // Append stations
            for (let station of menu.stations) {
                // Append station name
                let station_div = document.createElement("div");
                station_div.className = "station";

                let station_name = document.createElement("div");
                station_name.className = "station name";
                station_name.innerHTML = `<b>${station.name}</b>`;
                station_div.appendChild(station_name);

                let station_content = document.createElement("div");
                station_content.className = "station content";

                // Append meals
                for (let meal of station.meals.slice(0, 15)) {
                    let meal_div = createMeal(meal);

                    station_content.appendChild(meal_div);
                }

                if (station.meals.length > 15) {
                    let meal_div = document.createElement("div");
                    meal_div.className = "meal";
                    meal_div.innerHTML = `<b>more options hidden...</b>`;
                    station_content.appendChild(meal_div);
                }

                station_div.appendChild(station_content);
                time_slot_content.appendChild(station_div);
            }

            time_slot_div.appendChild(time_slot_content);

            day_part_content.appendChild(time_slot_div);
        }

        day_part_div.appendChild(day_part_content);

        flexbox.appendChild(day_part_div);

    }

    el.removeChild(el.childNodes[0]);
    el.appendChild(flexbox);
}

function createMeal(meal) {
    let meal_div = document.createElement("div");
    let meal_name = document.createElement("div");
    let meal_description = document.createElement("div");
    meal_div.className = "meal";

    meal_name.className = "meal name";
    meal_name.innerHTML = `<b>${normalizeTitleCapitalization(meal.name)}</b>`;

    meal_description.className = "meal description";

    if (meal.cost != null) {
        meal_description.innerHTML = `${(meal.cost / 100).toFixed(2)}<br><br>`;
    }

    meal_description.innerHTML += meal.notes;

    meal_div.appendChild(meal_name);
    meal_div.appendChild(meal_description);

    return meal_div;
}

function normalizeTitleCapitalization(str) {
    return str.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
}

function toggleMenuVisibility(el) {
    el.childNodes[1].classList.toggle("hidden");
}

function parseTime(time_str) {
    if (!time_str.includes(":")) {
        return time_str;
    }

    let split = time_str.split(":");

    let hour = split[0];
    let minute = split[1];

    let am_pm = "AM";
    
    if (hour >= 12) {
        hour -= 12;
        am_pm = "PM";
    }

    if (hour == 0) {
        hour = 12;
    }

    return `${hour}:${minute} ${am_pm}`;
}

function parseDate(date_str) {
    // Formatted yyyy-mm-dd
    // Want to return as Monday, January 1, 2020
    let split = date_str.split("-");

    let date = new Date(split[0], split[1] - 1, split[2], 0, 0, 0, 0);

    let day = date.getDay();

    let month = date.getMonth();

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // If it's today, bold it


    if (date.getDate() == new Date().getDate()) {
        return `Today`;
    } else {
        return `${days[day]}, ${months[month]} ${date.getDate()}, ${date.getFullYear()}`;

    }

}