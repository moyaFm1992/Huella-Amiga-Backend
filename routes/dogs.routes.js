const express = require('express');
const router = express.Router();
const dogsController = require('../controllers/dogs.controller');
const upload = require('../middlewares/upload.middleware');

router.post('/',  dogsController.createDog);
router.get('/', dogsController.getDogs);
router.get('/nearby', dogsController.getNearbyDogs);
router.get('/:id', dogsController.getDog);
router.get('/desc/:description', dogsController.getDesc);
router.put('/status/:id', dogsController.changeDogStatus);

module.exports = router;