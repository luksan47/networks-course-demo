const y_distance = 50;
const x_distance = 50;
var server_id = 0;
var x_position = 0;

function increment_stats(){ 
    server_id++;
    x_position += x_distance * 2;
}

function add_random_connections(eles) {
    
}

function create_server(cy, num_nodes, free_space) {
    var server = 'server_' + server_id;
    var server_node = [{ data: { id: server }}];
    var nodes = [];
    var free_nodes = [];
    var y_position = 0;
    for(var i = 0; i < num_nodes + free_space; i++) {
        var node = { 
            group: 'nodes', 
            data: { 
                id: server + '_node_' + i, 
                parent: server,
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
