
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
    var size_of_u = u.component().nodes().length;
    var size_of_v = v.component().nodes().length;
    console.log("MAJV");
    console.log(size_of_u);
    console.log(size_of_v);
    if (server_of_u !== server_of_v) {
        move(cy, u.component().nodes(), server_of_v);
    }
    cy.add(addedEles);
    setTimeout(() => {
        var i = 1;
        while (Math.pow(2,i) < (size_of_u + size_of_v)) {
            if ((Math.pow(2,i) > size_of_u) && (Math.pow(2,i) > size_of_v)) {
                majority_vote(cy, u.component().nodes());
                break;
            }
            i++;
        }
    }, 1100);
}

function majority_vote(cy, cu) {
    console.log("VOTING");
    var yellow = 0,
        black = 0,
        first_yellow = -1,
        first_black = -1;
    for (let i = 0; i < cu.length; i++) {
        if (cu[i].data('colorid') == 'server_0') {
            if (first_yellow == -1) first_yellow = i;
            yellow++;
        } else if (cu[i].data('colorid') == 'server_1') {
            if (first_black == -1) first_black = i;
            black++;
        }
    }

    console.log(cu);
    console.log(yellow);
    console.log(black);

    if ( (cu[0].data('parent') == 'server_0') && (black > yellow) ) {
        let server_value = cu[first_black].data('colorid');
        let server = cy.nodes().filter( function (elem) {return (elem.data('id') === server_value)});
        move(cy, cu, server);
    } else if ( (cu[0].data('parent') == 'server_1') && (yellow > black) ) {
        let server_value = cu[first_yellow].data('colorid');
        let server = cy.nodes().filter( function (elem) {return (elem.data('id') === server_value)});
        move(cy, cu, server);
    }
}