const y_distance = 50;
const x_distance = 50;
var server_id = 0;
var x_position = 0;
var number_of_edges = 0;

function increment_stats(){ 
    server_id++;
    x_position += x_distance * 2;
}

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



function create_server(cy, num_nodes, free_space) {
    var server = 'server_' + server_id;
    var server_node = {
        data: {
            id: server,
            capacity : num_nodes + free_spaces,
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
                used : i < num_nodes
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
    cy.add(server_node);
    var node_eles = cy.add(nodes);
    var free_eles = cy.add(free_nodes);
    cy.fit();
    node_eles.style('background-color', 'green');
    free_eles.style('background-color', 'grey');
    increment_stats();
}
