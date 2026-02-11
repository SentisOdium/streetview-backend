
import getNodeListQuery from "../../database/nodeQuery/ListQuery.js";
import graphBuilder from "./graphBuilder.js";

async function main() {
    const rows = await getNodeListQuery();
    const graph = graphBuilder(rows);
    console.log(graph);
}

main();