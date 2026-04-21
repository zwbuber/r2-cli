/**
 * 闲鱼店铺列表命令
 */

import { Command } from "commander";
import chalk from "chalk";
import { getXianyuApi } from "../../services/xy/xianyu-api.service.js";
import { handleCommandError } from "./shared.js";

export function createShopsCommand(): Command {
  const command = new Command("shops");
  command.description("查看闲鱼授权店铺列表");

  command.action(async () => {
    try {
      const api = getXianyuApi();
      const shops = await api.getShops();

      if (!shops.length) {
        console.log(chalk.yellow("未找到已授权的闲鱼店铺"));
        return;
      }

      console.log(chalk.cyan("\n闲鱼授权店铺:\n"));

      for (const shop of shops) {
        const expired = Date.now() > shop.expiresIn;
        const status = expired ? chalk.red("已过期") : chalk.green("授权中");
        const expireDate = new Date(shop.expiresIn).toLocaleDateString();

        console.log(chalk.white(`  ${shop.name}`));
        console.log(chalk.gray(`    ID: ${shop.thirdUserId}  状态: ${status}  到期: ${expireDate}`));
      }
      console.log();
    } catch (error) {
      handleCommandError(error);
    }
  });

  return command;
}
