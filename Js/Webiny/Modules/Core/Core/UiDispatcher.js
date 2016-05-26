const container = {};

/**
 * UiDispatcher class keeps references to instances of React components globally, no matter the app or module.
 *
 * It allows us to expose public UI API and let developers implement different interactions between modules.
 * Every component that has a 'ui' attribute on it will automatically register itself on 'componentWillMount'
 * and unregister on 'componentWillUnmount' events.
 */
class UiDispatcher {

    debug() {
        console.log(container);
    }

    register(name, instance) {
        if (_.has(container, name)) {
            return console.warn(`Component name '${name}' is already registered!`);
        }
        container[name] = instance;
        return this;
    }

    unregister(name) {
        delete container[name];
        return this;
    }

    get(name) {
        return container[name];
    }

    eq(key, value) {
        const _this = this;
        return function eq() {
            const parts = _.split(key, '.');
            const name = parts.shift();
            return _.get(_this.get(name), parts.join('.')) === value;
        };
    }

    value(key) {
        const _this = this;
        return function value() {
            const parts = _.split(key, '.');
            const name = parts.shift();
            return _.get(_this.get(name), parts.join('.'));
        };
    }

    createSignal(_this, call, params) {
        return function executeSignal() {
            let callable = null;
            let component = null;
            if (_.isFunction(call)) {
                callable = call;
            } else {
                const [name, method] = call.split(':');
                component = name === 'this' ? _this : _.get(container, name);

                if (!component) {
                    return null;
                }
                callable = component[method];
            }

            // TODO: see if this is necessary at all!!!!
            const signalParams = [];
            _.each(params, p => {
                if (_.startsWith(p, '@')) {
                    // Extract parameter definition
                    const param = _.trimStart(p, '@');
                    if (p.indexOf(':') < 0) {
                        signalParams.push(_.get(container, param));
                    } else {
                        const [name, method] = param.split(':');
                        signalParams.push(container[name][method]);
                    }
                } else {
                    signalParams.push(p);
                }
            });

            let args = arguments;
            if (signalParams.length) {
                args = signalParams;
            }

            return Q(callable(...args)).then(result => result);
        };
    }
}

export default new UiDispatcher;
