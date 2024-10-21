import React, { useEffect, useState } from "react";
import { web3, BuyMyRoomContract } from "../utils/contracts"; // 确保导入了web3和BuyMyRoomContract
import { ethers } from "ethers";
import { log } from "console";

const BuyMyRoomPage = () => {
  const [account, setAccount] = useState("");

  const [userAddress, setUserAddress] = useState<string>("");
  const [userHouses, setUserHouses] = useState<number[]>([]);
  const [housesForSale, setHousesForSale] = useState<number[]>([]);

      useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    var data = BuyMyRoomContract.methods.getHousesByOwner("0x0650bE2053B6130119829fA54a06AA79CA4B44e6").call();
    data.then((res)=>{
        console.log("看看：",res);
        
    })
    console.log(data);
    
  return (
    <div>
        6666666
    </div>
  );
};

export default BuyMyRoomPage;
