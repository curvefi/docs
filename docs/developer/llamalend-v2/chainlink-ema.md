# ChainlinkEMA

`ChainlinkEMA` is a price source oracle for Llamalend v2 markets. It reads a [Chainlink](https://docs.chain.link/data-feeds) price feed and returns an exponential moving average (EMA) of its answers, sampled at a fixed time interval. Smoothing the feed this way keeps a single Chainlink update from moving the market's oracle price all at once.

The contract is usually not used on its own but as one part of a market's oracle stack, for example combined with a Curve pool oracle through a [`ChainOracle`](./oracles#available-oracles). See [Oracles](./oracles) for how oracle stacks are put together.

:::solidity[`ChainlinkEMA.sol`]

The source code for the `ChainlinkEMA.sol` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/price_oracles/v2/ChainlinkEMA.sol). The contract is written in [Solidity](https://soliditylang.org/) version `0.8.25`. It is based on the Chainlink EMA oracle by [defi.money](https://github.com/defidotmoney/dfm-contracts).

A separate instance is deployed for every market (and every Chainlink feed) that uses it.

<ContractABI>

```json
[{"inputs":[{"internalType":"contract IChainlinkAggregator","name":"_chainlink","type":"address"},{"internalType":"uint256","name":"_observations","type":"uint256"},{"internalType":"uint256","name":"_interval","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"INTERVAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"OBSERVATIONS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SMOOTHING_FACTOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"chainlinkFeed","outputs":[{"internalType":"contract IChainlinkAggregator","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"price","outputs":[{"internalType":"uint256","name":"currentPrice","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"price_w","outputs":[{"internalType":"uint256","name":"currentPrice","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"storedObservationTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"storedPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"storedResponse","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"uint128","name":"updatedAt","type":"uint128"},{"internalType":"uint8","name":"decimals","type":"uint8"},{"internalType":"uint256","name":"answer","type":"uint256"}],"stateMutability":"view","type":"function"}]
```

</ContractABI>

:::

---

## How It Works

The oracle is configured at deployment with three values: the Chainlink feed, the number of observations `OBSERVATIONS` ($N$) and the sampling interval `INTERVAL` in seconds.

Time is split into observation slots that are multiples of `INTERVAL`. The current observation timestamp is `block.timestamp` rounded down to the nearest multiple of `INTERVAL`. For each slot, the oracle takes the Chainlink answer that was current just before the slot began and folds it into the EMA:

$$
\text{EMA}_t = \alpha \cdot p_t + (1 - \alpha) \cdot \text{EMA}_{t-1}, \qquad \alpha = \frac{2}{N + 1}
$$

where $p_t$ is the Chainlink answer for slot $t$ and $\alpha$ is stored as `SMOOTHING_FACTOR` (scaled by `1e18`). Because the EMA only advances once per slot, the price stays constant within an interval.

**Catching up.** The oracle stores the last EMA value, the slot it was computed for and the last Chainlink round it read. When `price()` or `price_w()` is called in a later slot, it walks forward from the stored slot to the current one, advancing the EMA once per slot and reading any Chainlink rounds published in between. If no new round was published, the stored answer is reused for every slot.

**Rebuilding.** If the stored slot is `2 * OBSERVATIONS` intervals or more in the past, or the Chainlink feed has switched to a new phase aggregator, the oracle discards its state and rebuilds the EMA from scratch. It walks backwards through the feed's rounds to collect the answer for up to `2 * OBSERVATIONS` past slots, then computes the EMA forward from the oldest one.

**Normalization.** Chainlink answers are scaled to 18 decimals. The oracle reverts if the feed reports more than 18 decimals or a non-positive answer.

:::warning[No staleness check]
The oracle does not check when the Chainlink feed was last updated. If the feed stops updating, the EMA keeps converging to the last reported answer. Any staleness protection has to be added elsewhere in the oracle stack.
:::

---

## Price Methods

### `price`
::::description[`ChainlinkEMA.price() -> uint256: view`]

Getter for the current EMA price. If the EMA was already computed for the current observation slot, the stored value is returned. Otherwise the EMA is advanced to the current slot (or rebuilt, see [How It Works](#how-it-works)) without writing anything to storage.

Returns: EMA price of the Chainlink feed, scaled to `1e18` (`uint256`).

<SourceCode>

```solidity
IChainlinkAggregator public immutable chainlinkFeed;
uint256 public immutable OBSERVATIONS;
uint256 public immutable INTERVAL;
uint256 public immutable SMOOTHING_FACTOR;

uint256 private immutable MAX_LOOKBACK;

uint256 public storedPrice;
uint256 public storedObservationTimestamp;
ChainlinkResponse public storedResponse;

function price() external view returns (uint256 currentPrice) {
    uint256 currentObservation = _getCurrentObservationTimestamp();
    uint256 storedObservation = storedObservationTimestamp;
    if (currentObservation == storedObservation) return storedPrice;

    if (storedObservation + MAX_LOOKBACK * INTERVAL > currentObservation) {
        (currentPrice,,) = _calculateLatestEMA(currentObservation, storedObservation);
    } else {
        (currentPrice,) = _calculateNewEMA(currentObservation);
    }
    return currentPrice;
}

function _calculateLatestEMA(uint256 currentObservation, uint256 storedObservation)
    internal
    view
    returns (uint256 currentPrice, ChainlinkResponse memory latestResponse, bool isNewResponse)
{
    currentPrice = storedPrice;
    latestResponse = _getLatestRoundData();
    ChainlinkResponse memory response = storedResponse;

    if (latestResponse.roundId == response.roundId) {
        uint256 answer = response.answer;
        while (storedObservation < currentObservation) {
            storedObservation += INTERVAL;
            currentPrice = _getNextEMA(answer, currentPrice);
        }
        return (currentPrice, latestResponse, false);
    }

    // a new phase aggregator carries rounds from before the switch, walking them forward is unbounded
    if ((latestResponse.roundId >> 64) != (response.roundId >> 64)) {
        (currentPrice, latestResponse) = _calculateNewEMA(currentObservation);
        return (currentPrice, latestResponse, true);
    }

    bool isLatestResponse;
    ChainlinkResponse memory nextResponse;
    if (latestResponse.roundId > response.roundId + 1) {
        nextResponse = _getRoundData(response.roundId + 1, latestResponse.decimals);
    } else {
        nextResponse = latestResponse;
    }

    while (storedObservation < currentObservation) {
        storedObservation += INTERVAL;
        while (!isLatestResponse && nextResponse.updatedAt < storedObservation) {
            response = nextResponse;
            if (nextResponse.roundId == latestResponse.roundId) {
                isLatestResponse = true;
            } else {
                nextResponse = _getRoundData(nextResponse.roundId + 1, latestResponse.decimals);
            }
        }
        currentPrice = _getNextEMA(response.answer, currentPrice);
    }

    return (currentPrice, latestResponse, true);
}

function _calculateNewEMA(uint256 observationTimestamp)
    internal
    view
    returns (uint256 currentPrice, ChainlinkResponse memory latestResponse)
{
    latestResponse = _getLatestRoundData();
    ChainlinkResponse memory response = latestResponse;

    uint256[] memory oracleResponses = new uint256[](MAX_LOOKBACK);
    uint256 idx = MAX_LOOKBACK;

    while (true) {
        while (response.updatedAt >= observationTimestamp) {
            if (response.roundId & type(uint64).max == 1) {
                break;
            }
            response = _getRoundData(response.roundId - 1, latestResponse.decimals);
        }
        if (response.updatedAt >= observationTimestamp) {
            if (idx == MAX_LOOKBACK) {
                return (response.answer, latestResponse);
            }
            break;
        }
        idx--;
        oracleResponses[idx] = response.answer;
        if (idx == 0) break;
        observationTimestamp -= INTERVAL;
    }

    currentPrice = oracleResponses[idx];
    idx++;
    while (idx < MAX_LOOKBACK) {
        currentPrice = _getNextEMA(oracleResponses[idx], currentPrice);
        idx++;
    }

    return (currentPrice, latestResponse);
}

function _getNextEMA(uint256 newPrice, uint256 lastEMA) internal view returns (uint256) {
    return ((newPrice * SMOOTHING_FACTOR) + (lastEMA * (1e18 - SMOOTHING_FACTOR))) / 1e18;
}

function _getCurrentObservationTimestamp() internal view returns (uint256) {
    return (block.timestamp / INTERVAL) * INTERVAL;
}

function _getLatestRoundData() internal view returns (ChainlinkResponse memory) {
    (uint80 roundId, int256 answer,, uint256 updatedAt,) = chainlinkFeed.latestRoundData();
    // the proxy reports the current aggregator's decimals, so they only change with the phase.
    // Rounds are only ever read from the latest phase, so its decimals apply to all of them
    uint8 decimals = storedResponse.decimals;
    if ((roundId >> 64) != (storedResponse.roundId >> 64)) {
        decimals = _getFeedDecimals();
    }
    return _validateAndFormatResponse(roundId, answer, updatedAt, decimals);
}

function _getRoundData(uint80 roundId, uint8 decimals) internal view returns (ChainlinkResponse memory) {
    (uint80 round, int256 answer,, uint256 updatedAt,) = chainlinkFeed.getRoundData(roundId);
    return _validateAndFormatResponse(round, answer, updatedAt, decimals);
}

function _getFeedDecimals() internal view returns (uint8) {
    uint256 feedDecimals = chainlinkFeed.decimals();
    require(feedDecimals <= 18, "DFM: Chainlink decimals too high");
    return uint8(feedDecimals);
}

function _validateAndFormatResponse(uint80 roundId, int256 answer, uint256 updatedAt, uint8 decimals)
    internal
    pure
    returns (ChainlinkResponse memory)
{
    require(answer > 0, "DFM: Chainlink answer too low");
    return
        ChainlinkResponse({
            roundId: roundId,
            updatedAt: uint128(updatedAt),
            decimals: decimals,
            answer: uint256(answer) * 10 ** (18 - decimals)
        });
}
```

</SourceCode>

<Example>

```shell
>>> ChainlinkEMA.price()
```

</Example>

::::

### `price_w`
::::description[`ChainlinkEMA.price_w() -> uint256`]

Computes the current EMA price in the same way as `price()` and writes the result to storage: `storedPrice`, `storedObservationTimestamp` and, if a new Chainlink round was read, `storedResponse` are updated. This function is callable by anyone. When the oracle is part of a market, the market's AMM calls it on every exchange.

Returns: EMA price of the Chainlink feed, scaled to `1e18` (`uint256`).

<SourceCode>

```solidity
IChainlinkAggregator public immutable chainlinkFeed;
uint256 public immutable OBSERVATIONS;
uint256 public immutable INTERVAL;
uint256 public immutable SMOOTHING_FACTOR;

uint256 private immutable MAX_LOOKBACK;

uint256 public storedPrice;
uint256 public storedObservationTimestamp;
ChainlinkResponse public storedResponse;

function price_w() external returns (uint256 currentPrice) {
    uint256 currentObservation = _getCurrentObservationTimestamp();
    uint256 storedObservation = storedObservationTimestamp;
    if (currentObservation == storedObservation) return storedPrice;

    if (storedObservation + MAX_LOOKBACK * INTERVAL > currentObservation) {
        bool isNewResponse;
        ChainlinkResponse memory response;
        (currentPrice, response, isNewResponse) = _calculateLatestEMA(currentObservation, storedObservation);
        if (isNewResponse) storedResponse = response;
    } else {
        (currentPrice, storedResponse) = _calculateNewEMA(currentObservation);
    }
    storedObservationTimestamp = currentObservation;
    storedPrice = currentPrice;
    return currentPrice;
}

function _calculateLatestEMA(uint256 currentObservation, uint256 storedObservation)
    internal
    view
    returns (uint256 currentPrice, ChainlinkResponse memory latestResponse, bool isNewResponse)
{
    currentPrice = storedPrice;
    latestResponse = _getLatestRoundData();
    ChainlinkResponse memory response = storedResponse;

    if (latestResponse.roundId == response.roundId) {
        uint256 answer = response.answer;
        while (storedObservation < currentObservation) {
            storedObservation += INTERVAL;
            currentPrice = _getNextEMA(answer, currentPrice);
        }
        return (currentPrice, latestResponse, false);
    }

    // a new phase aggregator carries rounds from before the switch, walking them forward is unbounded
    if ((latestResponse.roundId >> 64) != (response.roundId >> 64)) {
        (currentPrice, latestResponse) = _calculateNewEMA(currentObservation);
        return (currentPrice, latestResponse, true);
    }

    bool isLatestResponse;
    ChainlinkResponse memory nextResponse;
    if (latestResponse.roundId > response.roundId + 1) {
        nextResponse = _getRoundData(response.roundId + 1, latestResponse.decimals);
    } else {
        nextResponse = latestResponse;
    }

    while (storedObservation < currentObservation) {
        storedObservation += INTERVAL;
        while (!isLatestResponse && nextResponse.updatedAt < storedObservation) {
            response = nextResponse;
            if (nextResponse.roundId == latestResponse.roundId) {
                isLatestResponse = true;
            } else {
                nextResponse = _getRoundData(nextResponse.roundId + 1, latestResponse.decimals);
            }
        }
        currentPrice = _getNextEMA(response.answer, currentPrice);
    }

    return (currentPrice, latestResponse, true);
}

function _calculateNewEMA(uint256 observationTimestamp)
    internal
    view
    returns (uint256 currentPrice, ChainlinkResponse memory latestResponse)
{
    latestResponse = _getLatestRoundData();
    ChainlinkResponse memory response = latestResponse;

    uint256[] memory oracleResponses = new uint256[](MAX_LOOKBACK);
    uint256 idx = MAX_LOOKBACK;

    while (true) {
        while (response.updatedAt >= observationTimestamp) {
            if (response.roundId & type(uint64).max == 1) {
                break;
            }
            response = _getRoundData(response.roundId - 1, latestResponse.decimals);
        }
        if (response.updatedAt >= observationTimestamp) {
            if (idx == MAX_LOOKBACK) {
                return (response.answer, latestResponse);
            }
            break;
        }
        idx--;
        oracleResponses[idx] = response.answer;
        if (idx == 0) break;
        observationTimestamp -= INTERVAL;
    }

    currentPrice = oracleResponses[idx];
    idx++;
    while (idx < MAX_LOOKBACK) {
        currentPrice = _getNextEMA(oracleResponses[idx], currentPrice);
        idx++;
    }

    return (currentPrice, latestResponse);
}

function _getNextEMA(uint256 newPrice, uint256 lastEMA) internal view returns (uint256) {
    return ((newPrice * SMOOTHING_FACTOR) + (lastEMA * (1e18 - SMOOTHING_FACTOR))) / 1e18;
}

function _getCurrentObservationTimestamp() internal view returns (uint256) {
    return (block.timestamp / INTERVAL) * INTERVAL;
}

function _getLatestRoundData() internal view returns (ChainlinkResponse memory) {
    (uint80 roundId, int256 answer,, uint256 updatedAt,) = chainlinkFeed.latestRoundData();
    // the proxy reports the current aggregator's decimals, so they only change with the phase.
    // Rounds are only ever read from the latest phase, so its decimals apply to all of them
    uint8 decimals = storedResponse.decimals;
    if ((roundId >> 64) != (storedResponse.roundId >> 64)) {
        decimals = _getFeedDecimals();
    }
    return _validateAndFormatResponse(roundId, answer, updatedAt, decimals);
}

function _getRoundData(uint80 roundId, uint8 decimals) internal view returns (ChainlinkResponse memory) {
    (uint80 round, int256 answer,, uint256 updatedAt,) = chainlinkFeed.getRoundData(roundId);
    return _validateAndFormatResponse(round, answer, updatedAt, decimals);
}

function _getFeedDecimals() internal view returns (uint8) {
    uint256 feedDecimals = chainlinkFeed.decimals();
    require(feedDecimals <= 18, "DFM: Chainlink decimals too high");
    return uint8(feedDecimals);
}

function _validateAndFormatResponse(uint80 roundId, int256 answer, uint256 updatedAt, uint8 decimals)
    internal
    pure
    returns (ChainlinkResponse memory)
{
    require(answer > 0, "DFM: Chainlink answer too low");
    return
        ChainlinkResponse({
            roundId: roundId,
            updatedAt: uint128(updatedAt),
            decimals: decimals,
            answer: uint256(answer) * 10 ** (18 - decimals)
        });
}
```

</SourceCode>

<Example>

```shell
>>> ChainlinkEMA.price_w()
```

</Example>

::::

---

## Parameters

### `chainlinkFeed`
::::description[`ChainlinkEMA.chainlinkFeed() -> address: view`]

Getter for the Chainlink price feed the oracle reads from. Set at deployment and cannot be changed.

Returns: Chainlink aggregator (`address`).

<SourceCode>

```solidity
IChainlinkAggregator public immutable chainlinkFeed;

constructor(IChainlinkAggregator _chainlink, uint256 _observations, uint256 _interval) {
    ...
    chainlinkFeed = _chainlink;
    ...
}
```

</SourceCode>

<Example>

```shell
>>> ChainlinkEMA.chainlinkFeed()
```

</Example>

::::

### `OBSERVATIONS`
::::description[`ChainlinkEMA.OBSERVATIONS() -> uint256: view`]

Getter for the number of observations $N$ the EMA is based on. It sets the smoothing factor ($\alpha = 2 / (N + 1)$), and the oracle rebuilds its EMA from up to $2N$ past observations. Set at deployment and cannot be changed.

Returns: number of observations (`uint256`).

<SourceCode>

```solidity
uint256 public immutable OBSERVATIONS;

constructor(IChainlinkAggregator _chainlink, uint256 _observations, uint256 _interval) {
    ...
    require(_observations > 0 && _interval > 0, "DFM: invalid observations or interval");
    OBSERVATIONS = _observations;
    ...
}
```

</SourceCode>

<Example>

```shell
>>> ChainlinkEMA.OBSERVATIONS()
10
```

</Example>

::::

### `INTERVAL`
::::description[`ChainlinkEMA.INTERVAL() -> uint256: view`]

Getter for the length of an observation slot in seconds. The EMA advances by one observation per interval. Set at deployment and cannot be changed.

Returns: observation interval in seconds (`uint256`).

<SourceCode>

```solidity
uint256 public immutable INTERVAL;

constructor(IChainlinkAggregator _chainlink, uint256 _observations, uint256 _interval) {
    ...
    require(_observations > 0 && _interval > 0, "DFM: invalid observations or interval");
    INTERVAL = _interval;
    ...
}
```

</SourceCode>

<Example>

```shell
>>> ChainlinkEMA.INTERVAL()
60
```

</Example>

::::

### `SMOOTHING_FACTOR`
::::description[`ChainlinkEMA.SMOOTHING_FACTOR() -> uint256: view`]

Getter for the EMA smoothing factor $\alpha = 2 / (N + 1)$, scaled by `1e18`, where $N$ is `OBSERVATIONS`. It is the weight given to each new Chainlink answer; the previous EMA value gets the remaining weight $1 - \alpha$.

Returns: smoothing factor (`uint256`).

<SourceCode>

```solidity
uint256 public immutable SMOOTHING_FACTOR;

constructor(IChainlinkAggregator _chainlink, uint256 _observations, uint256 _interval) {
    ...
    SMOOTHING_FACTOR = 2e18 / (_observations + 1);
    ...
}

function _getNextEMA(uint256 newPrice, uint256 lastEMA) internal view returns (uint256) {
    return ((newPrice * SMOOTHING_FACTOR) + (lastEMA * (1e18 - SMOOTHING_FACTOR))) / 1e18;
}
```

</SourceCode>

<Example>

```shell
>>> ChainlinkEMA.SMOOTHING_FACTOR()     # OBSERVATIONS = 10
181818181818181818
```

</Example>

::::

---

## Stored State

### `storedPrice`
::::description[`ChainlinkEMA.storedPrice() -> uint256: view`]

Getter for the EMA price as of the last write, i.e. the last call to `price_w()` (or deployment). This can be older than the current price; use `price()` to get the up-to-date value.

Returns: last stored EMA price, scaled to `1e18` (`uint256`).

<SourceCode>

```solidity
uint256 public storedPrice;

constructor(IChainlinkAggregator _chainlink, uint256 _observations, uint256 _interval) {
    ...
    uint256 currentObservation = _getCurrentObservationTimestamp();
    (storedPrice, storedResponse) = _calculateNewEMA(currentObservation);
    storedObservationTimestamp = currentObservation;
}

function price_w() external returns (uint256 currentPrice) {
    uint256 currentObservation = _getCurrentObservationTimestamp();
    uint256 storedObservation = storedObservationTimestamp;
    if (currentObservation == storedObservation) return storedPrice;

    if (storedObservation + MAX_LOOKBACK * INTERVAL > currentObservation) {
        bool isNewResponse;
        ChainlinkResponse memory response;
        (currentPrice, response, isNewResponse) = _calculateLatestEMA(currentObservation, storedObservation);
        if (isNewResponse) storedResponse = response;
    } else {
        (currentPrice, storedResponse) = _calculateNewEMA(currentObservation);
    }
    storedObservationTimestamp = currentObservation;
    storedPrice = currentPrice;
    return currentPrice;
}
```

</SourceCode>

<Example>

```shell
>>> ChainlinkEMA.storedPrice()
```

</Example>

::::

### `storedObservationTimestamp`
::::description[`ChainlinkEMA.storedObservationTimestamp() -> uint256: view`]

Getter for the observation slot `storedPrice` was computed for. It is a timestamp rounded down to a multiple of `INTERVAL`.

Returns: timestamp of the last stored observation slot (`uint256`).

<SourceCode>

```solidity
uint256 public storedObservationTimestamp;

constructor(IChainlinkAggregator _chainlink, uint256 _observations, uint256 _interval) {
    ...
    uint256 currentObservation = _getCurrentObservationTimestamp();
    (storedPrice, storedResponse) = _calculateNewEMA(currentObservation);
    storedObservationTimestamp = currentObservation;
}

function price_w() external returns (uint256 currentPrice) {
    uint256 currentObservation = _getCurrentObservationTimestamp();
    uint256 storedObservation = storedObservationTimestamp;
    if (currentObservation == storedObservation) return storedPrice;

    if (storedObservation + MAX_LOOKBACK * INTERVAL > currentObservation) {
        bool isNewResponse;
        ChainlinkResponse memory response;
        (currentPrice, response, isNewResponse) = _calculateLatestEMA(currentObservation, storedObservation);
        if (isNewResponse) storedResponse = response;
    } else {
        (currentPrice, storedResponse) = _calculateNewEMA(currentObservation);
    }
    storedObservationTimestamp = currentObservation;
    storedPrice = currentPrice;
    return currentPrice;
}

function _getCurrentObservationTimestamp() internal view returns (uint256) {
    return (block.timestamp / INTERVAL) * INTERVAL;
}
```

</SourceCode>

<Example>

```shell
>>> ChainlinkEMA.storedObservationTimestamp()
```

</Example>

::::

### `storedResponse`
::::description[`ChainlinkEMA.storedResponse() -> ChainlinkResponse: view`]

Getter for the last Chainlink round the oracle read and stored. It is used as the starting point when the EMA is advanced to a later slot.

Returns: `roundId` (`uint80`), `updatedAt` (`uint128`), `decimals` (`uint8`) and `answer` (`uint256`), where `answer` is already scaled to `1e18`.

<SourceCode>

```solidity
struct ChainlinkResponse {
    uint80 roundId;
    uint128 updatedAt;
    uint8 decimals;
    uint256 answer;
}

ChainlinkResponse public storedResponse;

constructor(IChainlinkAggregator _chainlink, uint256 _observations, uint256 _interval) {
    ...
    // round ids without phase bits never trigger the phase check, so load decimals up front
    storedResponse.decimals = _getFeedDecimals();
    uint256 currentObservation = _getCurrentObservationTimestamp();
    (storedPrice, storedResponse) = _calculateNewEMA(currentObservation);
    storedObservationTimestamp = currentObservation;
}

function price_w() external returns (uint256 currentPrice) {
    uint256 currentObservation = _getCurrentObservationTimestamp();
    uint256 storedObservation = storedObservationTimestamp;
    if (currentObservation == storedObservation) return storedPrice;

    if (storedObservation + MAX_LOOKBACK * INTERVAL > currentObservation) {
        bool isNewResponse;
        ChainlinkResponse memory response;
        (currentPrice, response, isNewResponse) = _calculateLatestEMA(currentObservation, storedObservation);
        if (isNewResponse) storedResponse = response;
    } else {
        (currentPrice, storedResponse) = _calculateNewEMA(currentObservation);
    }
    storedObservationTimestamp = currentObservation;
    storedPrice = currentPrice;
    return currentPrice;
}

function _getLatestRoundData() internal view returns (ChainlinkResponse memory) {
    (uint80 roundId, int256 answer,, uint256 updatedAt,) = chainlinkFeed.latestRoundData();
    // the proxy reports the current aggregator's decimals, so they only change with the phase.
    // Rounds are only ever read from the latest phase, so its decimals apply to all of them
    uint8 decimals = storedResponse.decimals;
    if ((roundId >> 64) != (storedResponse.roundId >> 64)) {
        decimals = _getFeedDecimals();
    }
    return _validateAndFormatResponse(roundId, answer, updatedAt, decimals);
}

function _validateAndFormatResponse(uint80 roundId, int256 answer, uint256 updatedAt, uint8 decimals)
    internal
    pure
    returns (ChainlinkResponse memory)
{
    require(answer > 0, "DFM: Chainlink answer too low");
    return
        ChainlinkResponse({
            roundId: roundId,
            updatedAt: uint128(updatedAt),
            decimals: decimals,
            answer: uint256(answer) * 10 ** (18 - decimals)
        });
}
```

</SourceCode>

<Example>

```shell
>>> ChainlinkEMA.storedResponse()
```

</Example>

::::
