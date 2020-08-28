import simpleGit from "simple-git";
import prompts from "prompts";

const git = simpleGit().outputHandler((_, stdout, stderr) => {
    stdout.pipe(process.stdout)
    stderr.pipe(process.stderr)
})
const gitWithoutStdout = simpleGit();

const checkout = async () => {
    const {all,current} = await gitWithoutStdout.branch(["--sort=-committerdate"]);
    const choices = all
        .filter(e => e != current)
        .map(e => ({title:e,value:e}))
    if(!choices.length){
        console.log("No branch to checkout")
        return;
    }
    const { branch } = await prompts([
        {
            type: "select",
            name: "branch",
            message:"Pick a branch!",
            choices
        }
    ]);
    if(branch){
        git.checkout([branch]);
    }
}

const newBranch = async () => {
    const { name } = await prompts([
        {
            type: "text",
            message: "Branch Name?",
            name: "name"
        }
    ]);
    if(name){
        git.checkoutLocalBranch(name);
    }
}

const deleteBranch = async () => {
    const {all,current} = await gitWithoutStdout.branchLocal();
    const choices = all
        .filter(e => e != current)
        .map(e => ({title:e,value:e}))
    if(!choices.length){
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
    if(branches.length){
        git.deleteLocalBranches(branches,true)
    }
}

const fn = async () => {
    const { cmd } = await prompts({
        type: "select",
        name: 'cmd',
        message: 'Command?',
        choices: [
            {
                title:"checkout",
                value:"checkout"
            },
            {
                title:"new branch",
                value:"new"
            },
            {
                title:"delete",
                value:"delete"
            }
        ]
    })
    switch (cmd) {
        case "checkout":
            return checkout();
        case "new":
            return newBranch()
        case "delete":
            return deleteBranch();
        default:
            throw new Error()
    }
};
fn().catch(() => {})


