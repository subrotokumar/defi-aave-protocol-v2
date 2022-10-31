const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()
    // abi, address

    // Lending Pool Address Provider: 0x5E52dEc931FFb32f609681B8438A51c675cc232d
    // Lending pool: ^
    const lendingPool = await getLendingPool(deployer)
    console.log(`LeadingPool Address ${lendingPool.address}`)

    // DEPOSITE >>>
    // Approve
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)

    // Depositing Weth to Aave
    console.log(">>> Depositing Weth ...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)

    let { availableBorrowsETH, totalDebtETH } = await getBorrowData(lendingPool, deployer)

    // Getting Dai price data
    const daiPrice = await getDaiPrice()
    const ammountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())
    console.log(`You can borrow ${ammountDaiToBorrow} DAI`)
    const ammountDaiToBorrowWei = ethers.utils.parseEther(ammountDaiToBorrow.toString())

    // Borrow Time
    const daiTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"
    await borrowDai(daiTokenAddress, lendingPool, ammountDaiToBorrowWei, deployer)
    await getBorrowData(lendingPool, deployer)

    // Replaying borrowed Dai
    await repay(ammountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer)
    await getBorrowData(lendingPool, deployer)
}

async function repay(ammount, daiAddress, lendingPool, account) {
    console.log(">>> Repaying...")
    await approveErc20(daiAddress, lendingPool.address, ammount, account)
    const repayTx = await lendingPool.repay(daiAddress, ammount, 1, account)
    repayTx.wait(1)
    console.log("> Repaid!")
}

async function borrowDai(daiAddress, lendingPool, ammountDaiToBorrowWei, account) {
    console.log(">>> Borrowing Dai...")
    const borrowTx = await lendingPool.borrow(daiAddress, ammountDaiToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log(`> You've borrowed!`)
}

async function getDaiPrice() {
    console.log(">>> Getting Dai pricefeed ...")
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
}

async function getBorrowData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`Borrow Data: `)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed`)
    console.log(`You have borrow ${availableBorrowsETH} worth of ETH.`)
    return { availableBorrowsETH, totalDebtETH }
}

async function getLendingPool(account) {
    console.log(">>> Getting Lending Pool ...")
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("> Approved ERC20!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
