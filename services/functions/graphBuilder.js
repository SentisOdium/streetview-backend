function graphBuilder(rows){
    const graph = {};

    rows.forEach(row => {
        const from = row.id;
        const to = row.target_node_id;
        const weight = row.path_weight;

        if(!graph[from]) graph[from] = [];
        if(!graph[to]) graph[to] = [];

        graph[from].push([to, weight]);
        graph[to].push([from, weight]);
    });

    return graph;
}

export default graphBuilder;