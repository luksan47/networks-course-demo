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
                nodes[i].style({'background-color' : 'green'})
                ele.style({'background-color' : 'grey'})
            }
        });
        cy.remove(free_nodes[i]);
    }
}

// Small-Large-Rebalance Algorithm
function slra(cy) {
    var edges = cy.edges();
    edges.forEach(edge => {
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
            console.log("Capacity: ", v_capacity - v_server_size);
            console.log("Size of Cu: ", size_of_u);
            if (v_capacity - v_server_size >= size_of_u) {
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

// Small-Large-Rebalance Alternative Call
function slra_alt(cy, sourceNode, targetNode, addedEles) {
    cy.remove(addedEles);
    var u_size = sourceNode.component().nodes().length;
    var v_size = targetNode.component().nodes().length;
    var u_bool = u_size < v_size;
    cy.add(addedEles);
    if (u_bool) {
        u = sourceNode;
        v = targetNode;
    } else {
        u = targetNode;
        v = sourceNode;
    }
    var edge = addedEles;
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
        console.log("Capacity: ", v_capacity - v_server_size);
        console.log("Size of Cu: ", size_of_u);
        if (v_capacity - v_server_size >= size_of_u) {
            move(cy, u.component().nodes(), server_of_v);
            server_of_v.data('current_size', v_server_size + size_of_u);
            server_of_u.data('current_size', u_server_size - size_of_u);
        } else {
            //rebalance(cy, u, v);
        }
        cy.add(edge); // Reset edge.
    }
}

function majv(cy, sourceNode, targetNode, addedEles) {
    cy.remove(addedEles);
    var u_size = sourceNode.component().nodes().length;
    var v_size = targetNode.component().nodes().length - 1;
    var u_bool = u_size < v_size;
    if (u_bool) {
        u = sourceNode;
        v = targetNode;
    } else {
        u = targetNode;
        v = sourceNode;
    }
    var edge = addedEles;
    var server_of_u = u.parent();
    var server_of_v = v.parent();
    var size_of_u = u.component().nodes().length;
    var size_of_v = v.component().nodes().length - 1;
    if (server_of_u !== server_of_v) {
        move(cy, u.component().nodes(), server_of_v);
    }
    cy.add(addedEles);
    var i = 1;
    while (Math.pow(2,i) < (size_of_u + size_of_v)) {
        console.log(Math.pow(2,i));
        if ((Math.pow(2,i) > size_of_u) && (Math.pow(2,i) > size_of_v)) {
            majority_vote(u.component().nodes());
            break;
        }
        i++;
    }
}

function majority_vote(cu) {
    console.log("Rebalancing");
    var yellow = 0,
        black = 0,
        first_yellow = -1,
        first_black = -1;
    for (let i = 0; i < cu.length; i++) {
        if (cu[i].data('colorid') == 'server_0') {
            if (first_yellow == -1) first_yellow = i;
            yellow++;
        } else {
            if (first_black == -1) first_black = i;
            black++;
        }
    }
    console.log(yellow);
    console.log(black);
    if ( (cu[0].data('parent') == 'server_0') && (black > yellow) ) {
        move(cy, cu, cu[first_black].data('colorid'));
    } else if ( (cu[0].data('parent') == 'server_1') && (yellow > black) ) {
        move(cy, cu, cu[first_yellow].data('colorid'));
    } else {
        console.log("Didn't have to rebalance after all");
    }
}