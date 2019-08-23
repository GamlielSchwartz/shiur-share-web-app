/* eslint-disable default-case */
//
// Molad Calculator
// by Jonah Eliyahu Lawrence, TorahCalc.com
// (c) 2017 TorahCalc.com, All Rights Reserved.
// Date conversion based on code by Hebcal
// 
// Suncalc (c) 2011-2015, Vladimir Agafonkin
// SunCalc is a JavaScript library for calculating sun/moon position and light phases.
// https://github.com/mourner/suncalc
//

var HebrewMonthTextArr = ["Tishrei", "Cheshvan", "Kislev", "Teves", "Shevat", "Adar", "Adar I", "Adar II", "Nissan", "Iyar", "Sivan", "Tammuz", "Av", "Elul"]
// var HebrewYear = 5779;
// var HebrewMonth = 8;
var currYear = 5779;

function G2H(e, t, a) {
    var n;
    // e = Number(e), t = Number(t), a = Number(a), n = new Date(e, t - 1, a);
    new Array;
    return GregToHeb(n).split("/")
}

function Tishrei1(e) {
    var t, a, n, r, o, d;
    return a = 793 * (t = MonSinceFirstMolad(e)), a += 204, n = Math.floor(a / 1080), a %= 1080, n += 12 * t, n += 5, r = Math.floor(n / 24), n %= 24, r += 29 * t, o = (r += 2) % 7, !IsLeapYear(e) && 3 == o && 1080 * n + a >= 9924 ? (o = 5, r += 2) : IsLeapYear(e - 1) && 2 == o && 1080 * n + a >= 16789 ? (o = 3, r += 1) : (n >= 18 && (o += 1, o %= 7, r += 1), 1 != o && 4 != o && 6 != o || (o += 1, o %= 7, r += 1)), r -= 2067025, (d = new Date(1900, 0, 1)).setDate(d.getDate() + r), d
}

function MonSinceFirstMolad(e) {
    var t;
    return e--, t = 235 * Math.floor(e / 19), t += 12 * (e %= 19), e >= 17 ? t += 6 : e >= 14 ? t += 5 : e >= 11 ? t += 4 : e >= 8 ? t += 3 : e >= 6 ? t += 2 : e >= 3 && (t += 1), t
}

function SameDate(e, t) {
    return e.getFullYear() == t.getFullYear() && e.getMonth() == t.getMonth() && e.getDate() == t.getDate()
}

function LengthOfYear(e) {
    var t, a;
    return t = Tishrei1(e), a = (Tishrei1(e + 1) - t) / 864e5, Math.round(a)
}

function GregToHeb(e) {
    var t, a, n, r, o, d, u, m, i, l, s, c, h = new Date(1900, 0, 1);
    if (r = (29.5 + 793 / 25920) * (235 / 19), o = Math.round((e - h) / 864e5), o += 2067025, SameDate(d = Tishrei1(t = Math.floor(o / r) + 1), e)){
        a = 1;
        n = 1;
    }
    else {
        if (d < e)
            for (; Tishrei1(t + 1) <= e;) t += 1;
        else
            for (t -= 1; Tishrei1(t) > e;) t -= 1;
        o = (e - Tishrei1(t)) / 864e5
        o = Math.round(o)
        i = 353 == (u = LengthOfYear(t)) || 383 == u
        l = 355 == u || 385 == u
        m = IsLeapYear(t)
        a = 1;
        do {
            switch (a) {
                case 1:
                case 5:
                case 6:
                case 8:
                case 10:
                case 12:
                    s = 30;
                    break;
                case 4:
                case 7:
                case 9:
                case 11:
                case 13:
                    s = 29;
                    break;
                case 6:
                    s = 30;
                    break;
                case 2:
                    s = l ? 30 : 29;
                    break;
                case 3:
                    s = i ? 29 : 30
            }
            if (o >= s){
                c = !0
                if(m || 5 != a) {
                    a++ 
                }
                else{
                    a += 2
                    o -= s
                } 
            } else {
                c = !1
            }
        } while (c);
        n = o + 1
    }
    return a + "/" + n + "/" + t
}

function IsLeapYear(e) {
    var t;
    return 3 == (t = e % 19) || 6 == t || 8 == t || 11 == t || 14 == t || 17 == t || 0 == t
}

function getSunCalc(){

    'use strict';
    var PI = Math.PI,
        sin = Math.sin,
        cos = Math.cos,
        tan = Math.tan,
        asin = Math.asin,
        atan = Math.atan2,
        acos = Math.acos,
        rad = PI / 180;
    var dayMs = 1000 * 60 * 60 * 24,
        J1970 = 2440588,
        J2000 = 2451545;

    function toJulian(date) {
        return date.valueOf() / dayMs - 0.5 + J1970
    }

    function fromJulian(j) {
        return new Date((j + 0.5 - J1970) * dayMs)
    }

    function toDays(date) {
        return toJulian(date) - J2000
    }
    var e = rad * 23.4397;

    function rightAscension(l, b) {
        return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l))
    }

    function declination(l, b) {
        return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l))
    }

    function azimuth(H, phi, dec) {
        return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi))
    }

    function altitude(H, phi, dec) {
        return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H))
    }

    function siderealTime(d, lw) {
        return rad * (280.16 + 360.9856235 * d) - lw
    }

    function astroRefraction(h) {
        if (h < 0)
            h = 0;
        return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179))
    }

    function solarMeanAnomaly(d) {
        return rad * (357.5291 + 0.98560028 * d)
    }

    function eclipticLongitude(M) {
        var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)),
            P = rad * 102.9372;
        return M + C + P + PI
    }

    function sunCoords(d) {
        var M = solarMeanAnomaly(d),
            L = eclipticLongitude(M);
        return {
            dec: declination(L, 0),
            ra: rightAscension(L, 0)
        }
    }
    var SunCalc = {};
    SunCalc.getPosition = function(date, lat, lng) {
        var lw = rad * -lng,
            phi = rad * lat,
            d = toDays(date),
            c = sunCoords(d),
            H = siderealTime(d, lw) - c.ra;
        return {
            azimuth: azimuth(H, phi, c.dec),
            altitude: altitude(H, phi, c.dec)
        }
    };
    var times = SunCalc.times = [
        [-0.833, 'sunrise', 'sunset'],
        [-0.3, 'sunriseEnd', 'sunsetStart'],
        [-6, 'dawn', 'dusk'],
        [-12, 'nauticalDawn', 'nauticalDusk'],
        [-18, 'nightEnd', 'night'],
        [6, 'goldenHourEnd', 'goldenHour']
    ];
    SunCalc.addTime = function(angle, riseName, setName) {
        times.push([angle, riseName, setName])
    };
    var J0 = 0.0009;

    function julianCycle(d, lw) {
        return Math.round(d - J0 - lw / (2 * PI))
    }

    function approxTransit(Ht, lw, n) {
        return J0 + (Ht + lw) / (2 * PI) + n
    }

    function solarTransitJ(ds, M, L) {
        return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L)
    }

    function hourAngle(h, phi, d) {
        return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)))
    }

    function getSetJ(h, lw, phi, dec, n, M, L) {
        var w = hourAngle(h, phi, dec),
            a = approxTransit(w, lw, n);
        return solarTransitJ(a, M, L)
    }
    SunCalc.getTimes = function(date, lat, lng) {
        var lw = rad * -lng,
            phi = rad * lat,
            d = toDays(date),
            n = julianCycle(d, lw),
            ds = approxTransit(0, lw, n),
            M = solarMeanAnomaly(ds),
            L = eclipticLongitude(M),
            dec = declination(L, 0),
            Jnoon = solarTransitJ(ds, M, L),
            i, len, time, Jset, Jrise;
        var result = {
            solarNoon: fromJulian(Jnoon),
            nadir: fromJulian(Jnoon - 0.5)
        };
        for (i = 0, len = times.length; i < len; i += 1) {
            time = times[i];
            Jset = getSetJ(time[0] * rad, lw, phi, dec, n, M, L);
            Jrise = Jnoon - (Jset - Jnoon);
            result[time[1]] = fromJulian(Jrise);
            result[time[2]] = fromJulian(Jset)
        }
        return result
    };

    function moonCoords(d) {
        var L = rad * (218.316 + 13.176396 * d),
            M = rad * (134.963 + 13.064993 * d),
            F = rad * (93.272 + 13.229350 * d),
            l = L + rad * 6.289 * sin(M),
            b = rad * 5.128 * sin(F),
            dt = 385001 - 20905 * cos(M);
        return {
            ra: rightAscension(l, b),
            dec: declination(l, b),
            dist: dt
        }
    }
    SunCalc.getMoonPosition = function(date, lat, lng) {
        var lw = rad * -lng,
            phi = rad * lat,
            d = toDays(date),
            c = moonCoords(d),
            H = siderealTime(d, lw) - c.ra,
            h = altitude(H, phi, c.dec),
            pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));
        h = h + astroRefraction(h);
        return {
            azimuth: azimuth(H, phi, c.dec),
            altitude: h,
            distance: c.dist,
            parallacticAngle: pa
        }
    };
    SunCalc.getMoonIllumination = function(date) {
        var d = toDays(date || new Date()),
            s = sunCoords(d),
            m = moonCoords(d),
            sdist = 149598000,
            phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
            inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
            angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) - cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));
        return {
            fraction: (1 + cos(inc)) / 2,
            phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
            angle: angle
        }
    };

    function hoursLater(date, h) {
        return new Date(date.valueOf() + h * dayMs / 24)
    }
    SunCalc.getMoonTimes = function(date, lat, lng, inUTC) {
        var t = new Date(date);
        if (inUTC) t.setUTCHours(0, 0, 0, 0);
        else t.setHours(0, 0, 0, 0);
        var hc = 0.133 * rad,
            h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
            h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;
        for (var i = 1; i <= 24; i += 2) {
            h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
            h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;
            a = (h0 + h2) / 2 - h1;
            b = (h2 - h0) / 2;
            xe = -b / (2 * a);
            ye = (a * xe + b) * xe + h1;
            d = b * b - 4 * a * h1;
            roots = 0;
            if (d >= 0) {
                dx = Math.sqrt(d) / (Math.abs(a) * 2);
                x1 = xe - dx;
                x2 = xe + dx;
                if (Math.abs(x1) <= 1) roots++;
                if (Math.abs(x2) <= 1) roots++;
                if (x1 < -1) x1 = x2
            }
            if (roots === 1) {
                if (h0 < 0) rise = i + x1;
                else set = i + x1
            } else if (roots === 2) {
                rise = i + (ye < 0 ? x2 : x1);
                set = i + (ye < 0 ? x1 : x2)
            }
            if (rise && set) break;
            h0 = h2
        }
        var result = {};
        if (rise) result.rise = hoursLater(t, rise);
        if (set) result.set = hoursLater(t, set);
        if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = !0;
        return result
    };
    return SunCalc;
}

function calcMolad(HebrewYear, HebrewMonth) {

    var SunCalc = getSunCalc();
    if (HebrewYear < 0) {
        HebrewYear = Math.abs(HebrewYear);
    } else if (HebrewYear == 0) {
        HebrewYear = "";
    }
    var year = parseInt(HebrewYear);
    if (isNaN(year)) {
        year = currYear
    }
    var month = parseInt(HebrewMonth);
    var AdarI = 0;
    if (month == 6) {
        if (((7 * year) + 1) % 19 < 7) {
            AdarI = 1
        }
    } else if (month == 7) {
        if (((7 * year) + 1) % 19 >= 7) {
            month = 6
        }
    } else if (month == 14) {
        if (((7 * year) + 1) % 19 < 7) {
            month = 6;
            AdarI = 1
        } else {
            month = 6
        }
    } else if (month > 7) {
        if (((7 * year) + 1) % 19 >= 7) {
            month--
        }
    }
    var moladInterval = 7654330000 / 3;
    var dMoladTishrei5776 = 1442185650000;
    var dNewMolad = dMoladTishrei5776;

    if (year > 5776) {
        for (i = 5776; i < year; i++) {
            if (((7 * i) + 1) % 19 < 7) {
                dNewMolad += (13 * moladInterval);
            } else {
                dNewMolad += (12 * moladInterval);
            }
        }
    } else if (year < 5776) {
        for (var i = 5775; year < i; i--) {
            if (((7 * i) + 1) % 19 < 7) {
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
    var sunset = SunCalc.getTimes(fNewMolad, 31.7683, 35.2137).sunset;
    var chalakim = Math.round((fNewMolad.getSeconds()) / (3.3));
    if (chalakim == 18) {
        chalakim = 0;
        fNewMolad.setTime(fNewMolad.getTime() + 1000 * 60);
    }

    if (month < 7) {
        if (AdarI == 1) {
            month = HebrewMonthTextArr[month]
        } else {
            month = HebrewMonthTextArr[month - 1]
        }
    } else {
        if (((7 * year) + 1) % 19 < 7) {
            month = HebrewMonthTextArr[month]
        } else {
            month = HebrewMonthTextArr[month + 1]
        }
    }
    var moladResult1 = "The time of the molad of " + month + " " + year + " is:<br/>";
    var moladResult2 = "· "
    var TimeFormat12 = true; //I ADDED THIS BC DIDN"T KNOW WHERE THIS BOOL CAME FROM
    return fNewMolad;
    // if (TimeFormat12) {
    //     moladResult2 += moment(fNewMolad).format('dddd, MMMM D, YYYY, h:mm a')
    // } else if (!TimeFormat12) {
    //     moladResult2 += moment(fNewMolad).format('dddd, MMMM D, YYYY, HH:mm')
    // }
    // moladResult2 += " and " + chalakim;
    // moladResult2 += chalakim == 1 ? " chelek.</br>· " : " chalakim.</br>· ";
    // // var afterSunset = ((sunset.getHours() + (2 - (new Date().getTimezoneOffset()) / (-60))) + (sunset.getMinutes() / 60) < fNewMolad.getHours() + (fNewMolad.getMinutes() / 60));
    // moladResult2 += (G2H(fNewMolad.getFullYear(), fNewMolad.getMonth() + 1, fNewMolad.getDate())[1]) + ", ";
    // if (TimeFormat12) {
    //     moladResult2 += moment(fNewMolad).format('h:mm a')
    // } else if (!TimeFormat12) {
    //     moladResult2 += moment(fNewMolad).format('HH:mm')
    // }
    // moladResult2 += " and " + chalakim;
    // moladResult2 += chalakim == 1 ? " chelek.</br>· " : " chalakim.</br>· ";
    // moladResult2 += moment(fNewMolad).format('dddd ');
    // moladResult2 += fNewMolad.getHours() < 12 ? "morning, " : ((sunset.getHours() + (2 - (new Date().getTimezoneOffset()) / (-60))) + (sunset.getMinutes() / 60) < fNewMolad.getHours() + (fNewMolad.getMinutes() / 60)) ? "evening, " : "afternoon, ";
    // moladResult2 += moment(fNewMolad).format('m ') + "minutes and " + chalakim;
    // moladResult2 += chalakim == 1 ? " chelek after " : " chalakim after ";
    // if (TimeFormat12) {
    //     moladResult2 += moment(fNewMolad).format('h:00 a')
    // } else if (!TimeFormat12) {
    //     moladResult2 += moment(fNewMolad).format('HH:00')
    // }
    // moladResult2 += ".<br/>";
    // return [moladResult1, moladResult2];
}

export default calcMolad ;
