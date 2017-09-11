import React from 'react';
import Webiny from 'webiny';
import styles from './../Views/styles.css';


class InstallModal extends Webiny.Ui.ModalComponent {
    constructor(props) {
        super(props);

        this.state = {
            started: false,
            progress: 0,
            messages: []
        };

        this.bindMethods('startInstallation');
    }

    startInstallation() {
        const {Progress} = this.props;
        this.setState({started: true});
        const api = new Webiny.Api.Endpoint('/services/webiny/marketplace');
        let currentResponseLength = false;
        api.setConfig({
            downloadProgress: e => {
                let response = e.currentTarget.response || '';
                if (currentResponseLength === false) {
                    currentResponseLength = response.length;
                }
                else {
                    const newLength = response.length;
                    response = response.substring(currentResponseLength);
                    currentResponseLength = newLength;
                }

                const messages = this.state.messages;
                // We may receive multiple messages in a single line so we need to handle them using a delimiter
                response.split("_-_").filter(l => l.length).map(line => {
                    try {
                        const res = JSON.parse(line);
                        if (res.roles) {
                            Webiny.Model.set(['User', 'roles'], res.roles);
                        }

                        if (res.progress) {
                            const lastMessage = messages.length - 1;
                            messages[lastMessage].message = <Progress value={parseInt(res.progress)}/>;
                            this.setState({messages, progress: parseInt(res.progress), finished: res.progress === 100});
                        }

                        if (res.message) {
                            messages.push(res);
                            this.setState({messages, time: new Date().getTime()});
                        }
                    } catch (e) {

                    }
                });
            }
        });

        return api.get(`apps/${this.props.app.id}/install`).then(() => {
            if (this.state.finished) {
                const appName = this.props.app.localName + '.Backend';
                Webiny.includeApp(appName).then(app => app.run()).then(() => {
                    Webiny.Model.set(['Navigation', 'highlight'], appName);
                    Webiny.Router.start();
                    //this.hide();
                });
            }
        });
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        if (this.logger) {
            this.logger.scrollTop = 10000;
        }
    }

    show() {
        this.setState({messages: [], started: false, progress: 0, finished: false});
        return super.show();
    }

    renderDialog() {
        const {Modal, Button, Link, Grid, Logic, Alert} = this.props;

        return (
            <Modal.Dialog>
                <Modal.Content>
                    <Modal.Header onClose={this.hide} title="Install"/>
                    <Modal.Body>
                        <Logic.Hide if={this.state.started}>
                            <Alert type="warning" title="Notice">
                                Make sure your watch process is running before installing the app.
                            </Alert>
                            <div className="text-center">
                                <Button type="primary" label="Begin Installation" onClick={this.startInstallation}/>
                            </div>
                        </Logic.Hide>
                        <Logic.Hide if={!this.state.started}>
                            <Logic.Show if={this.state.finished}>
                                <Alert type="success" title="Done">
                                    Your app is installed and ready to use!
                                </Alert>
                            </Logic.Show>
                            <pre style={{height: 500, overflow: 'scroll', fontSize: 12}} ref={ref => this.logger = ref}>
                            {this.state.messages.map((m, i) => (
                                <div key={i}>{m.message}</div>
                            ))}
                            </pre>
                        </Logic.Hide>
                    </Modal.Body>
                    {this.state.finished && (
                        <Modal.Footer>
                            <Button align="right" label="Close" onClick={this.hide}/>
                        </Modal.Footer>
                    )}
                </Modal.Content>
            </Modal.Dialog>
        );
    }
}

export default Webiny.createComponent(InstallModal, {styles, modules: ['Modal', 'Button', 'Link', 'Grid', 'Logic', 'Alert', 'Progress']});