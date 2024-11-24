import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import movieRouter from './routers/movieRouter.js'
import genreRouter from './routers/genreRouter.js'
import userRouter from './routers/userRouter.js'
import groupRouter from './routers/groupRouter.js'
import favoriteRouter from './routers/favoriteRouter.js'
import reviewRouter from './routers/reviewRouter.js'
import customRouter from './routers/customRouter.js'
import showsRouter from './routers/showsRouter.js'

dotenv.config();

const port = process.env.PORT

const app = express()
app.use(cors({ origin: 'http://localhost:3000' }))

app.use(express.json())
app.use('/api/movies', movieRouter);
app.use('/api/genres', genreRouter);
app.use('/users', userRouter);
app.use('/groups', groupRouter);
app.use('/favorites', favoriteRouter);
app.use('/review', reviewRouter);
app.use('/custom', customRouter);
app.use('/areas', showsRouter);

app.use((err,req,res,next) => {
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({error: err.message})
})

app.listen(port);