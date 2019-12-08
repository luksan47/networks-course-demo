/**
 * Function that determines which edge vertices have the smaller sized corresponding connected component subgraph.
 * @param {*} cy The main class for the CytoScape Graph
 * @param {*} edge The edge we want to analyze
 * @returns True if the first component has the smaller connected component subgraph.
 */
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

/**
 * Function that takes every existing component, and splits them into the two servers given. Only works with L=2 server instance, as defined in the article.
 * @param {*} cy The main class for the CytoScape Graph
 * @param {*} nodes_0 The edges that will go into the left server.
 * @param {*} nodes_1 The edges that will go into the right server.
 */
function full_swap(cy, nodes_0, nodes_1) {
    let server_0 = cy.nodes().filter( function (elem) {return (elem.data('id') === 'server_0')});
    let server_1 = cy.nodes().filter( function (elem) {return (elem.data('id') === 'server_1')});
    let server_0_positions_x = [];
    let server_0_positions_y = [];
    let server_1_positions_x = [];
    let server_1_positions_y = [];
    server_0.children().forEach(node => {
        server_0_positions_x.push(node.position().x);
        server_0_positions_y.push(node.position().y);
    })
    server_1.children().forEach(node => {
        server_1_positions_x.push(node.position().x);
        server_1_positions_y.push(node.position().y);
    })
    const free_nodes_0 = get_all_free_nodes(server_0);
    const free_nodes_1 = get_all_free_nodes(server_1);

    //The free nodes might be all around the place, so just in case we'll remove
    //them and replace all the remaining spots with free nodes.
    free_nodes_0.forEach(node => {
        cy.remove(node);
    })
    free_nodes_1.forEach(node => {
        cy.remove(node);
    })

    //Fill every slot with an empty slot.
    let ele_0 = [];
    for (let i = 0; i < server_0_positions_x.length; i++) {
        var ele = cy.add({
            group: 'nodes',
            data: {
                id: uni_id,
                parent: server_0.data('id'),
                used: false
            },
            position: {x:server_0_positions_x[i], y:server_0_positions_y[i]}
        });
        ele.style({'background-color' : 'grey'})
        ele_0.push(ele);
        uni_id++;
    }
    let ele_1 = [];
    for (let i = 0; i < server_1_positions_x.length; i++) {
        var ele = cy.add({
            group: 'nodes',
            data: {
                id: uni_id,
                parent: server_1.data('id'),
                used: false
            },
            position: {x:server_1_positions_x[i], y:server_1_positions_y[i]}
        });
        ele.style({'background-color' : 'grey'});
        ele_1.push(ele);
        uni_id++;
    }

    //Visually move every component out of the screen.
    nodes_0.forEach(component => {
        component.forEach( node => {
            node.move({'parent': null});
            node.animate({
                position: {x:0, y:0},
                duration: 500
            })
        })
    })
    nodes_1.forEach(component => {
        component.forEach( node => {
            node.move({'parent': null});
            node.animate({
                position: {x:250, y:0},
                duration: 500
            })
        })
    })

    //Move the nodes back where they belong and delete the
    //corresponding empty spot.
    let i = 0;
    nodes_0.forEach(component => {
        component.forEach( node => {
            node.move({'parent': server_0.data('id')});
            node.animate({
                position: {x:server_0_positions_x[i], y:server_0_positions_y[i]},
                duration: 500
            })
            if (i < ele_0.length) {
                cy.remove(ele_0[i]);
                i++;
            }
        })
    })
    i = 0;
    nodes_1.forEach(component => {
        component.forEach( node => {
            node.move({'parent': server_1.data('id')});
            node.animate({
                position: {x:server_1_positions_x[i], y:server_1_positions_y[i]},
                duration: 500
            })
            if (i < ele_1.length) {
                cy.remove(ele_1[i]);
                i++;
            }
        })
    })

}

/**
 * Simply moves the given nodes to the given server. Doesn't respect size restrictions.
 * @param {*} cy The main class for the CytoScape Graph
 * @param {*} nodes The nodes to be moved.
 * @param {*} server The destination server.
 */
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

/**
 * The implementation of the Small-Large-Rebalance algorithm. Functions properly for any # of servers, but the respected rebalancing approach is only defined for
 * L = 2 number of servers.
 * @param {*} cy The main class for the CytoScape Graph.
 */
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

/**
 * The rebalance algorithm that takes all components and defines which servers they should be put into. Only respects L = 2 number of servers scenario.
 * @param {*} cy The main class for the CytoScape Graph
 */
function rebalance(cy) {
    var all_comp = all_components(cy.nodes().filter( function(elem) {
        return (elem.data('used') == true);
    }))
    var n = cy.nodes().filter( function (elem) {
        return (elem.data('used') == true);
    }).length;
    var s = [0];
    var comp = [];
    find:
    for(let i = 0; i < all_comp.length; i++) {
        let s_temp = s.slice();
        for(let si = 0; si < s_temp.length; si++) {
            let ski = all_comp[i].length + s_temp[si];
            if ((-1 == s.indexOf(ski))) {
                s.push(ski);
                if ((-1 == comp.indexOf(i))) {
                    comp.push(i);
                }
                if (ski >= n/2) {
                    break find;
                }
            }
        }
    }

    let comp_0 = [];
    let comp_1 = [];
    for(let i = 0; i < all_comp.length; i++) {
        if (-1 !== comp.indexOf(i)) {
            comp_1.push(all_comp[i]);
        } else {
            comp_0.push(all_comp[i]);
        }
    }
    full_swap(cy, comp_0, comp_1);
}

/**
 * Turns a list of nodes into a list of connected components within those nodes. For example, the nodes of an Even Graph returns a list containing the two components.
 * @param {*} points The nodes to be classified by components.
 * @returns The list of all disjunctive components in the graph.
 */
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