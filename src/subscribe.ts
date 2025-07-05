
import { Abi, GetContractEventsParameters, GetContractEventsReturnType, PublicClient } from 'viem'

const min_1 = 60 * 1000

interface iSubscribe<abi extends Abi = Abi> {
  events: GetContractEventsParameters<abi>,
  onLogs: (events: GetContractEventsReturnType<abi>) => void
}

let fromBlock: bigint

function info (...args: any[]) {
  const time = new Date().toLocaleString('ru')
  console.info(time, ...args)
}

async function fetchLogs<abi extends Abi = Abi> (client: PublicClient, ...args: iSubscribe<abi>[]) {
  if (!fromBlock)
    throw new Error('Invalid from block')

  const offset = 5n // blocks
  const toBlock = await client.getBlockNumber() - offset;

  for (const e of args) {
    const { address, eventName, abi } = e.events
    info('Fetch:', eventName)
    const events = await client.getContractEvents({
      fromBlock,
      toBlock,
      abi,
      eventName,
      address
    })
    info('Logs:', fromBlock, toBlock, events.length)
    e.onLogs(events as any)
  }

  fromBlock = toBlock + 1n
}


export async function subscribe<abi extends Abi = Abi> (client: PublicClient, ...args: iSubscribe<abi>[]) {
  for (const p of args) {
    info('Subscribe:', p.events.eventName, p.events.address)
  }

  fromBlock = fromBlock || await client.getBlockNumber()
  
  const timer = setTimeout(async () => {
    await fetchLogs(client, ...args)
    destroy = await subscribe(client, ...args)
  }, min_1)
  
  let destroy = () => {
    clearTimeout(timer)
  }

  return destroy
}