import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { RelayProvider } from '@opengsn/provider'
import contract from '../ethereum/contract'
import { useRouter } from 'next/router'

export default function Message() {
  let accounts
  const [address, setAddress] = useState('Not Connected')
  const [message, setMessage] = useState('')
  const [contractMessage, setContractMessage] = useState('loading...')
  const [errMessage, setErrMessage] = useState('')
  const [buttonMsg, setButtonMsg] = useState('')
  const [connected, setConnected] = useState(false)

  const Router = useRouter()

  const conf = {
    ourContract: '0xb836B5Ba2c9165afFf31fC39049Fbf42E58e2043',
    paymaster: '0xd60B427947bD86cb186C7Ea432b062A8b26Cf50e',
  }

  useEffect(() => {
    const onConnect = async () => {
      accounts = await ethereum.request({
        method: 'eth_accounts',
      })

      if (accounts[0]) {
        setAddress(accounts[0])
        setButtonMsg('Post Message')
        setConnected(true)
      } else {
        setAddress('Not Connected')
        setButtonMsg('Connect Wallet')
        setConnected(false)
      }
    }

    try {
      onConnect()
    } catch (err) {
      setErrMessage(err.message)
    }
  }, [address])

  useEffect(() => {
    const Message = async () => {
      const cMessage = await contract.message()
      setContractMessage(cMessage)

      contract.on('newMessages', (addy, _message) => {
        setContractMessage(_message)
      })
    }
    try {
      Message()
    } catch (err) {
      setErrMessage(err.message)
    }
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
    setButtonMsg('Sign message...')
    if (window.ethereum.networkVersion == '4') {
      try {
        const gsnProvider = await RelayProvider.newProvider({
          provider: window.ethereum,
          config: {
            paymasterAddress: conf.paymaster,
          },
        }).init()

        const compiledMessageV4 = require('../ethereum/Message.json')
        const provider = new ethers.providers.Web3Provider(gsnProvider)

        const contractt = new ethers.Contract(
          conf.ourContract,
          compiledMessageV4.abi,
          provider.getSigner(),
        )
        const tx = await contractt.postMessages(message)
        setButtonMsg('Posting...')
        await tx.wait()
        setMessage('')
        setButtonMsg('Post message')

        Router.push('/')
      } catch (err) {
        console.log(err.message)
        setErrMessage('Message Signature: User denied message signature.')
        setButtonMsg('Post message')
      }
    } else {
      setErrMessage('Please change to Rinkeby Test network.')
      setButtonMsg('Post message')
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
