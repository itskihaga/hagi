import simpleGit from "simple-git";
import { isRight } from 'fp-ts/Either'
import prompts from "prompts"
import * as iots from 'io-ts'
import fs from "fs"
import path from "path"
const git = simpleGit().outputHandler((_, stdout, stderr) => {
    stdout.pipe(process.stdout)
    stderr.pipe(process.stderr)
})
const gitWithoutStdout = simpleGit();

interface GitHistoryRepository {
    add(name: string): void;
    getAll(): string[];
}

const IoData = iots.type({
    branchHistory: iots.array(iots.string),
})
type Data = iots.TypeOf<typeof IoData>

class FileGitHistoryRepository implements GitHistoryRepository {
    private filepath: string = path.resolve("./storage/data.json")
    constructor(private currentPath: string) {
        console.log(this.filepath)
        if (!fs.existsSync(this.filepath)) {
            
            fs.writeFileSync(this.filepath, JSON.stringify({}))
        }
    }
    private readFile(): Data {
        const json = JSON.parse(fs.readFileSync(this.filepath).toString())
        const data = json[this.currentPath]
        if(!data){
            return {
                branchHistory:[]
            }
        }
        const decoded = IoData.decode(data)
        if (isRight(decoded)) {
            return decoded.right
        } else {
            throw new Error("Type Error")
        }
    }
    private writeFile(data: Data): void {
        if(IoData.decode(data)._tag === "Right"){
            const prev = JSON.parse(fs.readFileSync(this.filepath).toString())
            prev[this.currentPath] = data
            fs.writeFileSync(this.filepath, JSON.stringify(prev))
        }
        throw new Error("Type Error")
        
    }
    getAll(): string[] {
        return this.readFile().branchHistory
    }
    add(name: string): void {
        const data = this.readFile()
        const res = {
            ...data,
            branchHistory: [name, ...data.branchHistory.filter(e => e !== name)]
        }
        this.writeFile(res)
    }
}
const repo = new FileGitHistoryRepository(process.cwd())

const checkout = async () => {
    const {all,current} = await gitWithoutStdout.branch();
    const saved = repo.getAll().reduce<Record<string,number | undefined>>((prev,cur,index) => {
        return {
            ...prev,
            [cur]:index
        }
    },{})
    const getPriority = (name: string):number => {
        const num = saved[name]
        return typeof num == "number" ? num : Math.max()
    }
    const sortee = all.filter(e => e != current)
    sortee.sort((a,b)=> getPriority(a) - getPriority(b))
    const choices = sortee.map(e => ({title:e,value:e}))
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
        repo.add(branch);
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
    git.checkoutLocalBranch(name);
    repo.add(name);
}

const deleteBranch = async () => {
    const {all} = await gitWithoutStdout.branch();
    const { branches } = await prompts([
        {
            type: "multiselect",
            message: "Pick branches",
            name: "branches",
            choices:all.map(e => ({title:e,value:e}))
        }
    ]);
    if(branches.length){
        git.deleteLocalBranches(branches)
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
            checkout();
            break;
        case "new":
            newBranch()
            break;
        case "delete":
            deleteBranch()
            break;
        default:
            throw new Error(cmd)
    }
};
fn()


