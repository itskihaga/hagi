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
    const NONE_VALUE = "-"
    const { directory } = sujests.length ? await prompts([
        {
            type: "select",
            message: "Directory?",
            name: "directory",
            choices: [
                 ...sujests.map(suj => ({title:suj,value:suj})),
                 {title:"-- none --",value:NONE_VALUE},
            ],
        }
    ]) : {directory:null}
    if(!directory){
        return;
    }
    const { name } = await prompts([
        {
            type: "text",
            message: directory !== NONE_VALUE ? `Branch name? [${directory}]` : "Branch name?",
            name: "name",
        }
    ]);
    name && git.checkoutLocalBranch(directory !== NONE_VALUE ? directory + "/" + name : name);
}