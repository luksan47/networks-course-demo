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

function swap_move(cy, cu, cv, server) {
    //cu.style({'background-color' : 'red'});
    //cv.style({'background-color' : 'red'});
    
    var cv2 = get_free_nodes(server, cu.length);
    //var cv2 = server.children().filter(child => -1 == cv.map(function (e) {return e.data('id')}).indexOf(child.data('id')));

    for (let i = 0; i < Math.min(cv2.length, cu.length); i++) {
        cv2_x = cv2[i].position('x');
        cv2_y = cv2[i].position('y');
        cu_x = cu[i].position('x');
        cu_y = cu[i].position('y');
        cv2[i].move({'parent': null});
        cv2[i].animate({
            position : {x: cu_x, y: cu_y},
            duration : 1000,
            complete : function name() {
                cv2[i].move({'parent' : cu[i].parent().data('id')});
            }
        })
        cu[i].move({'parent': null});
        cu[i].animate({
            position : {x: cv2_x, y: cv2_y},
            duration : 1000,
            complete : function name() {
                cu[i].move({'parent' : server.data('id')});
            }
        })
    }
}


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
    var v_size = targetNode.component().nodes().length;
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
    swap_move(cy, u.component().nodes(), v.component().nodes(), server_of_v);
    cy.add(addedEles);
}