"use strict";
/*!
 * GeoFire is an open-source library that allows you to store and query a set
 * of keys based on their geographic location. At its heart, GeoFire simply
 * stores locations with string keys. Its main benefit, however, is the
 * possibility of retrieving only those keys within a given geographic area -
 * all in realtime.
 *
 * GeoFire 0.0.0
 * https://github.com/firebase/geofire-js/
 * License: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
var query_1 = require("./query");
var utils_1 = require("./utils");
/**
 * Creates a GeoFirestore instance.
 */
var GeoFirestore = /** @class */ (function () {
    /**
     * @param _collectionRef A Firestore Collection reference where the GeoFirestore data will be stored.
     */
    function GeoFirestore(_collectionRef) {
        this._collectionRef = _collectionRef;
        if (Object.prototype.toString.call(this._collectionRef) !== '[object Object]') {
            throw new Error('collectionRef must be an instance of a Firestore Collection');
        }
    }
    /********************/
    /*  PUBLIC METHODS  */
    /********************/
    /**
     * Returns a promise fulfilled with the location corresponding to the provided key.
     *
     * If the provided key does not exist, the returned promise is fulfilled with null.
     *
     * @param key The key of the location to retrieve.
     * @returns A promise that is fulfilled with the location of the given key.
     */
    GeoFirestore.prototype.get = function (key) {
        utils_1.validateKey(key);
        return this._collectionRef.doc(key).get().then(function (documentSnapshot) {
            if (!documentSnapshot.exists) {
                return null;
            }
            else {
                var snapshotVal = documentSnapshot.data();
                return utils_1.decodeGeoFireObject(snapshotVal);
            }
        });
    };
    ;
    /**
     * Returns the Firestore Collection used to create this GeoFirestore instance.
     *
     * @returns The Firestore Collection used to create this GeoFirestore instance.
     */
    GeoFirestore.prototype.ref = function () {
        return this._collectionRef;
    };
    ;
    /**
     * Removes the provided key from this GeoFirestore. Returns an empty promise fulfilled when the key has been removed.
     *
     * If the provided key is not in this GeoFirestore, the promise will still successfully resolve.
     *
     * @param key The key of the location to remove.
     * @returns A promise that is fulfilled after the inputted key is removed.
     */
    GeoFirestore.prototype.remove = function (key) {
        return this.set(key, null);
    };
    ;
    /**
     * Adds the provided key - location pair(s) to Firestore. Returns an empty promise which is fulfilled when the write is complete.
     *
     * If any provided key already exists in this GeoFirestore, it will be overwritten with the new location value.
     *
     * @param keyOrLocations The key representing the location to add or a mapping of key - location pairs which
     * represent the locations to add.
     * @param location The [latitude, longitude] pair to add.
     * @returns A promise that is fulfilled when the write is complete.
     */
    GeoFirestore.prototype.set = function (keyOrLocations, location) {
        var _this = this;
        if (typeof keyOrLocations === 'string' && keyOrLocations.length !== 0) {
            utils_1.validateKey(keyOrLocations);
            if (location === null) {
                // Setting location to null is valid since it will remove the key
                return this._collectionRef.doc(keyOrLocations).delete();
            }
            else {
                utils_1.validateLocation(location);
                var geohash = utils_1.encodeGeohash(location);
                return this._collectionRef.doc(keyOrLocations).set(utils_1.encodeGeoFireObject(location, geohash));
            }
        }
        else if (typeof keyOrLocations === 'object') {
            if (typeof location !== 'undefined') {
                throw new Error('The location argument should not be used if you pass an object to set().');
            }
        }
        else {
            throw new Error('keyOrLocations must be a string or a mapping of key - location pairs.');
        }
        var batch = this._collectionRef.firestore.batch();
        Object.keys(keyOrLocations).forEach(function (key) {
            utils_1.validateKey(key);
            var ref = _this._collectionRef.doc(key);
            var location = keyOrLocations[key];
            if (location === null) {
                batch.delete(ref);
            }
            else {
                utils_1.validateLocation(location);
                var geohash = utils_1.encodeGeohash(location);
                batch.set(ref, utils_1.encodeGeoFireObject(location, geohash), { merge: true });
            }
        });
        return batch.commit();
    };
    ;
    /**
     * Returns a new GeoQuery instance with the provided queryCriteria.
     *
     * @param queryCriteria The criteria which specifies the GeoQuery's center and radius.
     * @return A new GeoFirestoreQuery object.
     */
    GeoFirestore.prototype.query = function (queryCriteria) {
        return new query_1.GeoFirestoreQuery(this._collectionRef, queryCriteria);
    };
    ;
    /********************/
    /*  STATIC METHODS  */
    /********************/
    /**
     * Static method which calculates the distance, in kilometers, between two locations,
     * via the Haversine formula. Note that this is approximate due to the fact that the
     * Earth's radius varies between 6356.752 km and 6378.137 km.
     *
     * @param location1 The [latitude, longitude] pair of the first location.
     * @param location2 The [latitude, longitude] pair of the second location.
     * @returns The distance, in kilometers, between the inputted locations.
     */
    GeoFirestore.distance = function (location1, location2) {
        utils_1.validateLocation(location1);
        utils_1.validateLocation(location2);
        var radius = 6371; // Earth's radius in kilometers
        var latDelta = utils_1.degreesToRadians(location2[0] - location1[0]);
        var lonDelta = utils_1.degreesToRadians(location2[1] - location1[1]);
        var a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
            (Math.cos(utils_1.degreesToRadians(location1[0])) * Math.cos(utils_1.degreesToRadians(location2[0])) *
                Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c;
    };
    ;
    return GeoFirestore;
}());
exports.GeoFirestore = GeoFirestore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvZmlyZXN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dlb2ZpcmVzdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7R0FVRzs7QUFJSCxpQ0FBNEM7QUFDNUMsaUNBQW1JO0FBSW5JOztHQUVHO0FBQ0g7SUFDRTs7T0FFRztJQUNILHNCQUFvQixjQUFzRDtRQUF0RCxtQkFBYyxHQUFkLGNBQWMsQ0FBd0M7UUFDeEUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDOUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7SUFDSCxDQUFDO0lBRUQsc0JBQXNCO0lBQ3RCLHNCQUFzQjtJQUN0QixzQkFBc0I7SUFDdEI7Ozs7Ozs7T0FPRztJQUNJLDBCQUFHLEdBQVYsVUFBVyxHQUFXO1FBQ3BCLG1CQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLGdCQUFxRDtZQUNuRyxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBTSxXQUFXLEdBQWUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3hELE1BQU0sQ0FBQywyQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUEsQ0FBQztJQUVGOzs7O09BSUc7SUFDSSwwQkFBRyxH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