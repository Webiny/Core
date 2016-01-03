class App {

    constructor(name) {
        this.name = name;
        this.modules = [];
    }

    addModules(modules) {
        this.modules = modules;
        return this;
    }

    setInitialElement(element) {
        this.element = element;
        return this;
    }

    run(mountPoint) {
        // Webiny.Console.groupCollapsed('App bootstrap');
        const promises = this.modules.map(x => WebinyBootstrap.import('Modules/' + x + '/Module'));
        this.modules = [];
        Promise.all(promises).then(modules => {
            modules.forEach(m => {
                const module = new m.default(this);
                module.run();
                this.modules.push(module);
            });
            // Webiny.Console.groupEnd();

            ReactDOM.render(this.element, mountPoint);
        });
    }
}

export default App;
