const pubsub = {
    events: []
};

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

pubsub.publish = function(event, target, ...data) {
    const subs = pubsub.events.filter(e => {
        return e.event === event && target ? target.constructor.name === e.context.constructor.name : true;
    })
    console.log(subs);
    subs.forEach(element => {
        element.callback.apply(element.context, [...data])
    });
}

export default pubsub;