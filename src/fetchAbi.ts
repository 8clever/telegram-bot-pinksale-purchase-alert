import 'dotenv/config'
import { whatsabi } from "@shazow/whatsabi";
import { Address, createPublicClient, http, parseAbiItem } from "viem";
import { writeFile } from 'fs/promises'
import { join } from "path";

const {
  RPC_URL,
  POOL_ADDRESS,
  ETHERSCAN_API_KEY
} = process.env

const client = createPublicClient({
  transport: http(RPC_URL)
})

const contract = await whatsabi.autoload(POOL_ADDRESS as Address, { 
  followProxies: true,
  provider: client,
  ...whatsabi.loaders.defaultsWithEnv({
    ETHERSCAN_API_KEY
  })
});

const code = await client.getCode({
  address: contract.address as Address
})

const fullAbi = whatsabi.abiFromBytecode(code as string);

const signatureLookup = new whatsabi.loaders.OpenChainSignatureLookup();

for (const i of fullAbi) {
  if (i.type === 'event') {
    const evt = await signatureLookup.loadEvents(i.hash)
    if (evt.length) {
      const abiItem = parseAbiItem('event ' + evt[0])
      contract.abi.push(abiItem as any)
    }
  }
}

await writeFile(join('static', 'abi', POOL_ADDRESS + ".json"), JSON.stringify(contract.abi, null, " "))