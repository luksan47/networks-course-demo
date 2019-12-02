
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