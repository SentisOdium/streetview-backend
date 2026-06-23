class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(node) {
        this.heap.push(node);
        this._bubbleUp();
    }

    pop() {
        if (this.heap.length === 1) return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._bubbleDown();
        return top;
    }

    _bubbleUp() {
        let idx = this.heap.length - 1;
        //finds the last index of the array

        while (idx > 0) {
            let pIdx = Math.floor((idx - 1) / 2);
            //calculates the parent index of the current index
            if (this.heap[pIdx][0] <= this.heap[idx][0]) break;
            // if the value at the parent index is less than or equal to the value at the current index, we stop the loop
            [this.heap[pIdx], this.heap[idx]] = [this.heap[idx], this.heap[pIdx]]
            //  the heaps 1 [5,b] and 3 [1,d] is equals to [1,d] and [5,b]
            //  We are swapping the values stored in the array positions pIdx and idx
            // we are telling on the left side to assign the value of the right side to the left side. what a confusing sentence
            // fuck this line of code, you fucking confusing fucker, srry im just dumb
            idx = pIdx;
            //
        }
    }

    _bubbleDown() {
        let idx = 0;

        const n = this.heap.length;

        while (true) {
            let l = 2 * idx + 1, r = 2 * idx + 2, smallest = idx

            if (l < n && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
            if (r < n && this.heap[r][0] < this.heap[smallest][0]) smallest = r;

            if (smallest === idx) break;

            [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]]
            idx = smallest;
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}

export function dijkstra(adj, src, dest, ignoredNodes = new Set(), ignoredEdges = new Set()) {
    let dist = {};
    let prev = {};
    let prioQ = new MinHeap();

    for (const node in adj) {
        dist[node] = Number.MAX_SAFE_INTEGER;
        prev[node] = null;
    }

    // Convert src and dest to their actual types (numbers or strings) as stored in adj
    const srcKey = typeof src === "number" && !adj[src] && adj[String(src)] ? String(src) : src;
    const destKey = typeof dest === "number" && !adj[dest] && adj[String(dest)] ? String(dest) : dest;

    dist[srcKey] = 0;
    prioQ.push([0, srcKey]);

    while (!prioQ.isEmpty()) {

        let [d, u] = prioQ.pop();

        if (d > dist[u]) continue;

        if (u == destKey) break;

        if (ignoredNodes.has(u) || ignoredNodes.has(Number(u))) continue;

        const neighbors = adj[u];
        if (!neighbors) continue;

        for (let [neighbor, weight] of neighbors) {
            if (ignoredNodes.has(neighbor) || ignoredNodes.has(Number(neighbor))) continue;
            if (ignoredEdges.has(`${u}->${neighbor}`) || ignoredEdges.has(`${Number(u)}->${Number(neighbor)}`)) continue;

            const newDist = dist[u] + weight;

            if (newDist < dist[neighbor]) {
                dist[neighbor] = newDist;
                prev[neighbor] = u; // track path
                prioQ.push([newDist, neighbor]);
            }
        }
    }

    // Reconstruct path
    const path = [];
    let current = destKey;
    while (current !== null && current !== undefined) {
        // Ensure dist[current] is valid
        const dVal = dist[current] !== undefined ? dist[current] : Number.MAX_SAFE_INTEGER;
        
        path.unshift({
            id: Number(current),
            dist: dVal
        });
        if (current == srcKey) break;
        current = prev[current];
    }

    if (dist[destKey] === undefined || dist[destKey] === Number.MAX_SAFE_INTEGER) {
        return { dist, path: [] };
    }

    return { dist, path };
}

export function yenKShortestPaths(adj, src, dest, K = 3) {
    const A = []; // List of shortest paths
    
    // Find the first shortest path
    const firstResult = dijkstra(adj, src, dest);
    if (firstResult.path.length === 0) {
        return [];
    }
    
    A.push(firstResult.path);
    
    const B = [];
    
    for (let k = 1; k < K; k++) {
        const prevPath = A[k - 1];
        
        for (let i = 0; i < prevPath.length - 1; i++) {
            const spurNode = prevPath[i].id;
            const rootPath = prevPath.slice(0, i + 1);
            
            const ignoredEdges = new Set();
            const ignoredNodes = new Set();
            
            for (const path of A) {
                if (path.length > i && rootPath.every((node, idx) => Number(node.id) === Number(path[idx].id))) {
                    ignoredEdges.add(`${path[i].id}->${path[i+1].id}`);
                }
            }
            
            for (let j = 0; j < rootPath.length - 1; j++) {
                ignoredNodes.add(rootPath[j].id);
            }
            
            const spurResult = dijkstra(adj, spurNode, dest, ignoredNodes, ignoredEdges);
            
            if (spurResult.path.length > 0) {
                const rootPart = rootPath.slice(0, -1);
                const candidatePath = [...rootPart, ...spurResult.path];
                
                // Recalculate distance values for the combined candidate path from the start node
                let cumulativeDist = 0;
                const pathWithUpdatedDistances = [];
                let validPath = true;
                
                for (let stepIdx = 0; stepIdx < candidatePath.length; stepIdx++) {
                    const currentNode = candidatePath[stepIdx];
                    if (stepIdx > 0) {
                        const prevNodeId = candidatePath[stepIdx - 1].id;
                        const edges = adj[prevNodeId] || adj[String(prevNodeId)];
                        const edge = edges?.find(e => Number(e[0]) === Number(currentNode.id));
                        if (!edge) {
                            validPath = false;
                            break;
                        }
                        cumulativeDist += edge[1];
                    }
                    pathWithUpdatedDistances.push({
                        id: Number(currentNode.id),
                        dist: cumulativeDist
                    });
                }
                
                if (validPath) {
                    // Check if candidate path is already in B or A to prevent duplicates
                    const pathStr = pathWithUpdatedDistances.map(n => n.id).join(",");
                    const isDuplicateB = B.some(p => p.map(n => n.id).join(",") === pathStr);
                    const isDuplicateA = A.some(p => p.map(n => n.id).join(",") === pathStr);
                    
                    if (!isDuplicateB && !isDuplicateA) {
                        B.push(pathWithUpdatedDistances);
                    }
                }
            }
        }
        
        if (B.length === 0) {
            break;
        }
        
        // Sort potential paths by distance of the last node in the path
        B.sort((a, b) => {
            const distA = a[a.length - 1].dist;
            const distB = b[b.length - 1].dist;
            return distA - distB;
        });
        
        const bestPath = B.shift();
        A.push(bestPath);
    }
    
    return A;
}

