import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { analyzeBrandRoute } from './routes/analyze.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.post('/api/analyze-brand', analyzeBrandRoute)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
