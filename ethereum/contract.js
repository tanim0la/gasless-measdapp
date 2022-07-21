// message ca: 0xb836B5Ba2c9165afFf31fC39049Fbf42E58e2043

import { ethers } from 'ethers'
import compiledMessageV4 from './Message.json'
//require('dotenv').config()

let pprovider

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  pprovider = new ethers.providers.Web3Provider(window.ethereum)
} else {
  pprovider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/adaa638d09ba451589fc8a00235e3489')
}

const contract = new ethers.Contract(
  '0xb836B5Ba2c9165afFf31fC39049Fbf42E58e2043',
  compiledMessageV4.abi,
  pprovider,
)

export default contract
