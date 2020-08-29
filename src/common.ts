import { getLogger } from "log4js";
import { program } from "commander";
import simpleGit, { BranchSummary } from "simple-git";
import { Choice } from "prompts";

program
    .option('-d, --debug', 'output extra debugging')
    .parse(process.argv);
    
const logger = getLogger("git")
logger.level = program.debug ? "debug" : "info"
export const git = simpleGit().outputHandler((cmd, stdout, stderr, args) => {
    logger.debug([cmd, ...args].join(" "))
    stdout.pipe(process.stdout)
    stderr.pipe(process.stderr)
})
export const gitWithoutStdout = simpleGit().outputHandler((cmd, _, stderr, args) => {
    logger.debug([cmd, ...args].join(" "))
    stderr.pipe(process.stderr)
})

export const branchesToChoices = ({ all, current }:BranchSummary):Promise<Choice[]> => {
    return Promise.all(
        all
            .filter(branch => branch != current)
            .map((branch) => [branch, gitWithoutStdout.log({ from: branch })] as const)
            .map(([branch, promise]) => promise.then(log => ({ 
                title: branch,
                value: branch, 
                description: formatDateAndMsg(log.latest)
            })))
    )
}

export const formatDateAndMsg = ({date,message}:{date:string,message:string}):string => {
    return `[${date}] ${message}`
}