"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const stringUtil_1 = require("./stringUtil");
function cmd(command, options) {
    return new Promise((resolve, reject) => {
        const subProcess = child_process_1.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(stdout);
            }
        });
        subProcess.stdout.on("data", (chunk) => {
            process.stderr.write(chunk);
        });
        subProcess.stderr.on("data", (chunk) => {
            process.stderr.write(chunk);
        });
        function stdinListener(chunk) {
            subProcess.stdin.write(chunk);
        }
        process.stdin.on("data", stdinListener);
        subProcess.stdin.on("end", () => {
            process.stdin.end();
            process.stdin.removeListener("data", stdinListener);
        });
    });
}
exports.cmd = cmd;
function composeCommand(command, ins = []) {
    const echoes = ins.map((element) => "echo " + stringUtil_1.doubleQuote(String(element))).join(" && ");
    const inputs = ins.map((element) => stringUtil_1.doubleQuote(String(element))).join(" ");
    const composedCommand = `(${echoes}) | ${command} ${inputs}`;
    return composedCommand;
}
exports.composeCommand = composeCommand;
function cmdComposedCommand(command, ins = [], options) {
    return cmd(composeCommand(command, ins), options);
}
exports.cmdComposedCommand = cmdComposedCommand;
//# sourceMappingURL=cmd.js.map