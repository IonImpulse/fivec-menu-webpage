var selected_items = [];
var disallowed_items = [];
var cafe_menu = [];

const MAX_ITEMS = 5;

const flex_el = document.getElementById("flex-remaining");
const flex_rem_el = document.getElementById("remaining-flex-amount");

// Start webworker permute.js
const permute_worker = new Worker("scripts/webworkers/permute.js?v=1.0.2");

function updateAmountOfFlex() {
    flex_el.value = database.flex_remaining;
    setTimeout(() => {
        updateRemainingFlex();
    }, 100);
}

function updateRemainingFlex() {
    let temp_flex = localStringToNumber(flex_el.value) ?? 0;

    temp_flex = temp_flex * 100;

    for (let item_name of selected_items) {
        let item = cafe_menu.find(item => atob(item_name) == item.name);
        temp_flex -= item.cost;
    }

    temp_flex = temp_flex / 100

    flex_rem_el.innerHTML = numToCurrency(temp_flex);
}


flex_el.addEventListener("focus", onFocus);
flex_el.addEventListener("blur", onBlur);
flex_el.addEventListener("change", onBlur);
flex_el.addEventListener("change", updateRemainingFlex);


function localStringToNumber(s) {
    return Number(String(s).replace(/[^0-9.-]+/g, ""))
}

function onFocus(e) {
    var value = e.target.value;
    e.target.value = value ? localStringToNumber(value) : ''
}

function numToCurrency(num) {
    var options = {
        maximumFractionDigits: 2,
        currency: "USD",
        style: "currency",
        currencyDisplay: "symbol"
    }

    return (num || num === 0)
        ? localStringToNumber(num).toLocaleString(undefined, options)
        : ''
}

function onBlur(e) {
    var value = e.target.value;

    e.target.value = numToCurrency(value);
}

function setCafe() {
    const cafe = document.getElementById("cafe-select").value;

    switch (cafe) {
        case "0":
            cafe_menu = database.menus["HarveyMudd"]["cafes"][1];
            break;
        case "1":
            cafe_menu = database.menus["HarveyMudd"]["cafes"][2];
            break;
        case "2":
            cafe_menu = database.menus["Pomona"]["cafes"][4];
            break;
        case "3":
            cafe_menu = database.menus["ClaremontMckenna"]["cafes"][1];
            break;
        default:
            cafe_menu = [];
    }

    let name = cafe_menu["name"];

    cafe_menu = cafe_menu["to_go_items"];

    // sort by name
    cafe_menu.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        } else {
            return 0;
        }
    });
}

function show_item_list_popup() {
    const popup = document.getElementById("item-list-popup");

    const container = document.getElementById("item-list-container");

    setCafe();   

    let divs = [];

    for (let item of cafe_menu) {
        divs.push(generateFlexItemDiv(item));
    }

    let header = generateFlexItemHeader(name);

    container.innerHTML = header + divs.join("\n");

    for (let item of cafe_menu) {
        updateList(btoa(item.name));
    }

    popup.style.display = "block";
}

function close_item_list_popup() {
    const added_items = document.getElementById("added-items");
    added_items.innerHTML = "<b>Added Items:</b><br>"
    for (let item of selected_items) {
        let item_name = atob(item);

        added_items.innerHTML += `${item_name}<br>`;
    }

    const popup = document.getElementById("item-list-popup");
    popup.style.display = "none";
}


// Item has props of:
// name, notes, cost
function generateFlexItemDiv(item) {
    // Count num of times name is in selected_items
    let num = 0;

    for (let i of selected_items) {
        if (i.name === item.name) {
            num++;
        }
    }

    return `<div class="flex-item">
        <div class="flex-item-info">
            <div>${item.name}</div>
            <div class="notes">${item.notes}</div>
            <div>${numToCurrency(item.cost / 100)}</div>
        </div>

        <div class="flex-item-buttons">
            <button class="flex-item-remove" onclick="removeFlexItem('${btoa(item.name)}')">-</button>
            <div id="flex-item-amount-${cafe_menu.indexOf(item)}" class="flex-item-amount">${num}</div>
            <button class="flex-item-add" onclick="addFlexItem('${btoa(item.name)}')">+</button>
        </div>
    </div>`
}

function generateFlexItemHeader(name) {
    return `<div class="flex-item-header">
        <h1>${name}</h1>
        <button class="close-popup" onclick="close_item_list_popup()">X</button>
    </div>`
}

function removeFlexItem(item_name) {
    let index = selected_items.indexOf(item_name);

    if (index > -1) {
        selected_items.splice(index, 1);
    } else {
        disallowed_items.push(item_name);
    }

    updateRemainingFlex();
    updateList(item_name);
}

function addFlexItem(item_name) {
    let index = disallowed_items.indexOf(item_name);
    
    if (index > -1) {
        disallowed_items.splice(index, 1);
    } else {
        selected_items.push(item_name);
    }

    updateRemainingFlex();
    updateList(item_name);
}

function updateList(item_name) {
    // Encode item name
    let item_name_real = atob(item_name);

    if (disallowed_items.includes(item_name)) {
        document.getElementById(`flex-item-amount-${cafe_menu.findIndex(item => item.name === item_name_real)}`).innerHTML = "X";
        return;
    }

    // Count num of times name is in selected_items
    let num = 0;

    for (let i of selected_items) {
        if (i === item_name) {
            num++;
        }
    }

    let index = cafe_menu.findIndex(item => item.name === item_name_real);

    let div = document.getElementById(`flex-item-amount-${index}`);

    div.innerHTML = num;
}


// Given flex_remaining, and a list of items with cost, return the 10 best combination
// of items to get as close to flex_remaining as possible without going over.
// If allow_claremont is true, then allow going over if the abs difference is closer
function auto_solve() {
    setCafe();
    updateRemainingFlex();
    
    // Get flex remaining
    let flex_rem = localStringToNumber(document.getElementById("remaining-flex-amount").innerHTML);

    // Remove disallowed items
    let items = cafe_menu.filter(item => !disallowed_items.includes(btoa(item.name)));

    // Solve!
    // Use permute.js webworker

    let results_div = document.getElementById("auto-solve-items");

    if (flex_rem >= 30) {
        results_div.innerHTML = "Please reduce the amount of flex remaining to solve, either by adding items or choosing a lower flex value.";
        return;
    }

    if (flex_rem >= 20) {
        results_div.innerHTML = "Solving (this may take a while)...";
    } else {
        results_div.innerHTML = "Solving...";
    }

    let interval = setInterval(() => {
        results_div.innerHTML += ".";
    }, 500);

    permute_worker.postMessage({
        "items": items,
        "flex_rem": flex_rem,
        "MAX_ITEMS": MAX_ITEMS
    });

    permute_worker.onmessage = function(e) {
        let results = e.data;
        displayResults(results, items, flex_rem);
        // clear interval
        clearInterval(interval);
    }
}

function displayResults(results, items, flex_rem) {
    results = results.slice(0, 100);

    // Display results
    let results_div = document.getElementById("auto-solve-items");

    results_div.innerHTML = "";

    for (let result of results) {
        let div = document.createElement("div");

        let display_text = [];

        for (let cost of result["items"]) {
            let to_push = {"cost": numToCurrency(cost/100)};

            // Find all items with this cost
            let items_with_cost = items.filter(item => item.cost === cost);

            if (items_with_cost.length === 1) {
                to_push.name = items_with_cost[0].name;
                to_push.mult = 1;
            } else {
                // Combine items with "OR"
                to_push.name = items_with_cost.map(x => x.name).join(" OR ");
                to_push.mult = 1;
            }

            for (let i of display_text) {
                if (i.name === to_push.name) {
                    i.mult++;
                    to_push = null;
                    break;
                }
            }

            if (to_push) {
                display_text.push(to_push);
            }
            
        }

        div.className = "auto-solve-item";

        let index = 1;
        for (let i of display_text) {
            let item_div = document.createElement("div");
            item_div.className = "auto-solve-item-info";
            item_div.innerHTML = `<b>${index}:</b> (${i.cost} x${i.mult}) <i>${i.name}</i>`;
            div.appendChild(item_div);
            index++;
        }

        let flex_rem_div = document.createElement("div");
        flex_rem_div.className = "auto-solve-item-remaining";
        flex_rem_div.innerHTML = `Flex Remaining: ${numToCurrency(Math.round(result.remaining) / 100)}`;
        div.appendChild(flex_rem_div);

        results_div.appendChild(div);
    }
}
