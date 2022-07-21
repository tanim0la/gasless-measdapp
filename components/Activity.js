import React, { useState, useEffect, useRef } from 'react'
import contract from '../ethereum/contract'

function Activity() {
  const [activities, setActivities] = useState([])

  let a = useRef([])
  useEffect(() => {
    ab()
  }, [])

  const ab = async () => {
    const addresses = await contract.getAddresses()

    for (let i = 0; i < addresses.length; i++) {
      const getMsg = await contract.users(addresses[i])
      a.current[i] = [addresses[i], getMsg]
    }
    setActivities(a.current)

    if (activities) {
    }
    contract.on('newMessages', async (addy, _message) => {
      const getMsg = await contract.users(addy)

      for (let i = 0; i < activities.length; i++) {
        let item = activities[i]
        if (item[0] == addy) {
          let c = activities.splice(i, i + 1)
          setActivities(c)
        }
      }
      setActivities((arr) => [...arr, [addy, getMsg]])
    })
  }

  const getActivites = () => {
    if (activities.length > 10) {
      let num = activities.length - 10
      let b = activities.slice(num)
      setActivities(b)
    }
    const newActivities = activities.reverse()
    const item = newActivities.map((activity, index) => {
      return (
        <div
          key={index}
          className="bg-gray-100 rounded-r-lg border-l-4 border-blue-600 mb-2 p-1 max-h-full w-full"
        >
          <span className="text-sm font-semibold sm:text-base md:text-lg">
            {activity[0]}
          </span>
          <br />
          <span className="text-sm sm:text-base md:text-lg">{activity[1]}</span>
        </div>
      )
    })

    return item
  }

  return (
    <div>
      <div className="text-center text-xl underline italic font-semibold pb-3 sm:text-2xl md:text-3xl">
        activities
      </div>
      <div>
        {activities.length > 3 ? (
          getActivites()
        ) : (
          <div className="text-center">[ loading messages... ]</div>
        )}
      </div>
    </div>
  )
}

export default Activity
