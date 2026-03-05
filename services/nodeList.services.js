import getAllNodes from "../database/nodeQuery/NodeNamesQuery.js";
export default async function nodeListService() {
    const nodesList = await getAllNodes();

    if (!nodesList || nodesList.length === 0) {
        throw new Error("No Locations Found");
    }

    return {
        list: nodesList
    };
}
