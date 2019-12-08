# Efficient Distributed Workload (Re-)Embedding model implementation.

This project takes the work of M.Henzinger, S.Neumann, S.Schmid in their [April 2019 article, Efficient Distributed Workload (Re-)Embedding.](https://arxiv.org/pdf/1904.05474.pdf)

More specifically, we implement two algorithms defined for the two server scenario. You can swap between these two algorithm inplementations on the top-left corner of the application.

* We implement the Small-Large-Rebalance Algorithm defined in Section 3.2, with the respected Rebalance approach defined in Section 5.2. The algorithm itself works well for any number of servers but the rebalancing approach by nature only works on 2 server instances.

* We implement the Majority Voting Algorithm defined in Section 3.3. This by definition only works on 2 server instances, and is not defined to work properly on overloaded servers, as it is only practical on small number of Delta edge instances/moves.

* For a custom number of servers, server capacity or server augmentation, change the code values in:

```
function run (cy, eh) {
  create_server(cy, 10, 5); # 10 refers to base capacity K, 5 refers to K*epsilon augmentation.
  create_server(cy, 10, 5);
}
```

* In order to input an online edge, draw an edge between two nodes using the overhead red circle slightly north of a given node.

# Build and run.

First, [install NodeJS/NPM onto your OS](https://www.npmjs.com/get-npm).

To initialise the project, run `npm install` and open `index.html` in your browser.
