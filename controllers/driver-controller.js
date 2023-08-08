const Booking = require('../models/Booking');
const Driver = require('../models/Driver');

module.exports = {

    scanBooking: async (req, res) => {
      try {
          const driverID = req.params.driverID;
          const bookingID = req.params.bookingID;
          const passengerID = req.params.passengerID;
      
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
      
          const passenger = booking.passengers.find(p => p._id === passengerID);

          if (!passenger) {
              return res.status(404).json("Passenger not found.");
          }
          
          if (passenger.isScanned) {
              return res.status(410).json("Bileta është skenuar më parë.");
          }
          
          let isLineMatched = false;
          for (const line of driver.lines) {
            if (line === booking.ticket.lineCode) {
              isLineMatched = true;
              break;
            }
          }
      
          if (!isLineMatched) {
            return res.status(400).json(
              `Linja e biletës (${booking.ticket.lineCode.code}) nuk përputhet me linjën e shoferit. Ju lutemi verifikoni nëse keni hypur në autobusin e duhur.`,
            );
          } else {
            if (!passenger) {
                return res.status(404).json("Passenger not found.");
            }
            
            await Booking.updateOne(
                { _id: bookingID, "passenger._id": passengerID },
                { $set: { "passenger.$.isScanned": true } }
            );
            
            await Driver.findByIdAndUpdate(driverID, { $push: { scannedBookings: bookingID } });
            
            return res.status(200).json("Ticket successfully scanned.");
            
          }
        } catch (error) {
          console.log(error)
          requestInProgress = false; 
          res.status(500).json("Gabim i brendshëm i serverit.");
        }
    },

}

