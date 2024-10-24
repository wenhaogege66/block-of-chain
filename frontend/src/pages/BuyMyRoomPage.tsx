import React, { useEffect, useState } from "react";
import { web3, BuyMyRoomContract, myERC20Contract } from "../utils/contracts"; // 确保导入了web3和BuyMyRoomContract
import { ethers, fromTwos } from "ethers";
import { log } from "console";
import "./index.css"

const GanacheTestChainId = "0x539"; // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = "Ganache Test Chain";
const GanacheTestChainRpcUrl = "http://127.0.0.1:8545";

const BuyMyRoomPage = () => {
    const [account, setAccount] = useState("");
    const [accountBalance, setAccountBalance] = useState<ethers.BigNumberish>(0)
    const [sellhousevisible, setSellhousevisible] = useState(false);
    const [sellhouseIndex, setSellhouseIndex] = useState(0);
    const [sellhouseid, setSellhouseid] = useState<ethers.BigNumberish>(0);
    const [sellprice, setSellprice] = useState<ethers.BigNumberish>(0);
    const [buyprice, setBuyprice] = useState<ethers.BigNumberish>(0);
    const [userHouses, setUserHouses] = useState<{}[]>(
        []
    );
    const [sellHouses, setSellHouses] = useState<{}[]>(
        []
    );

    useEffect(() => {
        const initCheckAccounts = async () => {
            // @ts-ignore
            const { ethereum } = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts();
                console.log("第一次获得当前用户:", accounts[0]);
                if (accounts && accounts.length) {
                    setAccount(accounts[0]);
                }
            }
        };

        // 设置一个定时器，每隔10秒执行一次
        const interval = setInterval(() => {
            initCheckAccounts();
        }, 1000); // 10000ms = 10秒

        // 在组件卸载时清除定时器
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const getHouseContractInfo = async () => {
            if (BuyMyRoomContract) {
                const accounts = await web3.eth.getAccounts();
                if (accounts[0]) {
                    const ab: number = await myERC20Contract.methods.balanceOf(accounts[0]).call()
                    console.log("当前文豪币:", ab.toString());
                    setAccountBalance(ab)
                    const houselist: number[] = await BuyMyRoomContract.methods
                        .getHousesByOwner(accounts[0])
                        .call(); //getHousesByOwner传入当前用户的地址
                    if (houselist) {
                        let houselist_info: {}[] = [];
                        houselist.forEach(async (element, index) => {
                            const tmp: { owner: string, price: number, forSale: boolean, listedTimestamp: number, id: number } = await BuyMyRoomContract.methods.getHouseDetails(houselist[index]).call();
                            // console.log("当前tmp的id:", tmp.id.toString());
                            houselist_info.push({ owner: tmp.owner, price: tmp.price.toString(), forSale: tmp.forSale, listedTimestamp: tmp.listedTimestamp.toString(), id: houselist[index].toString() })
                        });
                        console.log("当前houselist_info:", houselist_info);
                        setUserHouses(houselist_info);
                    }
                }
                const salehouselist: number[] = await BuyMyRoomContract.methods
                    .getHousesForSale()
                    .call();
                if (salehouselist) {
                    let salehouselist_info: {}[] = [];
                    salehouselist.forEach(async (element, index) => {
                        const tmp: { owner: string, price: number, forSale: boolean, listedTimestamp: number, id: number } = await BuyMyRoomContract.methods.getHouseDetails(salehouselist[index]).call();
                        salehouselist_info.push({ owner: tmp.owner, price: tmp.price.toString(), forSale: tmp.forSale, listedTimestamp: tmp.listedTimestamp.toString(), id: salehouselist[index].toString() })
                    });
                    console.log("当前salehouselist_info:", salehouselist_info);
                    setSellHouses(salehouselist_info);
                }

            } else {
                alert("Contract not exists.");
            }
        };
        getHouseContractInfo();
    }, []);

    const onClickConnectWallet = async () => {
        // window.location.reload();
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const { ethereum } = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert("MetaMask is not installed!");
            return;
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: chain.chainId }],
                    });
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [chain],
                        });
                    }
                }
            }
            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({ method: "eth_requestAccounts" });
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({ method: "eth_accounts" });
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || "Not able to get accounts");
        } catch (error: any) {
            alert(error.message);
        }
    };

    const onClickBuyHouse = async (houseId: string, houseindex: number, price: string) => {
        setBuyprice(ethers.toBigInt(price));
        console.log(`Buy house with ID: ${ethers.toBigInt(houseId)}`);
        console.log(`house price: ${ethers.toBigInt(price)}`);
        try {
            // 当前用户将一些资金授予给lottery合约
            await myERC20Contract.methods.approve(BuyMyRoomContract.options.address, ethers.toBigInt(price)).send({
                from: account
            })
            await BuyMyRoomContract.methods.buyHouse(ethers.toBigInt(houseId)).send({ from: account })
        }
        catch (error: any) {
            console.error("Error during buyHouse:", error);
            alert(`Error: ${error.message}. Full details: ${JSON.stringify(error)}`);
        }
    }


    const onClickSellHouse = (houseId: string, houseindex: number) => {
        setSellprice(0);
        // console.log(`Selling house with ID: ${houseId}`);
        // console.log(`Selling house with ID: ${web3.utils.toHex(houseId)}`);
        console.log(`Selling house with ID: ${ethers.toBigInt(houseId)}`);
        setSellhouseid(ethers.toBigInt(houseId))
        setSellhousevisible(true);
        setSellhouseIndex(houseindex);
        // 在这里添加卖房的逻辑
    };

    const confirmSell = async () => {
        console.log(`Selling price: ${ethers.toBigInt(sellprice)}`);
        if (sellprice == 0) {
            alert("请输入价格");
        }
        else {
            setSellhousevisible(false);
            try {
                await BuyMyRoomContract.methods.listHouseForSale(sellhouseid, sellprice).send({ from: account })
            }
            catch (error: any) {
                alert(error.message);
            }
        }
    };

    const onClaimTokenAirdrop = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (myERC20Contract) {
            try {
                await myERC20Contract.methods.airdrop().send({
                    from: account
                })
                alert('You have claimed WenCoin Token.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }



    return (
        <div>
            <div>当前用户：{account === '' ? '无用户连接' : account}</div>
            <div>当前用户拥有文豪币数量：{account === '' ? 0 : accountBalance.toString()}</div>
            <div>
                <button onClick={onClickConnectWallet}>Connect Wallet</button>
                <button onClick={onClaimTokenAirdrop}>领取文豪币空投</button>
            </div>


            {sellhousevisible && (
                <div className="subscribe-container">
                    <div className="subscribe">
                        <p>Sell house {sellhouseIndex}!</p>
                        <input placeholder="Give Your Price" onChange={e => setSellprice(ethers.toBigInt(e.target.value))} className="subscribe-input" />
                        <div className="submit-btn" onClick={() => confirmSell()}>Sell</div>
                    </div>
                </div>
            )}

            {/* 显示用户房屋信息 */}
            <h3>你所拥有的房产:</h3>
            <div className="houses-container">
                {userHouses.length > 0 ? (
                    userHouses.map((element: any, index: number) => {
                        // 处理owner显示格式：前5个和后三个字符，中间用省略号
                        const shortenedOwner = `${element.owner.slice(0, 5)}...${element.owner.slice(-3)}`;

                        return (
                            <div key={index} className="book">
                                <button className="button" onClick={() => onClickSellHouse(element.id, index)}>Sell it Now!</button>
                                <div className="cover">
                                    <div><p>House {index + 1}</p></div>
                                    <div><p>Owner: {shortenedOwner}</p></div>
                                    <div><p>ID: {element.id}</p></div>
                                    <div><p>For Sale: {element.forSale ? "Yes" : "No"}</p></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>No houses owned by the user.</p>
                )}
            </div>
            <h3>正在售卖的房产:</h3>
            <div className="houses-container">
                {sellHouses.length > 0 ? (
                    sellHouses.map((element: any, index: number) => {
                        // 处理owner显示格式：前5个和后三个字符，中间用省略号
                        const shortenedOwner = `${element.owner.slice(0, 5)}...${element.owner.slice(-3)}`;

                        return (
                            <div key={index} className="book">
                                <button className="button" onClick={() => onClickBuyHouse(element.id, index, element.price)}>Buy it Now!</button>
                                <div className="cover">
                                    <div><p>House {index + 1}</p></div>
                                    <div><p>Owner: {shortenedOwner}</p></div>
                                    <div><p>ID: {element.id}</p></div>
                                    <div><p>PRICE: {element.price}</p></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>No house is selling now .</p>
                )}
            </div>
        </div>
    );
};

export default BuyMyRoomPage;
