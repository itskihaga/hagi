
import { gitWithoutStdout, branchesToChoices, git } from "../common"
import prompts from "prompts";

export const run = async () => {
    const summary = await gitWithoutStdout.branchLocal();
    const choices = await branchesToChoices(summary)
    if (!choices.length) {
        console.log("No branch to delete")
        return;
    }
    const { branches } = await prompts([
        {
            type: "multiselect",
            message: "Pick branches",
            name: "branches",
            choices
        }
    ]);
    branches && branches.length && 
        git.deleteLocalBranches(branches, true)
}