async function startup() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../sw.js', {scope: '../'})
            .then(function (registration) {
                console.log('Registration successful, scope is:', registration.scope);
            })
            .catch(function (error) {
                console.log('Service worker registration failed, error:', error);
            });
    }


    let current_data = await load_json_data("database") ?? false;

    let api_update = fetch(`${API_URL}${MENUS}`);

    if (current_data && validData(current_data, database)) {
        database = current_data;
    }

    if (database.claremont_login.username !== "" && database.claremont_login.password !== "") {
        document.getElementById("username").value = database.claremont_login.username;
        document.getElementById("password").value = database.claremont_login.password;
        get_balances();
    }

    api_update = await api_update;

    let response = await api_update.json();

    if (response != undefined && response != "No update needed") {
        database.menus = response;
        await save_json_data("database", database);
    } else {
        console.error("Could not fetch menu update!");
    }

    console.log("Database:", database);

    generateSchools();

    setTimeout(() => {
        removeFader();
    }, 500);
}

function validData(data, template) {
    let valid = true;
    for (let key in template) {
        if (template.hasOwnProperty(key)) {
            if (data.hasOwnProperty(key)) {
                if (typeof template[key] === "object") {
                    valid = validData(data[key], template[key]);
                }
            } else {
                valid = false;
            }
        }
    }
    return valid;
}

startup();