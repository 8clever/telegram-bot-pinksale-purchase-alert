import 'dotenv/config'
import { Address, createPublicClient, formatUnits, http, parseAbi } from 'viem'
import { TelegramService } from './telegram'
import { Subscribe } from './subscribe'

const {
  POOL_ADDRESS,
  RPC_URL
} = process.env

const client = createPublicClient({
  transport: http(RPC_URL)
})

const bot = new TelegramService()

const subscribe = new Subscribe(client);

subscribe.add({
  events: {
    address: POOL_ADDRESS as Address,
    abi: parseAbi(["event Contributed(address indexed user, address currency, uint256 amount, uint256 volume, uint256 totalVolume)"]),
    eventName: 'Contributed',
  },
  async onLogs (logs) {
    for (const log of logs) {
      log.args
      const { user, amount } = log.args
      if (!(user && amount)) continue
      await bot.purchase({
        wallet: user,
        amount: formatUnits(amount, 18)
      })
    }
  }
})

subscribe.start()