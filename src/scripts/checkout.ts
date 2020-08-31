
import { gitSilent, branchesToChoices, git } from "../common"
import prompts from "prompts";

export const run = async () => {
    const summary = await gitSilent.branch(["--sort=-committerdate"]);
    const choices = await branchesToChoices(summary)
    if (!choices.length) {
        console.log("No branch to checkout")
        return;
    }
    const { branch } = await prompts([
        {
            type: "select",
            name: "branch",
            message: "Pick a branch!",
            choices
        }
    ]);
    branch && git.checkout([branch]);
}
