/**
 * This File is responsible for very basic pubsub implementation
 * This just serve the purpose the current usecase. If need any other feature, it might require a extension
 */

/**
 * Store to contain events
 * Events are represented as object
 * Event Interface
 * event: {
 *  event: string;
 *  callback: function;
 *  context: object
 * }
 */
const pubsub = {
    events: []
};

/**
 * Subscribe event
 * @param {string} event - Event name
 * @param {Function} callback - callback function
 * @param {object} context - context object for callback
 */
pubsub.subscribe = function (event, callback, context) {
    const subs = pubsub.events.filter(e => {
        return e.event === event
            && e.callback === callback
            && e.context === context
    });
    if(subs.length > 0) return;
    pubsub.events.push({
        event,
        callback,
        context
    })
}

/**
 * Publish event, it manages one to one and one to many based on target provided
 * @param {string} event - Event name
 * @param {object} target - Target for which event is launched (a one to one mapping)
 * @param {...string} data - data elements
 */
pubsub.publish = function(event, target, ...data) {
    const subs = pubsub.events.filter(e => {
        return e.event === event && target ? target.constructor.name === e.context.constructor.name : true;
    })
    subs.forEach(element => {
        element.callback.apply(element.context, [...data])
    });
}

export default pubsub;