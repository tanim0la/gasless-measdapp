import React, { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import { Biconomy } from '@biconomy/mexa'
import contract from '../ethereum/contract'
import { useRouter } from 'next/router'
const compiledMessageV4 = require('../ethereum/Message.json')

let accounts, contractt
let ethersProvider, walletProvider, walletSigner
let biconomy

export default function Message() {
  const [address, setAddress] = useState('Not Connected')
  const [message, setMessage] = useState('')
  const [contractMessage, setContractMessage] = useState('loading...')
  const [errMessage, setErrMessage] = useState('')
  const [buttonMsg, setButtonMsg] = useState('')
  const [connected, setConnected] = useState(false)
  const [bool, setBool] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState('')

  const Router = useRouter()

  const conf = {
    ourContract: '0xb836B5Ba2c9165afFf31fC39049Fbf42E58e2043',
  }

  const connectt = async () => {
    if (
      typeof window !== 'undefined' &&
      typeof window.ethereum !== 'undefined'
    ) {
      accounts = await window.ethereum.request({
        method: 'eth_accounts',
      })
      if (accounts[0]) {
        setButtonMsg('Post Message')
        setConnected(true)
        setAddress(accounts[0])

        biconomy = new Biconomy(window.ethereum, {
          walletProvider: window.ethereum,
          apiKey: 'W8lnvPL_Q.d9ad4001-5909-4097-beb6-a51135201fb8',
          contractAddresses: [conf.ourContract],
          debug: true,
        })

        biconomy
          .onEvent(biconomy.READY, async () => {
            // Initialize your dapp here like getting user accounts etc
            ethersProvider = new ethers.providers.Web3Provider(biconomy)
            walletProvider = new ethers.providers.Web3Provider(window.ethereum)
            walletSigner = walletProvider.getSigner()

            let userAddress = await walletSigner.getAddress()
            setSelectedAddress(userAddress)

            contractt = new ethers.Contract(
              conf.ourContract,
              compiledMessageV4.abi,
              biconomy.getSignerByAddress(userAddress),
            )
          })
          .onEvent(biconomy.ERROR, (error, message) => {
            // Handle error while initializing mexa
            console.log(message)
          })
      } else {
        setAddress('Not Connected')
        setButtonMsg('Connect Wallet')
        setConnected(false)
      }
    } else {
      setAddress('Not Connected')
      setButtonMsg('Connect Wallet')
      setConnected(false)
    }
  }

  const messagee = async () => {
    const cMessage = await contract.message()
    setContractMessage(cMessage)

    contract.on('newMessages', (addy, _message) => {
      setContractMessage(_message)
    })
  }

  useEffect(() => {
    connectt()
  }, [address])

  useEffect(() => {
    messagee()
  }, [])

  const onConnect = async () => {
    setErrMessage('')
    if (
      typeof window !== 'undefined' &&
      typeof window.ethereum !== 'undefined'
    ) {
      try {
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        setAddress(accounts[0])
        setButtonMsg('Post Message')
        setConnected(true)
      } catch (err) {
        setErrMessage(err.message)
      }
    } else {
      setAddress('Not Connected')
      setConnected(false)
      setErrMessage('No Metamask.')
    }
  }

  const onPost = async () => {
    setErrMessage('')
    setBool(true)
    setButtonMsg('Sign message...')
    if (window.ethereum.networkVersion == '4') {
      if (message != '') {
        try {
          let nonce = await ethersProvider.getTransactionCount(selectedAddress)
          const tx = await contractt.postMessages(message, {
            gasPrice: 2000000,
            gasLimit: 200000,
            nonce,
          })
          setButtonMsg('Posting...')
          await tx.wait()
          setMessage('')
          setButtonMsg('Post message')
          setBool(false)
          Router.push('/')
        } catch (err) {
          console.log(err.message)
          setErrMessage(
            'Message Signature: User denied message signature. Try Again.',
          )
          setBool(false)
          setButtonMsg('Post message')
        }
      } else {
        setErrMessage('You cannot post empty message.')
        setButtonMsg('Post message')
        setBool(false)
      }
    } else {
      setErrMessage('Please change to Rinkeby Test network.')
      setButtonMsg('Post message')
      setBool(false)
    }
  }

  return (
    <>
      <div className="flex flex-col items-center pt-20 pb-10">
        <span className="text-xl font-bold text-center italic pb-2 underline sm:text-3xl md:text-4xl">
          Message For All Blockchain Users.
        </span>
        <span className="pb-8 text-center">
          {address.length > 40
            ? address.slice(0, 6) + '...' + address.slice(37, 42)
            : address}{' '}
          - <span className="font-semibold">Gasless Transaction</span>
        </span>
        <span className="font-semibold pb-7 px-7 text-center">
          [ {contractMessage} ]
        </span>
        <input
          hidden={!connected}
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          className="border-0 border-b-2 border-stone-400 w-4/5 bg-transparent rounded-br-sm rounded-bl-sm pb-1 focus:outline-none"
          placeholder=" Post your message..."
        />

        {connected ? (
          <button
            disabled={bool}
            onClick={onPost}
            className="bg-blue-500 text-white rounded-lg font-semibold my-5 py-3 w-4/5 sm:text-xl"
          >
            {buttonMsg}
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="bg-blue-500 text-white rounded-lg font-semibold my-5 py-3 w-4/5 sm:text-xl"
          >
            {buttonMsg}
          </button>
        )}

        {errMessage ? (
          <div className="rounded-md border-2 border-red-700 bg-red-100 text-red-700 w-4/5 p-4">
            <span className="font-semibold text-xl">Oops!</span> <br />
            {errMessage}
          </div>
        ) : null}
      </div>
    </>
  )
}

