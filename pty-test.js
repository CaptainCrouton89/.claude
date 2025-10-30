// pty-test.js
import pty from "node-pty";
import process from "process";

const shell = "claude"; // or whatever command launches Claude Code locally
const p = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 120,
  rows: 32,
  cwd: process.cwd(),
  env: process.env,
});

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", (data) => {
  p.write(data);
});
