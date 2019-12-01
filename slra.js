//Small-Large-Rebalance Algorithm
function slra(cy) {
    var edges = cy.edges();
    edges.forEach(edge => {
        var u = edge.source();
        var v = edge.target();
        console.log(u.parent().data('id'));
        console.log(v.parent().data('id'));
        cy.remove(edge);
        console.log(u.component().nodes().length);
        console.log(v.component().nodes().length);
        cy.add(edge);
        
    });
}