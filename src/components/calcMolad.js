//
// Molad Calculator
// by Jonah Eliyahu Lawrence, TorahCalc.com
// (c) 2017 TorahCalc.com, All Rights Reserved.
// Date conversion based on code by Hebcal
// 
//

var currYear = 5779;


function calcMolad(HebrewYear, HebrewMonth) {

    if (HebrewYear < 0) {
        HebrewYear = Math.abs(HebrewYear);
    } else if (HebrewYear === 0) {
        HebrewYear = "";
    }
    var year = parseInt(HebrewYear);
    if (isNaN(year)) {
        year = currYear
    }
    var month = parseInt(HebrewMonth);
    var moladInterval = 7654330000 / 3;
    var dMoladTishrei5776 = 1442185650000;
    var dNewMolad = dMoladTishrei5776;

    if (year > 5776) {
        for (var i = 5776; i < year; i++) {
            if (((7 * i) + 1) % 19 < 7) {
                dNewMolad += (13 * moladInterval);
            } else {
                dNewMolad += (12 * moladInterval);
            }
        }
    } else if (year < 5776) {
        for (var j = 5775; year < j; j--) {
            if (((7 * j) + 1) % 19 < 7) {
                dNewMolad -= (13 * moladInterval);
            } else {
                dNewMolad -= (12 * moladInterval);
            }
        }
        dNewMolad -= (12 * moladInterval);
        if (((7 * year) + 1) % 19 < 7) {
            dNewMolad -= moladInterval;
        }
    }
    dNewMolad += ((month - 1) * moladInterval);
    var fNewMolad = new Date(dNewMolad);
    var tzFix = 360 - fNewMolad.getTimezoneOffset();
    fNewMolad.setMinutes(fNewMolad.getMinutes() - tzFix);
    var chalakim = Math.round((fNewMolad.getSeconds()) / (3.3));
    if (chalakim === 18) {
        chalakim = 0;
        fNewMolad.setTime(fNewMolad.getTime() + 1000 * 60);
    }
    return fNewMolad;
}

export default calcMolad ;
