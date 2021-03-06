import chainedFunction from 'chained-function';
import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Button } from '../../components/Buttons';
import Modal from '../../components/Modal';
import i18n from '../../lib/i18n';
import portal from '../../lib/portal';
import Validation from '../../lib/react-validation';
import insertAtCaret from './insertAtCaret';
import variables from './variables';
import styles from './index.styl';

class EditMacro extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };
    fields = {
        name: null,
        content: null
    };

    render() {
        const { state, actions } = this.props;
        const { id, name, content } = { ...state.modal.params };

        return (
            <Modal
                onClose={actions.closeModal}
                size="md"
            >
                <Modal.Header>
                    <Modal.Title>
                        {i18n._('Edit Macro')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Validation.components.Form
                        ref={c => {
                            this.form = c;
                        }}
                        onSubmit={(event) => {
                            event.preventDefault();
                        }}
                    >
                        <div className="form-group">
                            <label>{i18n._('Macro Name')}</label>
                            <Validation.components.Input
                                ref={c => {
                                    this.fields.name = c;
                                }}
                                type="text"
                                className="form-control"
                                errorClassName="is-invalid-input"
                                containerClassName=""
                                name="name"
                                value={name}
                                validations={['required']}
                            />
                        </div>
                        <div className="form-group">
                            <div>
                                <label>{i18n._('Macro Commands')}</label>
                                <Dropdown
                                    id="edit-macro-dropdown"
                                    className="pull-right"
                                    onSelect={(eventKey) => {
                                        const textarea = ReactDOM.findDOMNode(this.fields.content).querySelector('textarea');
                                        if (textarea) {
                                            insertAtCaret(textarea, eventKey);
                                        }

                                        actions.updateModalParams({
                                            content: textarea.value
                                        });
                                    }}
                                    pullRight
                                >
                                    <Dropdown.Toggle
                                        className={styles.btnLink}
                                        style={{ boxShadow: 'none' }}
                                        useAnchor
                                        noCaret
                                    >
                                        <i className="fa fa-plus" />
                                        <span className="space" />
                                        {i18n._('Macro Variables')}
                                        <span className="space" />
                                        <i className="fa fa-caret-down" />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className={styles.macroVariablesDropdown}>
                                        {variables.map(v => {
                                            if (typeof v === 'object') {
                                                return (
                                                    <MenuItem
                                                        header={v.type === 'header'}
                                                        key={uniqueId()}
                                                    >
                                                        {v.text}
                                                    </MenuItem>
                                                );
                                            }

                                            return (
                                                <MenuItem
                                                    eventKey={v}
                                                    key={uniqueId()}
                                                >
                                                    {v}
                                                </MenuItem>
                                            );
                                        })}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                            <Validation.components.Textarea
                                ref={c => {
                                    this.fields.content = c;
                                }}
                                rows="10"
                                className="form-control"
                                errorClassName="is-invalid-input"
                                containerClassName=""
                                name="content"
                                value={content}
                                validations={['required']}
                            />
                        </div>
                    </Validation.components.Form>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="btn btn-danger pull-left"
                        onClick={() => {
                            const name = get(this.fields.name, 'state.value');

                            portal(({ onClose }) => (
                                <Modal onClose={onClose}>
                                    <Modal.Header>
                                        <Modal.Title>
                                            {i18n._('Delete Macro')}
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {i18n._('Are you sure you want to delete this macro?')}
                                        <p><strong>{name}</strong></p>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button onClick={onClose}>
                                            {i18n._('No')}
                                        </Button>
                                        <Button
                                            btnStyle="danger"
                                            onClick={chainedFunction(
                                                () => {
                                                    actions.deleteMacro(id);
                                                    actions.closeModal();
                                                },
                                                onClose
                                            )}
                                        >
                                            {i18n._('Yes')}
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            ));
                        }}
                    >
                        {i18n._('Delete')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-default"
                        onClick={() => {
                            actions.closeModal();
                        }}
                    >
                        {i18n._('Cancel')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            if (Object.keys(this.form.state.errors).length > 0) {
                                return;
                            }

                            this.form.validateAll();

                            if (Object.keys(this.form.state.errors).length > 0) {
                                return;
                            }

                            const name = get(this.fields.name, 'state.value');
                            const content = get(this.fields.content, 'state.value');

                            actions.updateMacro(id, { name, content });
                            actions.closeModal();
                        }}
                    >
                        {i18n._('Save Changes')}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default EditMacro;
