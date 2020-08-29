import { git,gitWithoutStdout } from "../common"
import _ from "lodash"
import prompts from "prompts";

export const run = async () => {
    const summary = await gitWithoutStdout.branchLocal()
    const sujests = _.uniq(summary.all.reduce<string[]>((acc,cur) => {
        const [res] = cur.split("/").reduce<[string[],string | null]>(([acc,prev],cur) => 
            [
                prev ? [...acc,prev ] : acc , 
                prev ? prev + "/" + cur : cur
            ]
        ,[[],null])
        return acc.concat(res);
    },[]))
    const { directory } = sujests.length ? await prompts([
        {
            type: "select",
            message: "Directory?",
            name: "directory",
            choices: [
                 ...sujests.map(suj => ({title:suj,value:suj})),
                 {title:"-- none --",value:null},
            ]
        }
    ]) : {directory:null}
    const { name } = await prompts([
        {
            type: "text",
            message: directory ? `Branch name? [${directory}]` : "Branch name?",
            name: "name",
        }
    ]);
    name && git.checkoutLocalBranch(directory ? directory + "/" + name : name);
}