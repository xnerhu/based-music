import chalk from "chalk";
import { Command } from "commander";

import { commandFetchFromText } from "./commands";

const program = new Command();

program.version("1.0.0").addCommand(commandFetchFromText).parse(process.argv);

process.on("unhandledRejection", (err) => {
  console.log(chalk.redBright(err));
});
