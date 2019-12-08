const y_distance = 50;
const x_distance = 50;
var server_id = 0;
var x_position = 0;
var number_of_edges = 0;

function increment_stats(){ 
    server_id++;
    x_position += x_distance * 2;
}

/**
 * Adds a random connection into the graph, respecting already existing IDs and free spots.
 * @param {*} cy The main class for the CytoScape Graph
 */
function add_random_connections(cy) {
    // Get the nodes of the servers.
    var nodes = cy.filter(function(element, i){
        return element.isNode() && element.isChild() && element.data('used');
    });
    
    var source_id = Math.floor(Math.random() * nodes.length);
    var target_id = Math.floor(Math.random() * nodes.length);
    target_id = target_id == source_id ? (target_id + 1) % nodes.length : target_id;

    var eles = cy.add({
        group: 'edges',
        data: {
            id: 'edge_' + number_of_edges,
            source: nodes[source_id].data('id'),
            target: nodes[target_id].data('id')
        }
    });
    number_of_edges++;
    return eles;
}

/**
 * Instatiates a server and fills it appropriately with unused and used spaces. Yellow/Black coloring for Majority Voting only respects L = 2 server scenario as defined.
 * @param {*} cy The main class for the CytoScape Graph
 * @param {*} num_nodes Number of actual peers / used spaces. The base capacity K of server.
 * @param {*} free_space Number of unused spaces, a.k.a. the server Augmentation Epsilon.
 */
function create_server(cy, num_nodes, free_space) {
    var server = 'server_' + server_id;
    var colormatch = (server_id == 0) ? 'yellow' : 'black';
    var server_node = {
        data: {
            id: server,
            capacity : num_nodes + free_space,
            current_size : num_nodes
        }
    };
    var nodes = [];
    var free_nodes = [];
    var y_position = 0;
    for(var i = 0; i < num_nodes + free_space; i++) {
        var node = { 
            group: 'nodes', 
            data: { 
                id: server + '_node_' + i, 
                parent: server,
                used : i < num_nodes,
                colorid: server,
            },
            position: { 
                x: x_position,
                y: y_position  
            }
        };
        if (i < num_nodes) {
            nodes.push(node);
        } else {
            free_nodes.push(node);
        }
        if ((i + 1) % 5 == 0) {
            y_position = 0;
            x_position += x_distance;
        } else {
            y_position += y_distance;
        }
    }
    var server_eles = cy.add(server_node);
    var node_eles = cy.add(nodes);
    var free_eles = cy.add(free_nodes);
    server_eles.style('events','no');
    node_eles.style('background-color', 'green');
    node_eles.style('border-color', colormatch);
    node_eles.style('border-width', 2);
    free_eles.style('background-color', 'grey');
    free_eles.style('events','no');
    cy.fit();
    increment_stats();
}

/**
 * Lists all of the unused spaces, remaining augmentation size, in the given server.
 * @param {*} server The server in which we need to find the unused spaces in.
 */
function get_all_free_nodes(server) {
    var free_nodes = [];
    server.children().forEach(node => {
        if (!node.data('used')) {
            free_nodes.push(node);
        }
    });

    return free_nodes;
}

/**
 * Gives the given necessary amount of free spaces remaining in a server, so that only the necessary ones will be filled in.
 * @param {*} server The server in which we need to find the unused spaces in.
 * @param {*} num The number of unused spaces we are going to query.
 */
function get_free_nodes(server, num) {
    var free_nodes = [];
    server.children().forEach(node => {
        if (!node.data('used')) {
            free_nodes.push(node);
        }
    });
    
    return free_nodes.slice(0, num);
}