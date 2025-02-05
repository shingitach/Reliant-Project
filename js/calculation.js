function validateCheckinDate(value) {
    const checkinDate = new Date(value);
    const today = new Date();
    if (checkinDate < today)  {
        alert('Check-in date must not be less than today or check out ');
        document.getElementById('checkinDate').value = '';
    }
}
 
function validateCheckoutDate(value) {
    const checkinDate = new Date(document.getElementById('checkinDate').value);
    const checkoutDate = new Date(value);
    if (checkoutDate < checkinDate) {
        alert('Check-out date must not be less than check-in date');
        document.getElementById('checkoutDate').value = '';
    }
}
 
function calculateNumberOfDays() {
   
    const checkinDate = new Date(document.getElementById('checkinDate').value);
    const checkoutDate = new Date(document.getElementById('checkoutDate').value);
        if (checkinDate && checkoutDate) {
        const timeDifference = checkoutDate - checkinDate;
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        document.getElementById('numberOfDays').value = daysDifference > 0 ? daysDifference : '';
    }
}
 
function calculateAmount() {

    var roomType = document.getElementById('roomType').value;
    const roomRates = JSON.parse( localStorage.getItem('roomRates') || '{}');
    let pricePerDay =  roomRates[roomType]; 
    const numberOfDays = document.getElementById('numberOfDays').value;
    //    let pricePerDay = 0;
    if (numberOfDays > 0) {
    // Example pricing logic based on room type
    // let pricePerDay = 0;
    // if (roomType === 'single') {
    //     //pricePerDay = 100; // Example price for single room
    //    results
    //     pricePerDay = results[0].price;
    // } else if (roomType === 'double') {
    //     //pricePerDay = 150; // Example price for double room
   
    //     pricePerDay = results[0].price;
    // } else if (roomType === 'suite') {
    //     //pricePerDay = 200; // Example price for suite
     
    //     pricePerDay = results[0].price;
    // }
 
    const totalAmount = pricePerDay * numberOfDays;
    document.getElementById('Amount').value = totalAmount > 0 ? totalAmount : '';
    }
}
