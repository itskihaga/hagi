import { gitWithoutStdout, git, formatDateAndMsg } from "../common"
import prompts, { Choice } from "prompts"

export const run = async () => {
    const stashes = await gitWithoutStdout.stashList()
    if(!stashes.total){
        console.log("No stash to pop");
        return;
    }
    const choices : Choice[] = stashes.all.map((stash,index) => ({
        title:`stash@{${index}}`,
        description:formatDateAndMsg(stash),
        value:index
    }))
    const { number } = await prompts([
        {
            type: "select",
            name: "number",
            message: "Pick a stash!",
            choices
        }
    ]);
    typeof number === "number" && 
        git.stash(["pop",number.toString()])
}