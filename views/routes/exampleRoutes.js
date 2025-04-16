import express from 'express';
import * as exampleController from '../controllers/exampleController.js';

const router = express.Router();

router.get('/', exampleController.home);
router.post('/lookup', exampleController.lookup);
router.post('/watchMovie', exampleController.watch);
router.post('/watchAgain', exampleController.watchAgain);
router.post('/delete', exampleController.deleteMovie);
router.post('/rateMovie', exampleController.rateMovie);
router.get('/displayMovie', exampleController.lookup);
router.get('/sort', exampleController.sortMovies);


export default router;