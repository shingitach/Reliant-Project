function calculate_days(date1, date2) {
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var    numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return numberOfDays;
}

function calculate_total(numberOfDays, sqlConnection) {
    sqlConnection.query("SELECT price FROM roomtypes WHERE room_id = ?", [roomTypeId], function (err, result) {
        if (err) throw err;
        AMOUNT = result[0].price * numberOfDays;     
    })
   
    return booking_amount;
}
