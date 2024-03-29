/**
 * Add a random edge into the graph.
 * @param {*} cy The main class for the CytoScape Graph
 */
function add_random_edge(cy) {
  add_random_connections(cy);
}

/**
 * Run Small-Large rebalance algorithm.
 * @param {*} cy The main class for the CytoScape Graph
 */
function run_slra(cy) {
  slra(cy);
}


/**
 * Main run function, creates 2 servers.
 * @param {*} cy 
 * @param {*} eh 
 */
function run (cy, eh) {
  create_server(cy, 10, 5);
  create_server(cy, 10, 5);
}

var cy;
// Initialize the graph and set event listeners.
document.addEventListener('DOMContentLoaded', function(){

  cy = window.cy = cytoscape({
    container: document.getElementById('cy'),

    layout: {
      name: 'preset',
      fit: true,
    },

    style: [
      {
        selector: 'node[name]',
        style: {
        'content': 'data(name)'
        }
      },

      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
        }
      },

      // some style for the extension

      {
        selector: '.eh-handle',
        style: {
          'background-color': 'red',
          'width': 12,
          'height': 12,
          'shape': 'ellipse',
          'overlay-opacity': 0,
          'border-width': 12, // makes the handle easier to hit
          'border-opacity': 0
        }
      },

      {
        selector: '.eh-hover',
        style: {
          'background-color': 'red'
        }
      },

      {
        selector: '.eh-source',
        style: {
          'border-width': 2,
          'border-color': 'red'
        }
      },

      {
        selector: '.eh-target',
        style: {
          'border-width': 2,
          'border-color': 'red'
        }
      },

      {
        selector: '.eh-preview, .eh-ghost-edge',
        style: {
          'background-color': 'red',
          'line-color': 'red',
          'target-arrow-color': 'red',
          'source-arrow-color': 'red'
        }
      },

      {
        selector: '.eh-ghost-edge.eh-preview-active',
        style: {
          'opacity': 0
        }
      }
    ],

  });

  //On edge created by mouse.
  cy.bind("ehcomplete", function (event, sourceNode, targetNode, addedEles) {
    if (document.getElementById('r1').checked) {
      setTimeout(() => {
        slra(cy);
      }, 150);
    } else {
      setTimeout(() => {
        majv(cy, sourceNode, targetNode, addedEles);
      }, 150);  
    }
  })
  var eh = cy.edgehandles();

  run(cy, eh);
});

/*
document.getElementById("add_edge").addEventListener("click", function (e) {
  add_random_edge(cy);
})
document.getElementById("slra").addEventListener("click", function (e) {
  document.getElementById("slra").disabled = true;
  run_slra(cy);
  setTimeout(() => {
    document.getElementById("slra").disabled = false;
  }, 1000);
}); */