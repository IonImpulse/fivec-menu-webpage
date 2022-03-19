const API_URL = "https://api.5scheduler.io/"
const MENUS = "getMenus"

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
            console.log(school_name);
            generateCafes(school_name);
        };

        flexbox.appendChild(school_div);
    }

    el.removeChild(el.childNodes[0]);
    el.appendChild(flexbox);
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
            console.log(cafe_menu);
    
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

    // Create menu from database
    for (let day_part of cafe_menu.day_menus) {
        // Append date
        let day_part_div = document.createElement("div");
        day_part_div.className = "day-part";

        day_part_div.onclick = function () {
            toggleMenuVisibility(this);
        };

        // Append a title div and a content div
        let day_part_title = document.createElement("h2");
        day_part_title.innerHTML = `<b>${day_part.date}</b>`;

        day_part_div.appendChild(day_part_title);

        let day_part_content = document.createElement("div");
        day_part_content.className = "day-part-content hidden";

        for (let menu of day_part.menus) {
            // Append time slot
            let time_slot_div = document.createElement("div");
            time_slot_div.className = "row time-slot";
            time_slot_div.innerHTML = `<b>${menu.time_slot}: ${parseTime(menu.time_opens)} - ${parseTime(menu.time_closes)}</b>`;

            day_part_content.appendChild(time_slot_div);

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
                for (let meal of station.meals) {
                    let meal_div = document.createElement("div");
                    meal_div.className = "meal";
                    meal_div.innerHTML = `<b>${meal.name}</b>`;
                    station_content.appendChild(meal_div);
                }

                station_div.appendChild(station_content);
                day_part_content.appendChild(station_div);

            }
        }

        day_part_div.appendChild(day_part_content);

        flexbox.appendChild(day_part_div);

    }
    
    el.removeChild(el.childNodes[0]);
    el.appendChild(flexbox);
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