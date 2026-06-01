import { useState, useEffect } from 'react'
import { createPublicClient, http, fallback, formatUnits } from 'viem'
import { mainnet } from 'viem/chains'
import { addresses } from '../data/contracts'

const client = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http('https://ethereum-rpc.publicnode.com/'),
    http('https://rpc.ankr.com/eth'),
    http('https://eth.drpc.org'),
    http('https://1rpc.io/eth'),
  ]),
  batch: { multicall: true },
})

const readContract = <T = unknown>(parameters: unknown) =>
  client.readContract(parameters as never) as Promise<T>

const REWARDS_HANDLER = '0xE8d1E2531761406Af1615A6764B0d5fF52736F56' as const
const FEE_SPLITTER = '0x2dFd89449faff8a532790667baB21cF733C064f2' as const
const STABLECOIN_LENS = '0xe24e2dB9f6Bb40bBe7c1C025bc87104F5401eCd7' as const
const FEE_ALLOCATOR = '0x22530d384cd9915e096ead2db7f82ee81f8eb468' as const

export interface LiveData {
  crvSupply?: string
  crvusdSupply?: string
  vecrvSupply?: string
  vecrvLockedCrv?: string
  scrvusdAssets?: string
  scrvusdSupply?: string        // scrvUSD supply in crvUSD (from API)
  scrvusdApy?: number           // projected APY % (from API)
  nGauges?: string
  minterRate?: string
  treasuryBalance?: string    // crvUSD balance of DAO Treasury
  crvusdCirculating?: string  // crvUSD minted from controllers only (StablecoinLens)
  // FeeSplitter dynamic weight
  rhDynamicWeight?: number    // raw weight from RewardsHandler.weight() in BPS
  rhMinWeight?: number        // minimum weight in BPS
  rhMaxWeight?: number        // cap from FeeSplitter.receivers(0).weight in BPS
  rhEffectiveWeight?: number  // min(dynamic, max) — what's actually used
  // FeeAllocator receivers
  allocatorReceivers?: AllocatorReceiver[]
  allocatorDistributorWeight?: number  // BPS going to FeeDistributor (remainder)
  // Locker data (from prices API)
  lockerConvex?: LockerInfo
  lockerStakedao?: LockerInfo
  lockerYearn?: LockerInfo
  // vlCVX data
  vlcvxSupply?: string           // total vlCVX supply
  vecrvPerVlcvx?: number         // veCRV voting power per 1 vlCVX
  loading: boolean
  error?: string
}

export interface AllocatorReceiver {
  address: string
  weight: number  // in BPS
}

export interface LockerInfo {
  locked: string   // formatted CRV amount
  weight: string   // formatted veCRV power
  weightRatio: string // e.g. "53.49%"
}

export function useLiveData(): LiveData {
  const [data, setData] = useState<LiveData>({ loading: true })

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      try {
        const erc20Abi = [{ name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const
        const LOCKER_ADDRESSES: Record<string, 'convex' | 'stakedao' | 'yearn'> = {
          '0x989aeb4d175e16225e39e87d0d97a3360524ad80': 'convex',
          '0x52f541764e6e90eebc5c21ff570de0e2d63766b6': 'stakedao',
          '0xf147b8125d2ef93fb6965db97d6746952a133934': 'yearn',
        }
        const lockersPromise: Promise<Partial<Record<'convex' | 'stakedao' | 'yearn', LockerInfo>>> = globalThis.fetch('https://prices.curve.finance/v1/dao/lockers/10')
          .then(r => r.json())
          .then(d => {
            const result: Partial<Record<'convex' | 'stakedao' | 'yearn', LockerInfo>> = {}
            for (const u of (d.users || [])) {
              const key = LOCKER_ADDRESSES[u.user.toLowerCase()]
              if (key) {
                // Values may have decimals; truncate to integer for BigInt
                const toBigInt = (v: string) => BigInt(v.split('.')[0])
                result[key] = {
                  locked: formatUnits(toBigInt(String(u.locked)), 18),
                  weight: formatUnits(toBigInt(String(u.weight)), 18),
                  weightRatio: u.weight_ratio,
                }
              }
            }
            return result
          })
          .catch(() => ({}))
        const crvusdApiPromise = globalThis.fetch('https://api.curve.finance/v1/getCrvusdTotalSupply')
          .then(r => r.json())
          .then(d => d?.data?.crvusdTotalSupply as number | undefined)
        const scrvusdStatsPromise = globalThis.fetch('https://prices.curve.finance/v1/crvusd/savings/statistics')
          .then(r => r.json())
          .then(d => ({ supply: d?.supply as number | undefined, apy: d?.proj_apy as number | undefined }))
        const results = await Promise.allSettled([
          readContract({ address: addresses.crv, abi: erc20Abi, functionName: 'totalSupply' }),
          crvusdApiPromise,
          readContract({ address: addresses.vecrv, abi: erc20Abi, functionName: 'totalSupply' }),
          readContract({
            address: addresses.scrvusd,
            abi: [{ name: 'totalAssets', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const,
            functionName: 'totalAssets',
          }),
          readContract({
            address: addresses.gaugeController,
            abi: [{ name: 'n_gauges', inputs: [], outputs: [{ type: 'int128' }], stateMutability: 'view', type: 'function' }] as const,
            functionName: 'n_gauges',
          }),
          readContract({
            address: addresses.minter,
            abi: [{ name: 'rate', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const,
            functionName: 'rate',
          }),
          // Treasury crvUSD balance
          readContract({
            address: addresses.crvusd,
            abi: [{ name: 'balanceOf', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const,
            functionName: 'balanceOf',
            args: [addresses.treasury],
          }),
          // RewardsHandler dynamic weight
          readContract({
            address: REWARDS_HANDLER,
            abi: [{ name: 'weight', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const,
            functionName: 'weight',
          }),
          // RewardsHandler minimum weight
          readContract({
            address: REWARDS_HANDLER,
            abi: [{ name: 'minimum_weight', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const,
            functionName: 'minimum_weight',
          }),
          // FeeSplitter receiver 0 (RewardsHandler) — cap weight
          readContract({
            address: FEE_SPLITTER,
            abi: [{ name: 'receivers', inputs: [{ type: 'uint256' }], outputs: [{ type: 'address' }, { type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const,
            functionName: 'receivers',
            args: [0n],
          }),
          // StablecoinLens: crvUSD circulating supply (controller debt only)
          readContract({
            address: STABLECOIN_LENS,
            abi: [{ name: 'circulating_supply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const,
            functionName: 'circulating_supply',
          }),
          // scrvUSD savings statistics (supply + APY)
          scrvusdStatsPromise,
          // veCRV: total CRV locked (supply() on VotingEscrow)
          readContract({
            address: addresses.vecrv,
            abi: [{ name: 'supply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const,
            functionName: 'supply',
          }),
          // vlCVX totalSupply
          readContract({
            address: '0x72a19342e8F1838460eBFCCEf09F6585e32db86E',
            abi: erc20Abi,
            functionName: 'totalSupply',
          }),
        ])

        if (cancelled) return

        const val = (r: PromiseSettledResult<unknown>, decimals = 18) =>
          r.status === 'fulfilled' ? formatUnits(r.value as bigint, decimals) : undefined

        // Parse weights
        let rhDynamicWeight: number | undefined
        let rhMinWeight: number | undefined
        let rhMaxWeight: number | undefined
        let rhEffectiveWeight: number | undefined

        if (results[7].status === 'fulfilled') {
          rhDynamicWeight = Number(results[7].value as bigint)
        }
        if (results[8].status === 'fulfilled') {
          rhMinWeight = Number(results[8].value as bigint)
        }
        if (results[9].status === 'fulfilled') {
          const receiverResult = results[9].value as [string, bigint]
          rhMaxWeight = Number(receiverResult[1])
        }
        if (rhDynamicWeight != null && rhMaxWeight != null) {
          rhEffectiveWeight = Math.min(rhDynamicWeight, rhMaxWeight)
        }

        // Fetch FeeAllocator receivers (two-step: n_receivers, then each receiver + weight)
        let allocatorReceivers: AllocatorReceiver[] | undefined
        let allocatorDistributorWeight: number | undefined
        try {
          const nReceiversAbi = [{ name: 'n_receivers', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const
          const nReceivers = await readContract({ address: FEE_ALLOCATOR, abi: nReceiversAbi, functionName: 'n_receivers' })
          const n = Number(nReceivers)
          if (n > 0) {
            const receiversAbi = [{ name: 'receivers', inputs: [{ type: 'uint256' }], outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' }] as const
            const weightsAbi = [{ name: 'receiver_weights', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const
            const distWeightAbi = [{ name: 'distributor_weight', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const
            // Fetch all receiver addresses + distributor_weight in one batch
            const addrCalls = Array.from({ length: n }, (_, i) =>
              readContract({ address: FEE_ALLOCATOR, abi: receiversAbi, functionName: 'receivers', args: [BigInt(i)] })
            )
            const [addrResults, distWeight] = await Promise.all([
              Promise.allSettled(addrCalls),
              readContract({ address: FEE_ALLOCATOR, abi: distWeightAbi, functionName: 'distributor_weight' }).catch(() => null),
            ])
            const addrs = addrResults
              .filter((r): r is PromiseFulfilledResult<`0x${string}`> => r.status === 'fulfilled')
              .map(r => r.value as string)
            // Fetch weights for each address
            const weightResults = await Promise.allSettled(
              addrs.map(addr => readContract({ address: FEE_ALLOCATOR, abi: weightsAbi, functionName: 'receiver_weights', args: [addr as `0x${string}`] }))
            )
            allocatorReceivers = addrs.map((addr, i) => ({
              address: addr,
              weight: weightResults[i].status === 'fulfilled' ? Number(weightResults[i].value) : 0,
            }))
            if (distWeight != null) allocatorDistributorWeight = Number(distWeight)
          }
        } catch { /* FeeAllocator fetch failed, leave undefined */ }

        // Parse scrvUSD stats
        let scrvusdSupply: string | undefined
        let scrvusdApy: number | undefined
        if (results[11].status === 'fulfilled') {
          const stats = results[11].value as { supply?: number; apy?: number }
          if (stats.supply != null) scrvusdSupply = String(stats.supply)
          if (stats.apy != null) scrvusdApy = stats.apy
        }

        // Await lockers data
        const lockers = await lockersPromise

        // Compute vlCVX stats
        const vlcvxSupplyRaw = val(results[13])
        let vecrvPerVlcvx: number | undefined
        if (vlcvxSupplyRaw && lockers.convex) {
          const vlcvxNum = parseFloat(vlcvxSupplyRaw)
          const convexVecrv = parseFloat(lockers.convex.weight)
          if (vlcvxNum > 0) vecrvPerVlcvx = convexVecrv / vlcvxNum
        }

        setData({
          loading: false,
          crvSupply: val(results[0]),
          crvusdSupply: results[1].status === 'fulfilled' && results[1].value != null ? String(results[1].value) : undefined,
          vecrvSupply: val(results[2]),
          scrvusdAssets: val(results[3]),
          scrvusdSupply,
          scrvusdApy,
          nGauges: results[4].status === 'fulfilled' ? String(results[4].value) : undefined,
          minterRate: val(results[5]),
          treasuryBalance: val(results[6]),
          crvusdCirculating: val(results[10]),
          vecrvLockedCrv: val(results[12]),
          rhDynamicWeight,
          rhMinWeight,
          rhMaxWeight,
          rhEffectiveWeight,
          allocatorReceivers,
          allocatorDistributorWeight,
          lockerConvex: lockers.convex,
          lockerStakedao: lockers.stakedao,
          lockerYearn: lockers.yearn,
          vlcvxSupply: vlcvxSupplyRaw,
          vecrvPerVlcvx,
        })
      } catch (err) {
        if (!cancelled) setData({ loading: false, error: (err as Error).message })
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [])

  return data
}
