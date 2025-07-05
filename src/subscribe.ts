
import { Abi, GetContractEventsParameters, GetContractEventsReturnType, PublicClient } from 'viem'

const min_1 = 60 * 1000

interface iSubscribe<abi extends Abi = Abi> {
  events: GetContractEventsParameters<abi>,
  onLogs: (events: GetContractEventsReturnType<abi>) => void
}

export class Subscribe {

  private fromBlock = 0n

  private toBlock   = 0n

  private timer: NodeJS.Timeout;

  private events: iSubscribe[] = [];

  constructor (
    private client: PublicClient
  ) {}

  private info (...args: any[]) {
    const time = new Date().toLocaleString('ru')
    console.info(time, ...args)
  }

  private async process () {
    if (!this.fromBlock)
      throw new Error('Invalid from blocks')

    this.toBlock = await this.client.getBlockNumber() - 5n;

    for (const e of this.events) {
      const { address, eventName, abi } = e.events
      const events = await this.client.getContractEvents({
        fromBlock: this.fromBlock,
        toBlock: this.toBlock,
        abi,
        eventName,
        address
      })
      this.info('Logs:', eventName, this.fromBlock, this.toBlock, events.length)
      e.onLogs(events as any)
    }

    this.fromBlock = this.toBlock + 1n;
  }

  private subscribe () {
    this.timer = setTimeout(async () => {
      await this.process()
      this.subscribe()
    }, min_1)
  }

  add<abi extends Abi = Abi> (subscribtion: iSubscribe<abi>) {
    /** @ts-ignore */
    this.events.push(subscribtion)
    this.info('Add:', subscribtion.events.eventName, subscribtion.events.address)
  }

  remove (subscribtion: iSubscribe) {
    this.events = this.events.filter(e => e !== subscribtion)
    this.info('Remove:', subscribtion.events.eventName, subscribtion.events.address)
  }

  async start () {
    this.fromBlock = await this.client.getBlockNumber()
    this.subscribe()
    this.info("Subscriptions started:")
    for (const e of this.events) {
      this.info("-", e.events.eventName)
    }
  }

  stop () {
    clearTimeout(this.timer);
    this.info("Subscriptions stopped")
  }

  destroy () {
    this.stop()
    this.events = []
    this.info("Subscriptions destroyed")
  }
}