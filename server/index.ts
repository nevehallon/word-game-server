require('dotenv').config();
import express from 'express';
import { useMiddleWares } from './middlewares';

const app = useMiddleWares(express());

const PORT = process.env.PORT || 80
app.listen(
	PORT,
	() => console.log(`Working on port ${PORT}`)
);
