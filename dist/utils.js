"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Default geohash length
exports.g_GEOHASH_PRECISION = 10;
// Characters used in location geohashes
exports.g_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
// The meridional circumference of the earth in meters
exports.g_EARTH_MERI_CIRCUMFERENCE = 40007860;
// Length of a degree latitude at the equator
exports.g_METERS_PER_DEGREE_LATITUDE = 110574;
// Number of bits per geohash character
exports.g_BITS_PER_CHAR = 5;
// Maximum length of a geohash in bits
exports.g_MAXIMUM_BITS_PRECISION = 22 * exports.g_BITS_PER_CHAR;
// Equatorial radius of the earth in meters
exports.g_EARTH_EQ_RADIUS = 6378137.0;
// The following value assumes a polar radius of
// const g_EARTH_POL_RADIUS = 6356752.3;
// The formulate to calculate g_E2 is
// g_E2 == (g_EARTH_EQ_RADIUS^2-g_EARTH_POL_RADIUS^2)/(g_EARTH_EQ_RADIUS^2)
// The exact value is used here to avoid rounding errors
exports.g_E2 = 0.00669447819799;
// Cutoff for rounding errors on double calculations
exports.g_EPSILON = 1e-12;
Math.log2 = Math.log2 || function (x) {
    return Math.log(x) / Math.log(2);
};
/**
 * Validates the inputted key and throws an error if it is invalid.
 *
 * @param key The key to be verified.
 */
function validateKey(key) {
    var error;
    if (typeof key !== 'string') {
        error = 'key must be a string';
    }
    else if (key.length === 0) {
        error = 'key cannot be the empty string';
    }
    else if (1 + exports.g_GEOHASH_PRECISION + key.length > 755) {
        // Firebase can only stored child paths up to 768 characters
        // The child path for this key is at the least: 'i/<geohash>key'
        error = 'key is too long to be stored in Firebase';
    }
    else if (/[\[\].#$\/\u0000-\u001F\u007F]/.test(key)) {
        // Firebase does not allow node keys to contain the following characters
        error = 'key cannot contain any of the following characters: . # $ ] [ /';
    }
    if (typeof error !== 'undefined') {
        throw new Error('Invalid GeoFire key \'' + key + '\': ' + error);
    }
}
exports.validateKey = validateKey;
;
/**
 * Validates the inputted location and throws an error if it is invalid.
 *
 * @param location The [latitude, longitude] pair to be verified.
 */
function validateLocation(location) {
    var error;
    if (!Array.isArray(location)) {
        error = 'location must be an array';
    }
    else if (location.length !== 2) {
        error = 'expected array of length 2, got length ' + location.length;
    }
    else {
        var latitude = location[0];
        var longitude = location[1];
        if (typeof latitude !== 'number' || isNaN(latitude)) {
            error = 'latitude must be a number';
        }
        else if (latitude < -90 || latitude > 90) {
            error = 'latitude must be within the range [-90, 90]';
        }
        else if (typeof longitude !== 'number' || isNaN(longitude)) {
            error = 'longitude must be a number';
        }
        else if (longitude < -180 || longitude > 180) {
            error = 'longitude must be within the range [-180, 180]';
        }
    }
    if (typeof error !== 'undefined') {
        throw new Error('Invalid GeoFire location \'' + location + '\': ' + error);
    }
}
exports.validateLocation = validateLocation;
;
/**
 * Validates the inputted geohash and throws an error if it is invalid.
 *
 * @param geohash The geohash to be validated.
 */
function validateGeohash(geohash) {
    var error;
    if (typeof geohash !== 'string') {
        error = 'geohash must be a string';
    }
    else if (geohash.length === 0) {
        error = 'geohash cannot be the empty string';
    }
    else {
        for (var _i = 0, geohash_1 = geohash; _i < geohash_1.length; _i++) {
            var letter = geohash_1[_i];
            if (exports.g_BASE32.indexOf(letter) === -1) {
                error = 'geohash cannot contain \'' + letter + '\'';
            }
        }
    }
    if (typeof error !== 'undefined') {
        throw new Error('Invalid GeoFire geohash \'' + geohash + '\': ' + error);
    }
}
exports.validateGeohash = validateGeohash;
;
/**
 * Validates the inputted query criteria and throws an error if it is invalid.
 *
 * @param newQueryCriteria The criteria which specifies the query's center and/or radius.
 * @param requireCenterAndRadius The criteria which center and radius required.
 */
function validateCriteria(newQueryCriteria, requireCenterAndRadius) {
    if (requireCenterAndRadius === void 0) { requireCenterAndRadius = false; }
    if (typeof newQueryCriteria !== 'object') {
        throw new Error('query criteria must be an object');
    }
    else if (typeof newQueryCriteria.center === 'undefined' && typeof newQueryCriteria.radius === 'undefined') {
        throw new Error('radius and/or center must be specified');
    }
    else if (requireCenterAndRadius && (typeof newQueryCriteria.center === 'undefined' || typeof newQueryCriteria.radius === 'undefined')) {
        throw new Error('query criteria for a new query must contain both a center and a radius');
    }
    // Throw an error if there are any extraneous attributes
    var keys = Object.keys(newQueryCriteria);
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        if (key !== 'center' && key !== 'radius') {
            throw new Error('Unexpected attribute \'' + key + '\' found in query criteria');
        }
    }
    // Validate the 'center' attribute
    if (typeof newQueryCriteria.center !== 'undefined') {
        validateLocation(newQueryCriteria.center);
    }
    // Validate the 'radius' attribute
    if (typeof newQueryCriteria.radius !== 'undefined') {
        if (typeof newQueryCriteria.radius !== 'number' || isNaN(newQueryCriteria.radius)) {
            throw new Error('radius must be a number');
        }
        else if (newQueryCriteria.radius < 0) {
            throw new Error('radius must be greater than or equal to 0');
        }
    }
}
exports.validateCriteria = validateCriteria;
;
/**
 * Converts degrees to radians.
 *
 * @param degrees The number of degrees to be converted to radians.
 * @returns The number of radians equal to the inputted number of degrees.
 */
function degreesToRadians(degrees) {
    if (typeof degrees !== 'number' || isNaN(degrees)) {
        throw new Error('Error: degrees must be a number');
    }
    return (degrees * Math.PI / 180);
}
exports.degreesToRadians = degreesToRadians;
;
/**
 * Generates a geohash of the specified precision/string length from the  [latitude, longitude]
 * pair, specified as an array.
 *
 * @param location The [latitude, longitude] pair to encode into a geohash.
 * @param precision The length of the geohash to create. If no precision is specified, the
 * global default is used.
 * @returns The geohash of the inputted location.
 */
function encodeGeohash(location, precision) {
    if (precision === void 0) { precision = exports.g_GEOHASH_PRECISION; }
    validateLocation(location);
    if (typeof precision !== 'undefined') {
        if (typeof precision !== 'number' || isNaN(precision)) {
            throw new Error('precision must be a number');
        }
        else if (precision <= 0) {
            throw new Error('precision must be greater than 0');
        }
        else if (precision > 22) {
            throw new Error('precision cannot be greater than 22');
        }
        else if (Math.round(precision) !== precision) {
            throw new Error('precision must be an integer');
        }
    }
    var latitudeRange = {
        min: -90,
        max: 90
    };
    var longitudeRange = {
        min: -180,
        max: 180
    };
    var hash = '';
    var hashVal = 0;
    var bits = 0;
    var even = 1;
    while (hash.length < precision) {
        var val = even ? location[1] : location[0];
        var range = even ? longitudeRange : latitudeRange;
        var mid = (range.min + range.max) / 2;
        if (val > mid) {
            hashVal = (hashVal << 1) + 1;
            range.min = mid;
        }
        else {
            hashVal = (hashVal << 1) + 0;
            range.max = mid;
        }
        even = !even;
        if (bits < 4) {
            bits++;
        }
        else {
            bits = 0;
            hash += exports.g_BASE32[hashVal];
            hashVal = 0;
        }
    }
    return hash;
}
exports.encodeGeohash = encodeGeohash;
;
/**
 * Calculates the number of degrees a given distance is at a given latitude.
 *
 * @param distance The distance to convert.
 * @param latitude The latitude at which to calculate.
 * @returns The number of degrees the distance corresponds to.
 */
function metersToLongitudeDegrees(distance, latitude) {
    var radians = degreesToRadians(latitude);
    var num = Math.cos(radians) * exports.g_EARTH_EQ_RADIUS * Math.PI / 180;
    var denom = 1 / Math.sqrt(1 - exports.g_E2 * Math.sin(radians) * Math.sin(radians));
    var deltaDeg = num * denom;
    if (deltaDeg < exports.g_EPSILON) {
        return distance > 0 ? 360 : 0;
    }
    else {
        return Math.min(360, distance / deltaDeg);
    }
}
exports.metersToLongitudeDegrees = metersToLongitudeDegrees;
;
/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the longitude at a
 * given latitude.
 *
 * @param resolution The desired resolution.
 * @param latitude The latitude used in the conversion.
 * @return The bits necessary to reach a given resolution, in meters.
 */
function longitudeBitsForResolution(resolution, latitude) {
    var degs = metersToLongitudeDegrees(resolution, latitude);
    return (Math.abs(degs) > 0.000001) ? Math.max(1, Math.log2(360 / degs)) : 1;
}
exports.longitudeBitsForResolution = longitudeBitsForResolution;
;
/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the latitude.
 *
 * @param resolution The bits necessary to reach a given resolution, in meters.
 * @returns Bits necessary to reach a given resolution, in meters, for the latitude.
 */
function latitudeBitsForResolution(resolution) {
    return Math.min(Math.log2(exports.g_EARTH_MERI_CIRCUMFERENCE / 2 / resolution), exports.g_MAXIMUM_BITS_PRECISION);
}
exports.latitudeBitsForResolution = latitudeBitsForResolution;
;
/**
 * Wraps the longitude to [-180,180].
 *
 * @param longitude The longitude to wrap.
 * @returns longitude The resulting longitude.
 */
function wrapLongitude(longitude) {
    if (longitude <= 180 && longitude >= -180) {
        return longitude;
    }
    var adjusted = longitude + 180;
    if (adjusted > 0) {
        return (adjusted % 360) - 180;
    }
    else {
        return 180 - (-adjusted % 360);
    }
}
exports.wrapLongitude = wrapLongitude;
;
/**
 * Calculates the maximum number of bits of a geohash to get a bounding box that is larger than a
 * given size at the given coordinate.
 *
 * @param coordinate The coordinate as a [latitude, longitude] pair.
 * @param size The size of the bounding box.
 * @returns The number of bits necessary for the geohash.
 */
function boundingBoxBits(coordinate, size) {
    var latDeltaDegrees = size / exports.g_METERS_PER_DEGREE_LATITUDE;
    var latitudeNorth = Math.min(90, coordinate[0] + latDeltaDegrees);
    var latitudeSouth = Math.max(-90, coordinate[0] - latDeltaDegrees);
    var bitsLat = Math.floor(latitudeBitsForResolution(size)) * 2;
    var bitsLongNorth = Math.floor(longitudeBitsForResolution(size, latitudeNorth)) * 2 - 1;
    var bitsLongSouth = Math.floor(longitudeBitsForResolution(size, latitudeSouth)) * 2 - 1;
    return Math.min(bitsLat, bitsLongNorth, bitsLongSouth, exports.g_MAXIMUM_BITS_PRECISION);
}
exports.boundingBoxBits = boundingBoxBits;
;
/**
 * Calculates eight points on the bounding box and the center of a given circle. At least one
 * geohash of these nine coordinates, truncated to a precision of at most radius, are guaranteed
 * to be prefixes of any geohash that lies within the circle.
 *
 * @param center The center given as [latitude, longitude].
 * @param radius The radius of the circle.
 * @returns The eight bounding box points.
 */
function boundingBoxCoordinates(center, radius) {
    var latDegrees = radius / exports.g_METERS_PER_DEGREE_LATITUDE;
    var latitudeNorth = Math.min(90, center[0] + latDegrees);
    var latitudeSouth = Math.max(-90, center[0] - latDegrees);
    var longDegsNorth = metersToLongitudeDegrees(radius, latitudeNorth);
    var longDegsSouth = metersToLongitudeDegrees(radius, latitudeSouth);
    var longDegs = Math.max(longDegsNorth, longDegsSouth);
    return [
        [center[0], center[1]],
        [center[0], wrapLongitude(center[1] - longDegs)],
        [center[0], wrapLongitude(center[1] + longDegs)],
        [latitudeNorth, center[1]],
        [latitudeNorth, wrapLongitude(center[1] - longDegs)],
        [latitudeNorth, wrapLongitude(center[1] + longDegs)],
        [latitudeSouth, center[1]],
        [latitudeSouth, wrapLongitude(center[1] - longDegs)],
        [latitudeSouth, wrapLongitude(center[1] + longDegs)]
    ];
}
exports.boundingBoxCoordinates = boundingBoxCoordinates;
;
/**
 * Calculates the bounding box query for a geohash with x bits precision.
 *
 * @param geohash The geohash whose bounding box query to generate.
 * @param bits The number of bits of precision.
 * @returns A [start, end] pair of geohashes.
 */
function geohashQuery(geohash, bits) {
    validateGeohash(geohash);
    var precision = Math.ceil(bits / exports.g_BITS_PER_CHAR);
    if (geohash.length < precision) {
        return [geohash, geohash + '~'];
    }
    geohash = geohash.substring(0, precision);
    var base = geohash.substring(0, geohash.length - 1);
    var lastValue = exports.g_BASE32.indexOf(geohash.charAt(geohash.length - 1));
    var significantBits = bits - (base.length * exports.g_BITS_PER_CHAR);
    var unusedBits = (exports.g_BITS_PER_CHAR - significantBits);
    // delete unused bits
    var startValue = (lastValue >> unusedBits) << unusedBits;
    var endValue = startValue + (1 << unusedBits);
    if (endValue > 31) {
        return [base + exports.g_BASE32[startValue], base + '~'];
    }
    else {
        return [base + exports.g_BASE32[startValue], base + exports.g_BASE32[endValue]];
    }
}
exports.geohashQuery = geohashQuery;
;
/**
 * Calculates a set of queries to fully contain a given circle. A query is a [start, end] pair
 * where any geohash is guaranteed to be lexiographically larger then start and smaller than end.
 *
 * @param center The center given as [latitude, longitude] pair.
 * @param radius The radius of the circle.
 * @return An array of geohashes containing a [start, end] pair.
 */
function geohashQueries(center, radius) {
    validateLocation(center);
    var queryBits = Math.max(1, boundingBoxBits(center, radius));
    var geohashPrecision = Math.ceil(queryBits / exports.g_BITS_PER_CHAR);
    var coordinates = boundingBoxCoordinates(center, radius);
    var queries = coordinates.map(function (coordinate) {
        return geohashQuery(encodeGeohash(coordinate, geohashPrecision), queryBits);
    });
    // remove duplicates
    return queries.filter(function (query, index) {
        return !queries.some(function (other, otherIndex) {
            return index > otherIndex && query[0] === other[0] && query[1] === other[1];
        });
    });
}
exports.geohashQueries = geohashQueries;
;
/**
 * Encodes a location and geohash as a GeoFire object.
 *
 * @param location The location as [latitude, longitude] pair.
 * @param geohash The geohash of the location.
 * @returns The location encoded as GeoFire object.
 */
function encodeGeoFireObject(location, geohash) {
    validateLocation(location);
    validateGeohash(geohash);
    return { '.priority': geohash, 'g': geohash, 'l': location };
}
exports.encodeGeoFireObject = encodeGeoFireObject;
/**
 * Decodes the location given as GeoFire object. Returns null if decoding fails.
 *
 * @param geoFireObj The location encoded as GeoFire object.
 * @returns The location as [latitude, longitude] pair or null if decoding fails.
 */
function decodeGeoFireObject(geoFireObj) {
    if (geoFireObj && 'l' in geoFireObj && Array.isArray(geoFireObj.l) && geoFireObj.l.length === 2) {
        return geoFireObj.l;
    }
    else {
        throw new Error('Unexpected location object encountered: ' + JSON.stringify(geoFireObj));
    }
}
exports.decodeGeoFireObject = decodeGeoFireObject;
/**
 * Returns the key of a Firebase snapshot across SDK versions.
 *
 * @param A Firebase snapshot.
 * @returns The Firebase snapshot's key.
 */
function geoFireGetKey(snapshot) {
    var key;
    if (typeof snapshot.key === 'string' || snapshot.key === null) {
        key = snapshot.key;
    }
    return key;
}
exports.geoFireGetKey = geoFireGetKey;
/**
 * Returns the id of a Firestore snapshot across SDK versions.
 *
 * @param A Firestore snapshot.
 * @returns The Firestore snapshot's id.
 */
function geoFirestoreGetKey(snapshot) {
    var id;
    if (typeof snapshot.id === 'string' || snapshot.id === null) {
        id = snapshot.id;
    }
    return id;
}
exports.geoFirestoreGetKey = geoFirestoreGetKey;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSx5QkFBeUI7QUFDWixRQUFBLG1CQUFtQixHQUFXLEVBQUUsQ0FBQztBQUU5Qyx3Q0FBd0M7QUFDM0IsUUFBQSxRQUFRLEdBQVcsa0NBQWtDLENBQUM7QUFFbkUsc0RBQXNEO0FBQ3pDLFFBQUEsMEJBQTBCLEdBQVcsUUFBUSxDQUFDO0FBRTNELDZDQUE2QztBQUNoQyxRQUFBLDRCQUE0QixHQUFXLE1BQU0sQ0FBQztBQUUzRCx1Q0FBdUM7QUFDMUIsUUFBQSxlQUFlLEdBQVcsQ0FBQyxDQUFDO0FBRXpDLHNDQUFzQztBQUN6QixRQUFBLHdCQUF3QixHQUFXLEVBQUUsR0FBRyx1QkFBZSxDQUFDO0FBRXJFLDJDQUEyQztBQUM5QixRQUFBLGlCQUFpQixHQUFXLFNBQVMsQ0FBQztBQUVuRCxnREFBZ0Q7QUFDaEQsd0NBQXdDO0FBQ3hDLHFDQUFxQztBQUNyQywyRUFBMkU7QUFDM0Usd0RBQXdEO0FBQzNDLFFBQUEsSUFBSSxHQUFXLGdCQUFnQixDQUFDO0FBRTdDLG9EQUFvRDtBQUN2QyxRQUFBLFNBQVMsR0FBVyxLQUFLLENBQUM7QUFFdkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLFVBQVUsQ0FBQztJQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxxQkFBNEIsR0FBVztJQUNyQyxJQUFJLEtBQWEsQ0FBQztJQUVsQixFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzVCLEtBQUssR0FBRyxzQkFBc0IsQ0FBQztJQUNqQyxDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FB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