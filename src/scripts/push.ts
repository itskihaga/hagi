
import { gitSilent, git } from "../common"

export const run = async () => {
    const {current} = await gitSilent.status()
    current && git.push("origin",current)
}