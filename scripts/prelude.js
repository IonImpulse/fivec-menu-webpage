const colors = [
    1,2,3,4,5,6,7,8,9
];

var database = {
    menus: {},
    favorite_items: [],
    school_orderings: [
        "HarveyMudd",
        "Pomona",
        "Scripps",
        "ClaremontMckenna",
        "Pitzer",
    ],
    claremont_login: {
        username: "",
        password: "",
    },
    flex_remaining: -1,
    style: "by_meal",
    selected_day: null,
    selected_meal: null,
};

var vertical_layout = false;

// *****
// Prelude functions
// *****
function getTheme() {
    let theme = localStorage.getItem("theme");
    if (theme == null) {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        if (darkThemeMq.matches) {
            theme = "dark";
        } else {
            theme = "light";
        }
        localStorage.setItem("theme", theme);
    }

    if (theme == "light") {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function isVerticalLayout() {
    vertical_layout = window.matchMedia("only screen and (max-width: 760px)").matches;
    return vertical_layout;
}

document.addEventListener("keydown", function (event) {
    if (event.code === "Enter") {
        document.activeElement.click();
    }
});

function adjusted_stations(stations) {
    const top = ["exhibition", "creations", "chef corner", "expo station", "mainline", "global", "expo", "@home"];
    const bottom = ["bakery", "desserts", "sweets", "beverages", "toppings & condiments"]; 

    const to_remove = ["miscellaneous", "condiments", "chocolate chip cookies"];

    let adjusted = [];
    let top_count = 0;

    for (let station of stations) {
        if (to_remove.includes(station.name.toLowerCase())) {
            continue;
        }

        if (top.includes(station.name.toLowerCase())) {
            adjusted.unshift(station);
            top_count++;
        } else if (bottom.includes(station.name.toLowerCase())) {
            adjusted.push(station);
        } else {
            adjusted.splice(top_count, 0, station);
        }
    }

    return adjusted;
}

getTheme();
isVerticalLayout();