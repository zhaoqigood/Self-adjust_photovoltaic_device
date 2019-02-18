function compute() {
    // if (CheckInputs()) {
        var f = document.theForm;
        // constants
        var degreesToRadians = 3.1416 / 180.0000;
        var radiansToDegrees = 180.0000 / 3.1416;
        var feetToMeters = 1.0000 / 3.2800;
        var degreeMinutesToDecimal = 1.0000 / 60.0000;
        var degreeSecondsToDecimal = 1.0000 / 3600.0000;
        // retrieve input values
        var inputLongitude = f.inputLongitude.value;
        var inputEastWest = f.inputEastWest.options[f.inputEastWest.selectedIndex].text;
        var inputLatitude = f.inputLatitude.value;
        var inputNorthSouth = f.inputNorthSouth.options[f.inputNorthSouth.selectedIndex].text;
        var inputElevation = f.inputElevation.value;
        var inputFeetMeters = f.inputFeetMeters.options[f.inputFeetMeters.selectedIndex].text;
        var inputMonth = f.inputMonth.options[f.inputMonth.selectedIndex].text;
        var inputDate = f.inputDate.options[f.inputDate.selectedIndex].text - 0;
        var inputYear = f.inputYear.options[f.inputYear.selectedIndex].text - 0;
        var inputTime = f.inputTime.value;
        var inputAMPM = f.inputAMPM.options[f.inputAMPM.selectedIndex].text;
        var inputTimeFormat = f.inputTimeFormat.options[f.inputTimeFormat.selectedIndex].text;
        var inputTimeZone = f.inputTimeZone.options[f.inputTimeZone.selectedIndex].value - 0;
        var inputDaylight = f.inputDaylight.options[f.inputDaylight.selectedIndex].text;
        var inputZeroAzimuth = f.inputZeroAzimuth.options[f.inputZeroAzimuth.selectedIndex].value - 0;
        // convert longitude and latitude to decimal from DMS if necessary
        // if (inputLongitude.indexOf("d") != -1) {
        //     degMarker = inputLongitude.indexOf("d");
        //     minMarker = inputLongitude.indexOf("m");
        //     secMarker = inputLongitude.indexOf("s");
        //     longitudeDeg = inputLongitude.substr(0, degMarker) - 0;
        //     longitudeMin = inputLongitude.substr(degMarker + 1, minMarker - degMarker - 1) - 0;
        //     longitudeSec = inputLongitude.substr(minMarker + 1, secMarker - minMarker - 1) - 0;
        //     inputLongitude = longitudeDeg + (longitudeMin * degreeMinutesToDecimal) + (longitudeSec * degreeSecondsToDecimal);
        // } else {
        //     inputLongitude -= 0;
        // }
        // if (inputLatitude.indexOf("d") != -1) {
        //     degMarker = inputLatitude.indexOf("d");
        //     minMarker = inputLatitude.indexOf("m");
        //     secMarker = inputLatitude.indexOf("s");
        //     LatitudeDeg = inputLatitude.substr(0, degMarker) - 0;
        //     LatitudeMin = inputLatitude.substr(degMarker + 1, minMarker - degMarker - 1) - 0;
        //     LatitudeSec = inputLatitude.substr(minMarker + 1, secMarker - minMarker - 1) - 0;
        //     inputLatitude = LatitudeDeg + (LatitudeMin * degreeMinutesToDecimal) + (LatitudeSec * degreeSecondsToDecimal);
        // } else {
        //     inputLatitude -= 0;
        // }
        // check validity of input values
        var validInputTime = true;
        // avoid math errors due to latitude or longitude = 0
        if ((inputLatitude == 0) && (f.inputLatitude.value.length > 0)) {
            inputLatitude = 0.000000001;
        }
        if ((inputLongitude == 0) && (f.inputLongitude.value.length > 0)) {
            inputLongitude = 0.000000001;
        }
        // check which input fields were filled in by user
        // var timeEntered = (inputTime != "");
        // var latitudeEntered = (inputLatitude != "");
        // var longitudeEntered = (inputLongitude != "");
        // convert input strings to numbers
        inputLatitude = inputLatitude - 0;
        inputLongitude = inputLongitude - 0;
        inputElevation = inputElevation - 0;
        // determine time formats
        var clockTimeInputMode = (inputTimeFormat == "时钟时");
        var lsotInputMode = (inputTimeFormat == "太阳时");
        // determine what's do-able
        var doableDeclination = true;
        var doableEOT = true;
        var doableClockTime = ((longitudeEntered || clockTimeInputMode) && timeEntered);
        var doableLSOT = ((longitudeEntered || lsotInputMode) && timeEntered);
        var doableHourAngle = (longitudeEntered && timeEntered);
        var doableSunRiseSet = (longitudeEntered && latitudeEntered);
        var doableAltitude = (longitudeEntered && timeEntered && latitudeEntered);
        var doableAzimuth = (longitudeEntered && timeEntered && latitudeEntered);
        // //////////// //
        // CALCULATIONS //
        // //////////// //
        // CONVERT UNITS
        // longitude east-west adjustment
        if (longitudeEntered) {
            var signedLongitude = inputLongitude;
            if (inputEastWest == "东") signedLongitude *= -1; // [0] = east, [1] = west
        }
        // latitude north-south adjustment
        if (latitudeEntered) {
            var signedLatitude = inputLatitude;
            if (inputNorthSouth == "南") signedLatitude *= -1; // [0] = north, [1] = south
        }
        // calculate daylight savings time adjustment
        var daylightAdjustment = 0;
        if (inputDaylight == "Yes") daylightAdjustment = 1;
        // convert elevation units if necessary
        if (inputFeetMeters == "feet") {
            inputElevation *= feetToMeters;
        }
        // set zero azimuth
        zeroAzimuth = inputZeroAzimuth;
        // local standard time meridian
        var meridian = inputTimeZone * -15;
        // CALCULATE TIMES
        // convert input time to hours after midnight
        if (validInputTime) {
            // ...remove semicolon from time string if necessary
            inputTime = RemoveSemicolon(inputTime);
            // ...parse time input string and get hours and minutes
            if (inputTime.length == 4) { // like "1234"
                timeHours = inputTime.substring(0, 2) - 0;
                timeMinutes = inputTime.substring(2, 4) - 0;
            } else { // like "123"
                timeHours = inputTime.substring(0, 1) - 0;
                timeMinutes = inputTime.substring(1, 3) - 0;
            }
            // ...adjust for AM/PM designation
            if ((inputAMPM == "上午") && (timeHours == 12)) timeHours = 0;
            if (inputAMPM == "下午") {
                if (timeHours != 12) timeHours += 12;
            }
            // ...calculate clock minutes after midnight
            var inputHoursAfterMidnight = timeHours + timeMinutes / 60.0;
            var inputMinutesAfterMidnight = timeHours * 60.0 + timeMinutes;
        }
        // calculate Universal Time
        var UT = 0.0;
        if (validInputTime) {
            UT = inputHoursAfterMidnight - inputTimeZone - daylightAdjustment;
        }
        var monthNum = (MonthStringToMonthNum(inputMonth)) - 0;
        if (monthNum > 2) {
            correctedYear = inputYear;
            correctedMonth = monthNum - 3;
        } else {
            correctedYear = inputYear - 1;
            correctedMonth = monthNum + 9;
        }
        var t = ((UT / 24.0) + inputDate + Math.floor(30.6 * correctedMonth + 0.5) + Math.floor(365.25 * (correctedYear - 1976)) - 8707.5) / 36525.0;
        var G = 357.528 + 35999.05 * t;
        G = NormalizeTo360(G);
        var C = (1.915 * Math.sin(G * degreesToRadians)) + (0.020 * Math.sin(2.0 * G * degreesToRadians));
        var L = 280.460 + (36000.770 * t) + C;
        L = NormalizeTo360(L);
        var alpha = L - 2.466 * Math.sin(2.0 * L * degreesToRadians) + 0.053 * Math.sin(4.0 * L * degreesToRadians);
        var GHA = UT * 15 - 180 - C + L - alpha;
        GHA = NormalizeTo360(GHA);
        var obliquity = 23.4393 - 0.013 * t;
        var declination = Math.atan(Math.tan(obliquity * degreesToRadians) * Math.sin(alpha * degreesToRadians)) * radiansToDegrees;
        f.outputDeclination.value = FormatFloatString(declination);
        var eotAdjustment = (L - C - alpha) / 15.0; // EOT adjustment in hours
        f.outputEOT.value = FormatFloatString(eotAdjustment);
        if (doableLSOT || doableClockTime) {
            var clockTimeToLSOTAdjustment = ((signedLongitude - meridian) / 15.0) - eotAdjustment + daylightAdjustment; // in hours
        }
        var solarHourAngle = 0;
        if (clockTimeInputMode) {
            solarHourAngle = GHA - signedLongitude;
        } else {
            solarHourAngle = 15 * (inputHoursAfterMidnight - 12);
        }
        solarHourAngle = NormalizeTo180(solarHourAngle);
        var apparentSolarTime = 0;
        if (clockTimeInputMode) {
            apparentSolarTime = NormalizeTo24(12 + solarHourAngle / 15.0);
        } else {
            apparentSolarTime = inputHoursAfterMidnight;
        }
        if (doableLSOT) {
            if (clockTimeInputMode) {
                solarMinutesAfterMidnight = inputMinutesAfterMidnight - (clockTimeToLSOTAdjustment * 60.0);
                var whichDay = 0;
                if (solarMinutesAfterMidnight < 0) { // it's the day before
                    solarMinutesAfterMidnight += 24 * 60;
                    whichDay = -1;
                }
                if (solarMinutesAfterMidnight >= 24 * 60) { // it's the next day
                    solarMinutesAfterMidnight -= 24 * 60;
                    whichDay = 1;
                }
            } else {
                solarMinutesAfterMidnight = inputMinutesAfterMidnight;
                whichDay = 0;
            }
            solarTime = MinutesToClockTime(solarMinutesAfterMidnight, inputAMPM);
            if (whichDay == "-1") f.outputLSOT.value = solarTime + "-";
            if (whichDay == "0") f.outputLSOT.value = solarTime;
            if (whichDay == "1") f.outputLSOT.value = solarTime + "+";
        } else {
            f.outputLSOT.value = "";
        }
        if (doableClockTime) {
            var clockMinutesAfterMidnight = inputMinutesAfterMidnight;
            if (lsotInputMode) {
                clockMinutesAfterMidnight = inputMinutesAfterMidnight + (clockTimeToLSOTAdjustment * 60.0);
            }
            var whichDay = 0;
            if (clockMinutesAfterMidnight < 0) { // it's the day before
                clockMinutesAfterMidnight += 24 * 60;
                whichDay = -1;
            }
            if (clockMinutesAfterMidnight >= 24 * 60) { // it's the next day
                clockMinutesAfterMidnight -= 24 * 60;
                whichDay = 1;
            }
            clockTime = MinutesToClockTime(clockMinutesAfterMidnight, inputAMPM);
            if (whichDay == "-1") f.outputClockTime.value = clockTime + "-";
            if (whichDay == "0") f.outputClockTime.value = clockTime;
            if (whichDay == "1") f.outputClockTime.value = clockTime + "+";
        } else {
            f.outputClockTime.value = "";
        }
        // hour angle
        if (doableHourAngle) {
            var hourAngle = (solarMinutesAfterMidnight - 12 * 60) / 4 * -1;
            f.outputHourAngle.value = FormatFloatString(hourAngle);
        } else {
            f.outputHourAngle.value = "";
        }
        // altitude angle
        if (doableAltitude) {
            var altitudeAngle = radiansToDegrees * ArcSin((Math.sin(signedLatitude * degreesToRadians) * Math.sin(declination * degreesToRadians)) - (Math.cos(signedLatitude * degreesToRadians) * Math.cos(declination * degreesToRadians) * Math.cos((solarHourAngle + 180) * degreesToRadians)));
            f.outputAltitude.value = FormatFloatString(altitudeAngle);
        } else {
            f.outputAltitude.value = "";
        }
        // azimuth angle
        if (doableAzimuth) {
            var preAzimuthAngle = radiansToDegrees * ArcCos((Math.cos(declination * degreesToRadians) * ((Math.cos(signedLatitude * degreesToRadians) * Math.tan(declination * degreesToRadians)) + (Math.sin(signedLatitude * degreesToRadians) * Math.cos((solarHourAngle + 180) * degreesToRadians)))) / Math.cos(altitudeAngle * degreesToRadians));
            if ((hourAngle > 0) && (hourAngle < 180)) {
                azimuthAngle = (360.0 - preAzimuthAngle) + (zeroAzimuth - 180.0);
            } else {
                azimuthAngle = preAzimuthAngle + (zeroAzimuth - 180.0);
            }
            f.outputAzimuth.value = FormatFloatString(azimuthAngle);
        } else {
            f.outputAzimuth.value = "";
        }
        // clock time of sunrise & sunset
        if (doableSunRiseSet) {
            var sunRiseSetLSoTMinutes = radiansToDegrees * ArcCos( - 1.0 * (Math.sin(signedLatitude * degreesToRadians) * Math.sin(declination * degreesToRadians) - Math.sin(( - 0.8333 - 0.0347 * Math.sqrt(inputElevation)) * degreesToRadians)) / Math.cos(signedLatitude * degreesToRadians) / Math.cos(declination * degreesToRadians)) * 4;
            f.outputSunrise.value = MinutesToClockTime((12 * 60 - sunRiseSetLSoTMinutes + (clockTimeToLSOTAdjustment * 60)), inputAMPM);
            f.outputSunset.value = MinutesToClockTime((12 * 60 + sunRiseSetLSoTMinutes + (clockTimeToLSOTAdjustment * 60)), inputAMPM);
        } else {
            f.outputSunrise.value = "";
            f.outputSunset.value = "";
        }
    // }
    // zero out form outputs if inputs were invalid
    // else {
    //     var f = document.theForm;
    //     f.outputAltitude.value = '';
    //     f.outputAzimuth.value = '';
    //     f.outputDeclination.value = '';
    //     f.outputEOT.value = '';
    //     f.outputClockTime.value = '';
    //     f.outputSunrise.value = '';
    //     f.outputSunset.value = '';
    //     f.outputLSOT.value = '';
    //     f.outputHourAngle.value = '';
    // }
}

function CheckInputs() {
    var error = false;
    var error_message = "注意！下面的输入必须予以纠正，才可以计算出太阳的角度:\n\n";
    var f = document.theForm;
    var inputLatitude = f.inputLatitude.value;
    var inputLongitude = f.inputLongitude.value;
    var inputTime = f.inputTime.value;
    // LATITUDE
    var latitudeOkay = false;
    if (inputLatitude.search("^[0-9]+[dD][0-9]+[mM][0-9]+[sS]$") > -1) {
        latitudeOkay = true;
    } else {
        if ((inputLatitude >= 0) && (inputLatitude <= 90)) {
            latitudeOkay = true;
        }
    }
    if (!latitudeOkay) {
        error_message = error_message + "* 纬度必须介于0到90度之间\n";
        error = true;
    }
    // LONGITUDE
    var longitudeOkay = false;
    if (inputLongitude.search("^[0-9]+[dD][0-9]+[mM][0-9]+[sS]$") > -1) {
        longitudeOkay = true;
    } else {
        if ((inputLongitude >= 0) && (inputLongitude <= 360)) {
            longitudeOkay = true;
        }
    }
    if (!longitudeOkay) {
        error_message = error_message + "* 经度必须介于0到360度之间\n";
        error = true;
    }
    // TIME
    if ((inputTime != '') && (inputTime.search("^[0-9]+:?[0-9][0-9]$") < 0)) {
        error_message = error_message + "* 时间必须是XX:XX或XXXX格式,如12点10分，填12:10或1210 \n";
        error = true;
    }
    // ALERT / RETURN
    if (error == true) {
        alert(error_message);
    }
    return (!error);
}