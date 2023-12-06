import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [jokes,setjokes] = useState([])
  axios.get('/colors')
  .then(
    (response)=>{
      setjokes(response.data)
    }
  )
  .catch((error)=>{
    console.log(error)
  })

  return (
    <>
      
        <div>
          Backend
          <h3>{jokes.length}</h3>
          {
            jokes.map((joke,index)=>(
              <h2>{joke.color}, {joke.value}</h2>
            ))
          
          }
          
        </div>
    </>
  )
}

export default App
