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
        ele.style({'background-color' : 'grey'})
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
                setTimeout(() => {
                    rebalance(cy);
                }, 1200)
                //rebalance(cy, u, v);
            }
            cy.add(edge); // Reset edge.
        }
    });
}

function rebalance(cy) {
    var all_comp = all_components(cy.nodes().filter( function(elem) {
        return (elem.data('parent'));
    }))
    var n = cy.nodes().filter( function (elem) {
        return (elem.data('parent'));
    }).length;
    var s = [0];
    var comp = [];
    find:
    for(let i = 0; i < all_comp.length; i++) {
        for(let si = 0; si < s.length; si++) {
            let ski = all_comp[i].length + si;
            if ((-1 !== s.indexOf(ski)) && (-1 !== comp.indexOf(i))) {
                s.push(ski);
                comp.push(i);
                if (ski >= n/2) {
                    break find;
                }
            }
        }
    }

    let server_0 = cy.nodes().filter( function (elem) {return (elem.data('id') === 'server_0')});
    let server_1 = cy.nodes().filter( function (elem) {return (elem.data('id') === 'server_1')});
    for(let i = 0; i < all_comp.length; i++) {
        if (-1 !== comp.indexOf(i)) {
            console.log(all_comp[i].length + " nodes moved to server 0");
            move(cy, all_comp[i], server_0);
        } else {
            console.log(all_comp[i].length + " nodes moved to server 1");
            move(cy, all_comp[i], server_1);
        }
    }
}

function all_components(points) {
    result = [];
    while (!(points.empty())) {
        elem = points.first();
        elem_cu = elem.component().nodes();
        result.push(elem_cu);
        points = (points.diff(elem_cu)).left;
    }
    return result;
}