import 'dotenv/config'
import { Address, createPublicClient, formatUnits, http, parseAbi } from 'viem'
import { TelegramService } from './telegram'

const {
  POOL_ADDRESS,
  RPC_URL
} = process.env

const client = createPublicClient({
  transport: http(RPC_URL)
})

const bot = new TelegramService()

client.watchContractEvent({
  address: POOL_ADDRESS as Address,
  abi: parseAbi(["event Contributed(address indexed user, address currency, uint256 amount, uint256 volume, uint256 totalVolume)"]),
  eventName: 'Contributed',
  async onLogs (logs) {
    for (const log of logs) {
      const { user, amount } = log.args
      if (!(user && amount)) continue
      await bot.purchase({
        wallet: user,
        amount: formatUnits(amount, 18)
      })
    }
  }
})

console.info(`Telegram Purchase Bot alert started!`)
console.info(`Pool Address: ${POOL_ADDRESS}`)