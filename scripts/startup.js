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

    if (current_data) {
        database = current_data;
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

startup();