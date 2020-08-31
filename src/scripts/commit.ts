import cp from "child_process";

export const run = async () => {
    const args = process.argv.slice(2)
    // simple-gitはviの画面を出せない
    cp.spawn("git", args.length ? ["commit", "-m", ...args] : ["commit"], { stdio: 'inherit' })
}