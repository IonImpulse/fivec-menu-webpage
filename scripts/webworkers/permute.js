onmessage = function(e) {
    let data = e.data;
    let flex_rem = data.flex_rem;
    let items = data.items;
    let MAX_ITEMS = data.MAX_ITEMS;

    let results = return_best_solutions(flex_rem, items, MAX_ITEMS);

    postMessage(results);
}

// Start from 0 to max_num_items
// Reduce items to a non-duplicated list of costs
// Sort costs in ascending order
// Permute all options
function return_best_solutions(flex_rem, items, max_num_items) {
    flex_rem = flex_rem * 100;

    // Reduce items to a non-duplicated list of costs
    let costs = [];
    for (let item of items) {
        if (!costs.includes(item.cost)) {
            costs.push(item.cost);
        }
    }

    // Sort costs in ascending order
    costs.sort((a, b) => a - b);

    // Set max num items to be at least flex_rem/max_cost * 2
    let max_cost = costs[costs.length - 1];
    let max_num_items_from_cost = Math.floor(flex_rem / max_cost) * 2;

    max_num_items = Math.max(max_num_items, max_num_items_from_cost);
    console.log("Max num items: " + max_num_items);

    // Permute all options
    let best_solutions = [];

    for (let num_items = 0; num_items <= max_num_items; num_items++) {
        let permutations = permute_allow_duplication(flex_rem, costs, num_items);

        // Remove duplicates
        permutations = permutations.filter((item, index) => permutations.indexOf(item) === index);

        for (let permutation of permutations) {
            let sum = 0;
            for (let cost of permutation) {
                sum += cost;
            }

            if (sum <= flex_rem) {
                let remaining = flex_rem - sum;
                best_solutions.push({"remaining": remaining, "items": permutation});
            }
        }
    }

    // Sort by lowest remaining
    best_solutions.sort((a, b) => a["remaining"] - b["remaining"]);

    return best_solutions;
}

function permute(flex_rem, costs, num_items) {
    let permutations = [];

    // Costs are in order, so we can just start from the first cost
    for (let i = 0; i < costs.length; i++) {
        let cost = costs[i];

        // If we can't afford it, then skip
        if (cost > flex_rem) {
            continue;
        }

        // If we can afford it, then add it
        if (num_items === 1) {
            permutations.push([cost]);
        } else {
            // Get all permutations of the rest of the costs
            let rest_permutations = permute(flex_rem - cost, costs.slice(i + 1), num_items - 1);

            // Add the current cost to each permutation
            for (let permutation of rest_permutations) {
                permutation.unshift(cost);
                permutations.push(permutation);
            }
        }
    }

    return permutations;
}

function permute_allow_duplication(flex_rem, costs, num_items) {
    let permutations = [];

    // Costs are in order, so we can just start from the first cost
    for (let i = 0; i < costs.length; i++) {
        let cost = costs[i];

        // If we can't afford it, then skip
        if (cost > flex_rem) {
            continue;
        }

        // If we can afford it, then add it
        if (num_items === 1) {
            permutations.push([cost]);
        } else {
            // Get all permutations of the rest of the costs
            let rest_permutations = permute_allow_duplication(flex_rem - cost, costs.slice(i), num_items - 1);

            // Add the current cost to each permutation
            for (let permutation of rest_permutations) {
                permutation.unshift(cost);
                permutations.push(permutation);
            }
        }
    }

    return permutations;
}