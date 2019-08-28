function isLeapYear(yearAsNumber) {
    switch (yearAsNumber % 19) {
        case 0: case 3: case 6: case 8:
        case 11: case 14: case 17: return 1;
        default: return 0
    }
}

function formatRFC(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month <= 9) {
        month = "0" + month;
    }
    var day = date.getDate();
    if (day <= 9) {
        day = "0" + day;
    }
    var hours = date.getHours();
    if (hours <= 9) {
        hours = "0" + hours;
    }
    var minutes = date.getMinutes();
    if (minutes <= 9) {
        minutes = "0" + minutes;
    }
    var seconds = date.getSeconds();
    if (seconds <= 9) {
        seconds = "0" + seconds;
    }
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function numMonthsInYear(year){
    if (isLeapYear(year)) return 13;
    return 12;
}
function getTransformedMonth(hdate){
    //returns in format the calcMolad function likes, it has diff numbering scheme for months
    // var HebrewMonthTextArr = ["Tishrei", "Cheshvan", "Kislev", "Teves", "Sh'vat", "Adar", "Adar I", "Adar II", "Nisan", "Iyyar", "Sivan", "Tamuz", "Av", "Elul"]
    var retMonth;
    var hMonth = hdate.month;
    var hYear = hdate.year;
    const isLY = isLeapYear(hYear);
    switch(hMonth){
        case 1: //Nissan
            retMonth = isLY ? 7 : 6;
            break;
        case 2: //Iyar
            retMonth = isLY ? 8 : 7;
            break;
        case 3: //Sivan
            retMonth = isLY ? 9 : 8;
            break;
        case 4: //Tamuz
            retMonth = isLY ? 10: 9;
            break;
        case 5: //Av
            retMonth = isLY ? 11 : 10;
            break;
        case 6: //Elul
            retMonth = isLY ? 12 : 11;
            break;
        case 7: //Tishrei
            retMonth = 0;
            break; //year needs to change???
        case 8: //Cheshvan
            retMonth = 1;
            break;
        case 9: //Kislev
            retMonth = 2;
            break;
        case 10: //Teves
            retMonth = 3;
            break;
        case 11: //Shvat
            retMonth = 4;
            break;
        case 12: //Adar/Adar I
            retMonth = 5;
            break;
        case 13: //Adar II
            retMonth = 6;
            break;
        default: return null;
    }
    return retMonth;
}

function RFCToDateObj(moladInLocalTime) {
    var [date, time] = moladInLocalTime.split(" ");
    var [year, month, day] = date.split("-");
    var [hours, minutes, seconds] = time.split(":");
    return new Date(year, month - 1, day, hours, minutes, seconds);
}

export { isLeapYear, formatRFC, getTransformedMonth, RFCToDateObj, numMonthsInYear };