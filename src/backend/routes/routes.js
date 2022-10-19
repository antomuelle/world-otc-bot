import { Router } from "express"

const router = Router()

router.get('/local', (req, res)=> { res.send('que hondaa bro') })

export default router