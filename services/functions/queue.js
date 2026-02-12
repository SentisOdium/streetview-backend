class MinHeap{
    constructor() {
        this.heap = [];
    }

    push(node){
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

    _bubbleUp(){
        let idx = this.heap.length - 1;
        //finds the last index of the array

        while(idx > 0){
            let pIdx = Math.floor((idx - 1) / 2);
            //calculates the parent index of the current index
            if(this.heap[pIdx][0] <= this.heap[idx][0]) break;
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

    _bubbleDown(){
        let idx = 0;

        const n = this.heap.length;

        while(true){
            let l = 2 * idx + 1, r = 2 * idx + 2, smallest = idx

            if(l < n && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
            if(r < n && this.heap[r][0] < this.heap[smallest][0]) smallest = r;            
        
            if(smallest === idx) break;

            [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]]
            idx = smallest;
        }
    }

    isEmpty(){
        return this.heap.length === 0;
    }
}

export function dijkstra(adj, src, dest) {
    let dist = {};
    let prev = {};
    let prioQ = new MinHeap();
    
    for (const node in adj) {
        dist[node] = Number.MAX_SAFE_INTEGER;
        prev[node] = null;
    }

    dist[src] = 0;
    prioQ.push([0, src]);

     while (!prioQ.isEmpty()){
        

        let [d, u] = prioQ.pop();

        if(d > dist[u]) continue;
        
        if(u  === dest) break;

        for (let [neighbor, weight]  of adj[u]){    
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
    let current = dest;
    while (current !== null) {
        path.unshift({
            id: current,
            dist: dist[current]
        });
        if (current === src) break;
        current = prev[current];
    }

    if (dist[dest] === Number.MAX_SAFE_INTEGER) return { dist, path: [] };

    return { dist , path };
}

