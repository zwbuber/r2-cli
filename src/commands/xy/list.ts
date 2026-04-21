/**
 * 寄售商品列表命令
 */

import { Command } from "commander";
import chalk from "chalk";
import { getXianyuApi } from "../../services/xy/xianyu-api.service.js";
import { handleCommandError } from "./shared.js";
import type { GoodsStatus, SellerGoodsItem } from "../../types/xianyu.js";

export function createListCommand(): Command {
  const command = new Command("list");
  command.description("寄售商品列表");

  command.option("--status <status>", "状态: wait/on/sold/down", "");
  command.option("--keyword <keyword>", "搜索关键词");
  command.option("--page <page>", "页码", "1");
  command.option("--size <size>", "每页数量", "20");

  command.action(async (options: { status?: string; keyword?: string; page?: string; size?: string }) => {
    try {
      const api = getXianyuApi();
      const params: Record<string, unknown> = {
        page: Number(options.page) || 1,
        size: Number(options.size) || 20,
      };
      if (options.status) params.status = options.status;
      if (options.keyword) params.key = options.keyword;
      const result = await api.getSellerGoodsList(params as import("../../types/xianyu.js").SellerGoodsListParams);

      if (!result.items.length) {
        console.log(chalk.yellow("暂无商品"));
        return;
      }

      const statusFilter = options.status
        ? ` (状态: ${options.status})`
        : "";

      console.log(chalk.cyan(`\n寄售商品列表${statusFilter} (共 ${result.total} 条):\n`));

      for (const item of result.items) {
        displayGoodsItem(item);
      }
    } catch (error) {
      handleCommandError(error);
    }
  });

  return command;
}

function displayGoodsItem(item: SellerGoodsItem): void {
  const typeTag = item.saleType === "hang" ? "挂售" : item.saleType === "send" ? "寄售" : "";
  console.log(
    chalk.white(`  [${item.statusName}] `) +
    chalk.bold(item.name ?? ""),
  );
  console.log(
    chalk.gray(`    ID: ${item.id}  货号: ${item.goodsNo || "-"}  规格: ${item.size || "-"}  `) +
    chalk.green(`¥${item.price}`) +
    (typeTag ? chalk.gray(`  [${typeTag}]`) : ""),
  );

  if (item.xySaleChannel) {
    const xyStatus = item.xySaleChannel.sold === 1
      ? "已出售"
      : item.xySaleChannel.status === "on"
        ? "已上架"
        : "已下架";
    console.log(
      chalk.gray(`    闲鱼: [${xyStatus}]  售价: ¥${item.xySaleChannel.price}`),
    );
  }

  if (item.status === "wait" && !item.xySaleChannel) {
    console.log(chalk.yellow(`    → 运行 r2 xy up ${item.id} 上架到闲鱼`));
  }

  console.log();
}
