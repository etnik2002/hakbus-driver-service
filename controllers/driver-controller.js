const Booking = require('../models/Booking');
const Driver = require('../models/Driver');

module.exports = {
  scanBooking: async (req, res) => {
    try {
      const driverID = req.params.driverID;
      const bookingID = req.params.bookingID;
      const passengerID = req.params.passengerID;

      if (!mongoose.Types.ObjectId.isValid(bookingID)) {
        return res.status(404).json("Rezervimi nuk u gjet! Ju lutemi provoni perseri!");
      }

      const driver = await Driver.findById(driverID).populate('lines');
      const booking = await Booking.findById(bookingID).populate({
        path: 'ticket',
        populate: {
          path: 'lineCode',
        },
      });

      if (!booking) {
        return res.status(401).json("Rezervimi eshte anuluar ose nuk egziston!");
      }

      console.log(booking)
      if (!driver) {
        return res.status(401).json("Ju nuk jeni i autorizuar për të skenuar këtë biletë.");
      }

      const passengerIndex = booking.passengers.findIndex(p => p._id.equals(new mongoose.Types.ObjectId(passengerID)));
      if (passengerIndex === -1) {
        return res.status(404).json("Passenger not found.");
      }

      if (booking.passengers[passengerIndex].isScanned) {
        return res.status(410).json("Bileta është skenuar më parë.");
      }

      let isLineMatched = driver.lines.some(line => line._id.equals(booking.ticket.lineCode._id));

      if (!isLineMatched) {
        return res.status(400).json(
          `Linja e biletës (${booking.ticket.lineCode.code}) nuk përputhet me linjën e shoferit. Ju lutemi verifikoni nëse keni hypur në autobusin e duhur.`,
        );
      } else {
        try {
          const hasScannedThis = driver.scannedBookings.some((passenger) => passenger._id.equals(new mongoose.Types.ObjectId(passengerID)))
          if(!hasScannedThis) {
            await Driver.findByIdAndUpdate(driverID, { $push: { scannedBookings: bookingID } });
          }
          
          booking.passengers[passengerIndex].isScanned = true;
          await booking.save();
          
          return res.status(200).json("Ticket successfully scanned.");
        } catch (error) {
          console.error("Error updating booking:", error);
          return res.status(500).json("Internal server error.");
        }
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json("Gabim i brendshëm i serverit.");
    }
  },

}

