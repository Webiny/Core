import Webiny from 'Webiny';
import Radio from './Radio';
import styles from './styles.css';

class RadioGroup extends Webiny.Ui.OptionComponent {
    constructor(props) {
        super(props);

        this.bindMethods('renderOptions');
    }

    shouldComponentUpdate(nextProps, nextState){
        const propsChanged = !_.isEqual(nextProps.options, this.props.options) || !_.isEqual(nextProps.value, this.props.value);
        const stateChanged = !_.isEqual(nextState.options, this.state.options);
        return propsChanged || stateChanged;
    }

    /**
     * Render options elements
     *
     * Callback parameter is used when you need to implement a custom renderer and optionally wrap each option element with custom markup
     *
     * @returns {Array}
     */
    renderOptions(callback = null) {
        return this.state.options.map((item, key) => {
            let checked = false;
            if (_.isPlainObject(this.props.value)) {
                checked = _.get(this.props.value, this.props.valueKey) === item.id;
            } else {
                checked = this.props.value === item.id;
            }

            const props = {
                key,
                grid: this.props.grid,
                label: item.text,
                disabled: this.isDisabled(),
                value: item,
                checked,
                onChange: newValue => {
                    this.props.onChange(this.props.useDataAsValue ? newValue.data : newValue[this.props.valueAttr], this.validate);
                }
            };

            if (this.props.radioRenderer) {
                props.renderer = this.props.radioRenderer;
            }

            const radio = <Radio {...props}/>;

            if (callback) {
                return callback(radio, key);
            }

            return radio;
        });
    }
}

RadioGroup.defaultProps = _.merge({}, Webiny.Ui.OptionComponent.defaultProps, {
    radioRenderer: null,
    renderer() {
        const {FormGroup, styles} = this.props;

        return (
            <FormGroup className={this.classSet(this.props.className, (this.props.disabled && styles.disabled))}>
                {this.renderLabel()}
                <div className="clearfix"/>
                {this.renderOptions()}
                {this.renderValidationMessage()}
            </FormGroup>
        );
    }
});

export default Webiny.createComponent(RadioGroup, {modules:['FormGroup'], styles});