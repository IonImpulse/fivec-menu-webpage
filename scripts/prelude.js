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
    ]
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


getTheme();
isVerticalLayout();