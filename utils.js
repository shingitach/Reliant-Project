export function getRoomPricesPerDay(conn) {
    const roomTypeAndPrice = {};
    const query = 'SELECT room_type, price from roomtypes';
    const result = conn.query(query, (err, results) => {
        console.log(results);
        if (err) {
            console.error('Error executing query: ' + err.message);
        } 
        console.log(results);
        results.forEach(result => {
            roomTypeAndPrice[result.room_type] = result.price;
        })
    });
    console.log("roomTypeAndPrice>>>",roomTypeAndPrice);
    return roomTypeAndPrice;
}