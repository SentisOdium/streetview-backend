class MinHeap{
    constructor() {
        this.heap = [];
    }

    push(node){
        this.heap.push(node);
        this._bubbleUp();
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
        
    }
}

export function dijkstra() {

}