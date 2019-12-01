// Returns true, if the size of the component of the source is smaller, false otherwise.
function is_smaller(cy, edge) {
    var u = edge.source();
    var v = edge.target();
    cy.remove(edge);
    var u_size = u.component().nodes().length;
    var v_size = v.component().nodes().length;
    cy.add(edge);
    return u_size < v_size;
}

var uni_id = 0;
function move(cy, nodes, server) {
    nodes.style({'background-color' : 'red'});
    const free_nodes = get_free_nodes(server, nodes.length);
    for (let i = 0; i < nodes.length; i++) {
        var ele = cy.add({ 
            group: 'nodes', 
            data: { 
                id: uni_id, 
                parent: nodes[i].parent().data('id'),
                used : false
            },
            position: {x:nodes[i].position().x, y:nodes[i].position().y}
        });
        ele.style({'background-color' : 'blue'})
        uni_id++;
        nodes[i].move({'parent' : null});
        nodes[i].animate({
            position : free_nodes[i].position(),
            duration : 1000,
            complete : function name() {
                nodes[i].move({'parent' : server.data('id')});
                ele.style({'background-color' : 'grey'})
            }
        });
        cy.remove(free_nodes[i]);
    }
}

// Small-Large-Rebalance Algorithm
function slra(cy) {
    var edges = cy.edges();
    edges.slice(0,1).forEach(edge => {
        var u, v;
        // Assume w.l.o.g that the component of u is smaller than v's
        if (is_smaller(cy, edge)) {
            u = edge.source();
            v = edge.target();
        } else {
            u = edge.target();
            v = edge.source();
        }
        var server_of_u = u.parent();
        var server_of_v = v.parent();
        console.log("Servers: ", server_of_u.data('id'), server_of_v.data('id'));
        // If the two components are not assigned to the same server, we must merge them together.
        if (server_of_u.data('id') != server_of_v.data('id')) {
            cy.remove(edge); // Calculate size without the connection
            var size_of_u = u.component().nodes().length;
            var v_capacity = server_of_v.data('capacity');
            var v_server_size = server_of_v.data('current_size');
            var u_server_size = server_of_u.data('current_size');
            // If the server of v has available capacity that can fit the component of u,
            // move the component of u there. Otherwise move to a perfectly balanced assignment
            // respecting the connected components.
            if (v_capacity - v_server_size > size_of_u) {
                move(cy, u.component().nodes(), server_of_v);
                server_of_v.data('current_size', v_server_size + size_of_u);
                server_of_u.data('current_size', u_server_size - size_of_u);
            } else {
                //rebalance(cy, u, v);
            }
            cy.add(edge); // Reset edge.
        }
    });
}