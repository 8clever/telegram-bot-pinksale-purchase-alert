import { TelegramService } from '../dist/src/telegram.js'

const tg = new TelegramService()

tg.purchase({
  amount: "15.0",
  wallet: "0xA494d1ad145E24176E928d509CB73189dD6c15E6"
})