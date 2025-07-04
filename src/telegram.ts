import 'dotenv/config'
import { createReadStream, readFileSync } from 'fs';
import TelegramBot from 'node-telegram-bot-api'
import { join } from "path";

interface Purchase {
  wallet: string;
  amount: string;
}

const {
  TG_BOT_APIKEY,
  TG_CHANNEL
} = process.env

export class TelegramService {

  channel = TG_CHANNEL as string

  apiKey = TG_BOT_APIKEY as string

  private template = readFileSync(
    this.getFilePath("templates/purchase.md")
  ).toString()

  private bot = new TelegramBot(this.apiKey)

  private toShort(str: string) {
    return str.slice(0, 6) + "..." + str.slice(-4)
  }

  private getFilePath (fileName: string) {
    return join(process.cwd(), 'static', fileName)
  }

  private async _purchase (payload: Purchase) {
    const { wallet, amount } = payload
    const stream = createReadStream(
      this.getFilePath('videos/purchase.mp4')
    )
    const amountFixed = Number(amount).toFixed(2)
    const caption = this.template
      .replace('{amount}', amountFixed)
      .replace('{wallet}', wallet)
      .replace('{wallet_short}', this.toShort(wallet))
    return this.bot.sendAnimation(this.channel, stream, {
      caption,
      parse_mode: "Markdown"
    })
  }

  async purchase (payload: Purchase) {
    try {
      await this._purchase(payload);
    } catch (e) {
      console.error(e)
    }
  }
}