// main function
function run (cy, eh) {
  create_server(cy, 8, 3);
  create_server(cy, 5, 3);
  create_server(cy, 3, 6);
  add_random_connections(cy);
}

// initialising the graph
document.addEventListener('DOMContentLoaded', function(){

  var cy = window.cy = cytoscape({
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
          'target-arrow-shape': 'triangle'
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

  var eh = cy.edgehandles();

  run(cy, eh);
});
