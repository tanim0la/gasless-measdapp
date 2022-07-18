// RelayHub: 0x6650d69225CA31049DB7Bd210aE4671c0B1ca132

// Forwarder: 0x83A54884bE4657706785D7309cf46B58FE5f6e8a

// VersionRegistry: 0xedD8C4103acAd42F7478021143E29e1B05aD85C6

// Accept-Everything Paymaster: 0xA6e10aA9B038c9Cddea24D2ae77eC3cE38a0c016

// message ca: 0xb836B5Ba2c9165afFf31fC39049Fbf42E58e2043

// Paymaster Address: 0xd60B427947bD86cb186C7Ea432b062A8b26Cf50e

import { ethers } from 'ethers'
import compiledMessageV4 from './Message.json'
require('dotenv').config()

let pprovider

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  pprovider = new ethers.providers.Web3Provider(window.ethereum)
} else {
  pprovider = new ethers.providers.JsonRpcProvider(process.env.NETWORK)
}

const contract = new ethers.Contract(
  '0xb836B5Ba2c9165afFf31fC39049Fbf42E58e2043',
  compiledMessageV4.abi,
  pprovider,
)

export default contract
