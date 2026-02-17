import nameQuery from "../database/nodeQuery/namesQuery.js";

export default async function nodeListService() {
    const nodesList = await nameQuery();

    if (!nodesList || nodesList.length === 0) {
        throw new Error("No Locations Found");
    }

    return {
        list: nodesList
    };
}
