const router = require("express").Router();
const { scanBooking } = require("../controllers/driver-controller");

router.post('/scan/:bookingID/:driverID', scanBooking);

module.exports = router;