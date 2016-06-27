import Webiny from 'Webiny';
import ImageComponent from './../Base/ImageComponent';
import ImagePreview from './ImagePreview';
const Ui = Webiny.Ui.Components;

class Image extends ImageComponent {

    constructor(props) {
        super(props);

        this.bindMethods(
            'onDrop',
            'onDragOver',
            'onDragLeave',
            'getCropper'
        );
    }

    onDragOver(e) {
        e.preventDefault();
        this.setState({
            dragOver: true
        });
    }

    onDragLeave() {
        this.setState({
            dragOver: false
        });
    }

    onDrop(evt) {
        evt.preventDefault();
        evt.persist();

        this.setState({
            dragOver: false
        });

        this.refs.reader.readFiles(evt.dataTransfer.files);
    }

    renderError() {
        let error = null;
        if (this.state.error) {
            error = (
                <Ui.Alert type="error">{this.state.error.message}</Ui.Alert>
            );
        }
        return error;
    }

    getCropper(children = null) {
        const cropper = this.props.cropper;

        if (!cropper) {
            return null;
        }

        if (cropper.inline) {
            return (
                <Ui.Files.InlineFileCropper
                    title={cropper.title}
                    action={cropper.action}
                    onHidden={this.onCropperHidden}
                    onCrop={this.applyCropping}
                    config={cropper.config}
                    image={this.state.cropImage}>
                    {children}
                </Ui.Files.InlineFileCropper>
            );
        }

        return (
            <Ui.Files.ModalFileCropper
                title={cropper.title}
                action={cropper.action}
                onHidden={this.onCropperHidden}
                onCrop={this.applyCropping}
                config={cropper.config}
                image={this.state.cropImage}>
                {children}
            </Ui.Files.ModalFileCropper>
        );
    }
}

Image.defaultProps = {
    sizeLimit: 2485760,
    renderer() {
        let message = null;
        if (!this.props.valueLink.value) {
            message = (
                <div className="dz-default dz-message">
                    <span className="tray-bin__main-text">DRAG A FILE HERE</span>
                </div>
            );
        }

        const props = {
            onDrop: this.onDrop,
            onDragLeave: this.onDragLeave,
            onDragOver: this.onDragOver,
            onClick: this.getFiles
        };

        const css = {
            'tray-bin': true,
            'tray-bin--empty': !this.props.valueLink.value
        };

        let image = null;
        if (this.props.valueLink.value) {
            const imageProps = {
                image: this.props.valueLink.value,
                onEdit: this.editFile,
                onDelete: this.removeFile,
                onDragStart: this.onImageDragStart,
                onDragEnd: this.onImageDragEnd,
                onDragOver: this.onImageDragOver
            };

            image = (
                <ImagePreview {...imageProps}/>
            );
        }

        return (
            <div className="form-group">
                <div className={this.classSet(css)} {...props}>
                    {this.renderError()}
                    <div className="tray-bin__container">
                        {message}
                        {image}
                        <Ui.Files.FileReader
                            accept={this.props.accept}
                            ref="reader"
                            sizeLimit={this.props.sizeLimit}
                            onChange={this.fileChanged}/>
                        {this.getCropper()}
                    </div>
                    <div className="txt_b">
                        <span>Dragging not convenient?</span>&nbsp;
                        <a href="#" onClick={this.getFiles}>SELECT A FILE HERE</a>
                    </div>
                </div>
            </div>
        );
    }
};

export default Image;