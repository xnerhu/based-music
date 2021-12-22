import chalk from "chalk";
import { Command } from "commander";

import {
  commandConvertToWav,
  commandFetchFromText,
  commandSplit,
} from "./commands";

const program = new Command();

program
  .version("1.0.0")
  .addCommand(commandFetchFromText)
  .addCommand(commandConvertToWav)
  .addCommand(commandSplit)
  .parse(process.argv);

process.on("unhandledRejection", (err) => {
  console.log(chalk.redBright(err));
});
