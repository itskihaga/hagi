
import { gitWithoutStdout, git } from "../common"

export const run = async () => {
    const {current} = await gitWithoutStdout.status()
    current && git.push("origin",current)
}