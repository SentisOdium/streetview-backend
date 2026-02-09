function graphBuilder(rows){
    const graph = {};

    rows.array.forEach(row => {
        const from = row.node_details_id;
        const to = row.target_node_id;
        const weight = row.path_weight;

        if(!graph[from]) graph[from] = [];
        graph[from][to] =  weight;

        if(!graph[to]) graph[to] = [];
        graph[to][from] = weight;
    });

    console.log("Constructed Graph:", graph);

    return graph;
}

export default graphBuilder;