"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a GeoCallbackRegistration instance.
 */
var GeoCallbackRegistration = /** @class */ (function () {
    /**
     * @param _cancelCallback Callback to run when this callback registration is cancelled.
     */
    function GeoCallbackRegistration(_cancelCallback) {
        this._cancelCallback = _cancelCallback;
        if (Object.prototype.toString.call(this._cancelCallback) !== '[object Function]') {
            throw new Error('callback must be a function');
        }
    }
    /********************/
    /*  PUBLIC METHODS  */
    /********************/
    /**
     * Cancels this callback registration so that it no longer fires its callback. This
     * has no effect on any other callback registrations you may have created.
     */
    GeoCallbackRegistration.prototype.cancel = function () {
        if (typeof this._cancelCallback !== 'undefined') {
            this._cancelCallback();
            this._cancelCallback = undefined;
        }
    };
    return GeoCallbackRegistration;
}());
exports.GeoCallbackRegistration = GeoCallbackRegistration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbGJhY2tSZWdpc3RyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY2FsbGJhY2tSZWdpc3RyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7R0FFRztBQUNIO0lBQ0U7O09BRUc7SUFDSCxpQ0FBb0IsZUFBeUI7UUFBekIsb0JBQWUsR0FBZixlQUFlLENBQVU7UUFDM0MsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDakYsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBQ2pELENBQUM7SUFDSCxDQUFDO0lBRUQsc0JBQXNCO0lBQ3RCLHNCQUFzQjtJQUN0QixzQkFBc0I7SUFDdEI7OztPQUdHO0lBQ0ksd0NBQU0sR0FBYjtRQUNFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLGVBQWUsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztRQUNuQyxDQUFDO0lBQ0gsQ0FBQztJQUNILDhCQUFDO0FBQUQsQ0FBQyxBQXZCRCxJQXVCQztBQXZCWSwwREFBdUIifQ==