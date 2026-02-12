export function cleanGraph(graph) {
    const cleanGraph = {};

    for (const node in graph){
        cleanGraph[node] = graph[node].map(([target, weight ]) => ({
            target, weight }))
    }

    return cleanGraph;
}

export function cleanDistances(dist) {
    const cleanDist = {};
    for (const node in dist) {
        if (dist[node] !== Number.MAX_SAFE_INTEGER) {
            cleanDist[node] = dist[node];
        }
    }
    return cleanDist;
}


export function cleanPath(path, dist){
    // return path.map(node => `${node.id}, ${dist[node.id]}`); - can  only accessthe path as a pair. 
    return path.map(node => [node.id , dist[node.id]]);
}

//do we need this? at all??
//ues this to just visalize the path and distances in a more readable format. for frontend??